import { jest } from "@jest/globals";
import Counter from "../../database/models/Counter.js";
import Branch from "../../database/models/Branch.js";

jest.unstable_mockModule("../../core/pagination.js", () => ({
  getPagination: jest.fn(() => ({ skip: 0, perPage: 10 })),
}));

let counterService;
let pagination;

beforeAll(async () => {
  pagination = await import("../../core/pagination.js");
  counterService = await import("../../modules/counter/service.js");
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe("Counter Service (Unit) - ESM", () => {
  describe("createCounter()", () => {
    it("should throw 404 if branch not found", async () => {
      jest.spyOn(Branch, "findById").mockResolvedValue(null);

      await expect(
        counterService.createCounter({
          branchId: "b1",
          name: "Counter 1",
          code: "C1",
        })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("should throw 409 if counter code already exists in the same branch", async () => {
      jest.spyOn(Branch, "findById").mockResolvedValue({ _id: "b1" });
      jest.spyOn(Counter, "findOne").mockResolvedValue({ _id: "c1" });

      await expect(
        counterService.createCounter({
          branchId: "b1",
          name: "Counter 1",
          code: "C1",
        })
      ).rejects.toMatchObject({ statusCode: 409 });

      expect(Counter.findOne).toHaveBeenCalledWith({
        branch: "b1",
        code: "C1",
      });
    });

    it("should create counter and trim name/code", async () => {
      jest.spyOn(Branch, "findById").mockResolvedValue({ _id: "b1" });
      jest.spyOn(Counter, "findOne").mockResolvedValue(null);

      const created = { _id: "c1", name: "Counter 1", code: "C1" };
      jest.spyOn(Counter, "create").mockResolvedValue(created);

      const result = await counterService.createCounter({
        branchId: "b1",
        name: "  Counter 1  ",
        code: "  C1  ",
        services: ["S1"],
      });

      expect(Counter.create).toHaveBeenCalledWith({
        branch: "b1",
        name: "Counter 1",
        code: "C1",
        services: ["S1"],
      });

      expect(result).toBe(created);
    });
  });

  describe("listCounters()", () => {
    it("should apply filters + pagination + return items & pagination", async () => {
      pagination.getPagination.mockReturnValue({ skip: 0, perPage: 2 });

      const chain = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockResolvedValue([{ _id: "c1" }, { _id: "c2" }]),
      };
      jest.spyOn(Counter, "find").mockReturnValue(chain);
      jest.spyOn(Counter, "countDocuments").mockResolvedValue(5);

      const res = await counterService.listCounters({
        page: 1,
        limit: 2,
        branchId: "b1",
        isActive: "true",
        search: "C",
      });

      expect(Counter.find).toHaveBeenCalled();
      expect(res).toMatchObject({
        items: [{ _id: "c1" }, { _id: "c2" }],
        pagination: { page: 1, limit: 2, total: 5, pages: 3 },
      });
    });
  });

  describe("getCounterById()", () => {
    it("should throw 404 if not found", async () => {
      const chain = { populate: jest.fn().mockResolvedValue(null) };
      jest.spyOn(Counter, "findById").mockReturnValue(chain);

      await expect(counterService.getCounterById("c1")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("should return counter if found", async () => {
      const chain = {
        populate: jest.fn().mockResolvedValue({ _id: "c1", name: "C1" }),
      };
      jest.spyOn(Counter, "findById").mockReturnValue(chain);

      const res = await counterService.getCounterById("c1");
      expect(res).toMatchObject({ _id: "c1", name: "C1" });
    });
  });

  describe("updateCounter()", () => {
    it("should throw 404 if counter not found", async () => {
      jest.spyOn(Counter, "findById").mockResolvedValue(null);

      await expect(
        counterService.updateCounter("c1", { name: "New" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("should throw 409 if updating code duplicates in same branch", async () => {
      const counterDoc = {
        _id: "c1",
        branch: "b1",
        save: jest.fn(),
      };
      jest.spyOn(Counter, "findById").mockResolvedValue(counterDoc);
      jest.spyOn(Counter, "findOne").mockResolvedValue({ _id: "dup" });

      await expect(
        counterService.updateCounter("c1", { code: "X1" })
      ).rejects.toMatchObject({ statusCode: 409 });

      expect(Counter.findOne).toHaveBeenCalledWith({
        _id: { $ne: "c1" },
        branch: "b1",
        code: "X1",
      });
    });

    it("should update allowed fields and save", async () => {
      const counterDoc = {
        _id: "c1",
        branch: "b1",
        name: "Old",
        code: "OLD",
        isActive: true,
        services: [],
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Counter, "findById").mockResolvedValue(counterDoc);
      jest.spyOn(Counter, "findOne").mockResolvedValue(null);

      const res = await counterService.updateCounter("c1", {
        name: "  New  ",
        code: "  N1  ",
        isActive: false,
        services: ["S1"],
      });

      expect(counterDoc.name).toBe("New");
      expect(counterDoc.code).toBe("N1");
      expect(counterDoc.isActive).toBe(false);
      expect(counterDoc.services).toEqual(["S1"]);
      expect(counterDoc.save).toHaveBeenCalled();

      expect(res).toBe(counterDoc);
    });
  });

  describe("setCounterStatus()", () => {
    it("should throw 404 if counter not found", async () => {
      jest.spyOn(Counter, "findById").mockResolvedValue(null);

      await expect(counterService.setCounterStatus("c1", true)).rejects.toMatchObject(
        { statusCode: 404 }
      );
    });

    it("should update isActive and save", async () => {
      const counterDoc = {
        isActive: false,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Counter, "findById").mockResolvedValue(counterDoc);

      const res = await counterService.setCounterStatus("c1", true);
      expect(counterDoc.isActive).toBe(true);
      expect(counterDoc.save).toHaveBeenCalled();
      expect(res).toBe(counterDoc);
    });
  });

  describe("deleteCounter()", () => {
    it("should throw 404 if counter not found", async () => {
      jest.spyOn(Counter, "findById").mockResolvedValue(null);

      await expect(counterService.deleteCounter("c1")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("should soft delete by setting isActive=false", async () => {
      const counterDoc = {
        isActive: true,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Counter, "findById").mockResolvedValue(counterDoc);

      const res = await counterService.deleteCounter("c1");
      expect(counterDoc.isActive).toBe(false);
      expect(counterDoc.save).toHaveBeenCalled();
      expect(res).toBe(counterDoc);
    });
  });
});
