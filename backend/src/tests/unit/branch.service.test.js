import { jest } from "@jest/globals";
import Branch from "../../database/models/Branch.js";

let branchService;

beforeAll(async () => {
  branchService = await import("../../modules/branch/service.js");
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe("Branch Service (Unit) - ESM", () => {
  describe("createBranchService()", () => {
    it("should throw 409 if branch code already exists (case-insensitive)", async () => {
      jest.spyOn(Branch, "findOne").mockResolvedValue({ _id: "b1" });

      await expect(
        branchService.createBranchService({
          name: "Main",
          code: "col",
          address: "No 1",
          city: "Colombo",
          contactNumber: "0771234567",
        })
      ).rejects.toMatchObject({ statusCode: 409 });

      expect(Branch.findOne).toHaveBeenCalledWith({ code: "COL" });
    });

    it("should create branch when code is unique", async () => {
      jest.spyOn(Branch, "findOne").mockResolvedValue(null);

      const created = {
        _id: "b1",
        name: "Main",
        code: "COL",
        address: "No 1",
        city: "Colombo",
        contactNumber: "0771234567",
      };

      jest.spyOn(Branch, "create").mockResolvedValue(created);

      const result = await branchService.createBranchService({
        name: "Main",
        code: "col",
        address: "No 1",
        city: "Colombo",
        contactNumber: "0771234567",
      });

      expect(Branch.create).toHaveBeenCalledWith({
        name: "Main",
        code: "col", // service passes original; DB/schema may uppercase or store as given
        address: "No 1",
        city: "Colombo",
        contactNumber: "0771234567",
      });

      expect(result).toBe(created);
    });
  });

  describe("getBranchesService()", () => {
    it("should filter isActive=true when query has isActive='true'", async () => {
      const q = { sort: jest.fn().mockResolvedValue([{ _id: "b1" }]) };
      jest.spyOn(Branch, "find").mockReturnValue(q);

      const result = await branchService.getBranchesService({ isActive: "true" });

      expect(Branch.find).toHaveBeenCalledWith({ isActive: true });
      expect(result).toEqual([{ _id: "b1" }]);
    });

    it("should filter isActive=false when query has isActive='false'", async () => {
      const q = { sort: jest.fn().mockResolvedValue([{ _id: "b2" }]) };
      jest.spyOn(Branch, "find").mockReturnValue(q);

      const result = await branchService.getBranchesService({ isActive: "false" });

      expect(Branch.find).toHaveBeenCalledWith({ isActive: false });
      expect(result).toEqual([{ _id: "b2" }]);
    });

    it("should return all branches when no filters provided", async () => {
      const q = { sort: jest.fn().mockResolvedValue([{ _id: "b3" }]) };
      jest.spyOn(Branch, "find").mockReturnValue(q);

      const result = await branchService.getBranchesService();

      expect(Branch.find).toHaveBeenCalledWith({});
      expect(result).toEqual([{ _id: "b3" }]);
    });
  });

  describe("getBranchByIdService()", () => {
    it("should throw 404 if branch not found", async () => {
      jest.spyOn(Branch, "findById").mockResolvedValue(null);

      await expect(branchService.getBranchByIdService("b1")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("should return branch if found", async () => {
      jest.spyOn(Branch, "findById").mockResolvedValue({ _id: "b1", code: "COL" });

      const result = await branchService.getBranchByIdService("b1");
      expect(result).toMatchObject({ _id: "b1", code: "COL" });
    });
  });

  describe("updateBranchService()", () => {
    it("should throw 409 if updating code duplicates another branch (case-insensitive)", async () => {
      jest.spyOn(Branch, "findOne").mockResolvedValue({ _id: "other" });

      await expect(
        branchService.updateBranchService("b1", { code: "col" })
      ).rejects.toMatchObject({ statusCode: 409 });

      expect(Branch.findOne).toHaveBeenCalledWith({
        _id: { $ne: "b1" },
        code: "COL",
      });
    });

    it("should throw 404 if branch not found on update", async () => {
      jest.spyOn(Branch, "findOne").mockResolvedValue(null);
      jest.spyOn(Branch, "findByIdAndUpdate").mockResolvedValue(null);

      await expect(
        branchService.updateBranchService("b1", { name: "New" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("should update branch and return updated doc", async () => {
      jest.spyOn(Branch, "findOne").mockResolvedValue(null);
      jest.spyOn(Branch, "findByIdAndUpdate").mockResolvedValue({ _id: "b1", name: "New" });

      const result = await branchService.updateBranchService("b1", { name: "New" });

      expect(Branch.findByIdAndUpdate).toHaveBeenCalledWith(
        "b1",
        { name: "New" },
        { new: true, runValidators: true }
      );

      expect(result).toMatchObject({ _id: "b1", name: "New" });
    });
  });

  describe("deactivateBranchService()", () => {
    it("should throw 404 if branch not found", async () => {
      jest.spyOn(Branch, "findByIdAndUpdate").mockResolvedValue(null);

      await expect(branchService.deactivateBranchService("b1")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("should set isActive=false and return branch", async () => {
      jest
        .spyOn(Branch, "findByIdAndUpdate")
        .mockResolvedValue({ _id: "b1", isActive: false });

      const result = await branchService.deactivateBranchService("b1");

      expect(Branch.findByIdAndUpdate).toHaveBeenCalledWith(
        "b1",
        { isActive: false },
        { new: true }
      );
      expect(result).toMatchObject({ _id: "b1", isActive: false });
    });
  });
});
