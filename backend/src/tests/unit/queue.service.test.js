import { jest } from "@jest/globals";

import Branch from "../../database/models/Branch.js";
import Counter from "../../database/models/Counter.js";
import Queue from "../../database/models/Queue.js";
import Token from "../../database/models/Token.js";

import { TOKEN_STATUS, QUEUE_STATUS } from "../../core/constants.js";

jest.unstable_mockModule("mongoose", () => ({
  default: {
    startSession: jest.fn(),
  },
}));

let mongoose;
let queueService;

beforeAll(async () => {
  mongoose = (await import("mongoose")).default;
  queueService = await import("../../modules/queue/service.js");
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe("Queue Service (Unit) - aligned with OPEN/CLOSED + status transitions", () => {
  describe("openQueue()", () => {
    it("throws 404 if branch not found", async () => {
      jest.spyOn(Branch, "findById").mockResolvedValue(null);

      await expect(
        queueService.openQueue({ branchId: "b1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("returns existing OPEN queue for today", async () => {
      jest.spyOn(Branch, "findById").mockResolvedValue({ _id: "b1" });
      jest
        .spyOn(Queue, "findOne")
        .mockResolvedValue({ _id: "q1", status: QUEUE_STATUS.OPEN });

      const res = await queueService.openQueue({ branchId: "b1", userId: "u1" });
      expect(res).toMatchObject({ _id: "q1", status: QUEUE_STATUS.OPEN });
    });

    it("creates a new OPEN queue if none exists today", async () => {
      jest.spyOn(Branch, "findById").mockResolvedValue({ _id: "b1" });
      jest.spyOn(Queue, "findOne").mockResolvedValue(null);
      jest
        .spyOn(Queue, "create")
        .mockResolvedValue({ _id: "q2", status: QUEUE_STATUS.OPEN });

      const res = await queueService.openQueue({ branchId: "b1", userId: "u1" });
      expect(res).toMatchObject({ _id: "q2", status: QUEUE_STATUS.OPEN });
    });
  });

  describe("closeQueue()", () => {
    it("throws 404 if no OPEN queue found", async () => {
      jest.spyOn(Queue, "findOne").mockResolvedValue(null);

      await expect(
        queueService.closeQueue({ branchId: "b1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("closes OPEN queue and saves", async () => {
      const queueDoc = {
        status: QUEUE_STATUS.OPEN,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Queue, "findOne").mockResolvedValue(queueDoc);

      const res = await queueService.closeQueue({ branchId: "b1", userId: "u1" });

      expect(queueDoc.status).toBe(QUEUE_STATUS.CLOSED);
      expect(queueDoc.save).toHaveBeenCalled();
      expect(res).toBe(queueDoc);
    });
  });

  describe("getActiveQueue()", () => {
    it("throws 404 if no OPEN queue found", async () => {
      const chain = { populate: jest.fn().mockResolvedValue(null) };
      jest.spyOn(Queue, "findOne").mockReturnValue(chain);

      await expect(queueService.getActiveQueue("b1")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("returns OPEN queue", async () => {
      const chain = {
        populate: jest.fn().mockResolvedValue({ _id: "q1", status: QUEUE_STATUS.OPEN }),
      };
      jest.spyOn(Queue, "findOne").mockReturnValue(chain);

      const res = await queueService.getActiveQueue("b1");
      expect(res).toMatchObject({ _id: "q1", status: QUEUE_STATUS.OPEN });
    });
  });

  describe("callNextToken()", () => {
    const makeSession = () => ({
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      abortTransaction: jest.fn(),
      endSession: jest.fn(),
    });

    it("throws 404 if counter not found", async () => {
      jest.spyOn(Counter, "findById").mockResolvedValue(null);

      await expect(
        queueService.callNextToken({ branchId: "b1", counterId: "c1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("throws 400 if counter does not belong to this branch", async () => {
      jest.spyOn(Counter, "findById").mockResolvedValue({
        _id: "c1",
        branch: "OTHER",
        isActive: true,
      });

      await expect(
        queueService.callNextToken({ branchId: "b1", counterId: "c1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("throws 400 if counter is inactive", async () => {
      jest.spyOn(Counter, "findById").mockResolvedValue({
        _id: "c1",
        branch: "b1",
        isActive: false,
      });

      await expect(
        queueService.callNextToken({ branchId: "b1", counterId: "c1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("throws 404 if no OPEN queue today", async () => {
      jest.spyOn(Counter, "findById").mockResolvedValue({
        _id: "c1",
        branch: "b1",
        isActive: true,
      });
      jest.spyOn(Queue, "findOne").mockResolvedValue(null);

      await expect(
        queueService.callNextToken({ branchId: "b1", counterId: "c1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("throws 404 if no WAITING tokens", async () => {
      jest.spyOn(Counter, "findById").mockResolvedValue({
        _id: "c1",
        branch: "b1",
        isActive: true,
      });

      jest.spyOn(Queue, "findOne").mockResolvedValue({ _id: "q1", save: jest.fn() });

      const session = makeSession();
      mongoose.startSession.mockResolvedValue(session);

      const tokenQuery = {
        sort: jest.fn().mockReturnThis(),
        session: jest.fn().mockResolvedValue(null),
      };
      jest.spyOn(Token, "findOne").mockReturnValue(tokenQuery);

      await expect(
        queueService.callNextToken({ branchId: "b1", counterId: "c1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 404 });

      expect(session.abortTransaction).toHaveBeenCalled();
    });

    it("sets token to CALLING and updates queue.currentToken", async () => {
      jest.spyOn(Counter, "findById").mockResolvedValue({
        _id: "c1",
        branch: "b1",
        isActive: true,
      });

      const queueDoc = {
        _id: "q1",
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Queue, "findOne").mockResolvedValue(queueDoc);

      const session = makeSession();
      mongoose.startSession.mockResolvedValue(session);

      const tokenDoc = {
        _id: "t1",
        status: TOKEN_STATUS.WAITING,
        save: jest.fn().mockResolvedValue(true),
      };

      const tokenQuery = {
        sort: jest.fn().mockReturnThis(),
        session: jest.fn().mockResolvedValue(tokenDoc),
      };
      jest.spyOn(Token, "findOne").mockReturnValue(tokenQuery);

      // ✅ FIXED populate chain: .populate().populate()
      const populated = { _id: "t1", status: TOKEN_STATUS.CALLING };
      const pop2 = { populate: jest.fn().mockResolvedValue(populated) };
      const pop1 = { populate: jest.fn().mockReturnValue(pop2) };
      jest.spyOn(Token, "findById").mockReturnValue(pop1);

      const res = await queueService.callNextToken({
        branchId: "b1",
        counterId: "c1",
        userId: "u1",
      });

      expect(tokenDoc.status).toBe(TOKEN_STATUS.CALLING);
      expect(tokenDoc.save).toHaveBeenCalled();

      expect(queueDoc.currentToken).toBe("t1");
      expect(queueDoc.save).toHaveBeenCalled();

      expect(session.commitTransaction).toHaveBeenCalled();
      expect(res).toMatchObject({ _id: "t1", status: TOKEN_STATUS.CALLING });
    });
  });

  describe("markServing()", () => {
    it("throws 404 if token not found", async () => {
      jest.spyOn(Token, "findById").mockResolvedValue(null);

      await expect(
        queueService.markServing({ tokenId: "t1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("throws 400 if invalid transition", async () => {
      jest.spyOn(Token, "findById").mockResolvedValue({ status: TOKEN_STATUS.WAITING });

      await expect(
        queueService.markServing({ tokenId: "t1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("marks SERVING from CALLING", async () => {
      const tokenDoc = {
        status: TOKEN_STATUS.CALLING,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Token, "findById").mockResolvedValue(tokenDoc);

      const res = await queueService.markServing({ tokenId: "t1", userId: "u1" });

      expect(tokenDoc.status).toBe(TOKEN_STATUS.SERVING);
      expect(tokenDoc.save).toHaveBeenCalled();
      expect(res).toBe(tokenDoc);
    });
  });

  describe("markSkipped()", () => {
    it("throws 404 if token not found", async () => {
      jest.spyOn(Token, "findById").mockResolvedValue(null);

      await expect(
        queueService.markSkipped({ tokenId: "t1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("throws 400 if invalid transition", async () => {
      jest.spyOn(Token, "findById").mockResolvedValue({ status: TOKEN_STATUS.SERVING });

      await expect(
        queueService.markSkipped({ tokenId: "t1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("marks SKIPPED from CALLING", async () => {
      const tokenDoc = {
        status: TOKEN_STATUS.CALLING,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Token, "findById").mockResolvedValue(tokenDoc);

      const res = await queueService.markSkipped({ tokenId: "t1", userId: "u1" });

      expect(tokenDoc.status).toBe(TOKEN_STATUS.SKIPPED);
      expect(tokenDoc.save).toHaveBeenCalled();
      expect(res).toBe(tokenDoc);
    });
  });

  describe("markCancelled()", () => {
    it("throws 404 if token not found", async () => {
      jest.spyOn(Token, "findById").mockResolvedValue(null);

      await expect(
        queueService.markCancelled({ tokenId: "t1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("throws 400 if invalid transition", async () => {
      jest.spyOn(Token, "findById").mockResolvedValue({ status: TOKEN_STATUS.WAITING });

      await expect(
        queueService.markCancelled({ tokenId: "t1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("marks CANCELLED from CALLING", async () => {
      const tokenDoc = {
        status: TOKEN_STATUS.CALLING,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Token, "findById").mockResolvedValue(tokenDoc);

      const res = await queueService.markCancelled({ tokenId: "t1", userId: "u1" });

      expect(tokenDoc.status).toBe(TOKEN_STATUS.CANCELLED);
      expect(tokenDoc.save).toHaveBeenCalled();
      expect(res).toBe(tokenDoc);
    });

    it("marks CANCELLED from SKIPPED", async () => {
      const tokenDoc = {
        status: TOKEN_STATUS.SKIPPED,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Token, "findById").mockResolvedValue(tokenDoc);

      const res = await queueService.markCancelled({ tokenId: "t1", userId: "u1" });

      expect(tokenDoc.status).toBe(TOKEN_STATUS.CANCELLED);
      expect(tokenDoc.save).toHaveBeenCalled();
      expect(res).toBe(tokenDoc);
    });
  });

  describe("markCompleted()", () => {
    it("throws 404 if token not found", async () => {
      jest.spyOn(Token, "findById").mockResolvedValue(null);

      await expect(
        queueService.markCompleted({ tokenId: "t1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("throws 400 if invalid transition", async () => {
      jest.spyOn(Token, "findById").mockResolvedValue({ status: TOKEN_STATUS.CALLING });

      await expect(
        queueService.markCompleted({ tokenId: "t1", userId: "u1" })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("marks COMPLETED from SERVING", async () => {
      const tokenDoc = {
        status: TOKEN_STATUS.SERVING,
        save: jest.fn().mockResolvedValue(true),
      };
      jest.spyOn(Token, "findById").mockResolvedValue(tokenDoc);

      const res = await queueService.markCompleted({ tokenId: "t1", userId: "u1" });

      expect(tokenDoc.status).toBe(TOKEN_STATUS.COMPLETED);
      expect(tokenDoc.save).toHaveBeenCalled();
      expect(res).toBe(tokenDoc);
    });
  });

  describe("listQueues()", () => {
    it("returns paginated list", async () => {
      const chain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue([{ _id: "q1" }]),
      };
      jest.spyOn(Queue, "find").mockReturnValue(chain);
      jest.spyOn(Queue, "countDocuments").mockResolvedValue(1);

      const res = await queueService.listQueues({
        branchId: "b1",
        status: QUEUE_STATUS.OPEN,
        page: 1,
        limit: 10,
      });

      expect(res).toMatchObject({
        items: [{ _id: "q1" }],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });
});
