import { jest } from "@jest/globals";
import Token from "../../database/models/Token.js";
import Queue from "../../database/models/Queue.js";
import { TOKEN_STATUS } from "../../core/constants.js";

let tokenService;

beforeAll(async () => {
  tokenService = (await import("../../modules/token/service.js")).default;
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe("Token Service (Unit) - ESM", () => {
  describe("createToken()", () => {
    it("should throw 400 if user already has an active token", async () => {
      
      jest.spyOn(Token, "findOne").mockResolvedValue({ _id: "t_existing" });

      await expect(
        tokenService.createToken("user1", "branch1", "queue1")
      ).rejects.toMatchObject({ statusCode: 400 });

      expect(Token.findOne).toHaveBeenCalledWith({
        user: "user1",
        branch: "branch1",
        status: {
          $in: [
            TOKEN_STATUS.CREATED,
            TOKEN_STATUS.WAITING,
            TOKEN_STATUS.CALLING,
            TOKEN_STATUS.SERVING,
            TOKEN_STATUS.SKIPPED,
          ],
        },
      });
    });

    it("should create token with tokenNumber=1 if no previous token exists", async () => {
      jest
        .spyOn(Token, "findOne")
        .mockResolvedValueOnce(null) 
        .mockReturnValueOnce({
          sort: jest.fn().mockReturnThis(),
          select: jest.fn().mockResolvedValue(null), 
        });

      const created = { _id: "t1", tokenNumber: 1 };
      jest.spyOn(Token, "create").mockResolvedValue(created);
      jest.spyOn(Queue, "findByIdAndUpdate").mockResolvedValue(true);

      const result = await tokenService.createToken("user1", "branch1", "queue1");

      expect(Token.create).toHaveBeenCalledWith({
        tokenNumber: 1,
        user: "user1",
        branch: "branch1",
        queue: "queue1",
        status: TOKEN_STATUS.WAITING,
      });

      expect(Queue.findByIdAndUpdate).toHaveBeenCalledWith("queue1", {
        $push: { tokens: "t1" },
      });

      expect(result).toBe(created);
    });

    it("should create token with tokenNumber = lastToken + 1", async () => {
      
      jest
        .spyOn(Token, "findOne")
        .mockResolvedValueOnce(null) 
        .mockReturnValueOnce({
          sort: jest.fn().mockReturnThis(),
          select: jest.fn().mockResolvedValue({ tokenNumber: 7 }), 
        });

      const created = { _id: "t8", tokenNumber: 8 };
      jest.spyOn(Token, "create").mockResolvedValue(created);
      jest.spyOn(Queue, "findByIdAndUpdate").mockResolvedValue(true);

      const result = await tokenService.createToken("user1", "branch1", "queue1");

      expect(Token.create).toHaveBeenCalledWith(
        expect.objectContaining({ tokenNumber: 8 })
      );
      expect(result).toBe(created);
    });

    it("should push created token into queue", async () => {
      
      jest
        .spyOn(Token, "findOne")
        .mockResolvedValueOnce(null)
        .mockReturnValueOnce({
          sort: jest.fn().mockReturnThis(),
          select: jest.fn().mockResolvedValue(null),
        });

      const created = { _id: "t1", tokenNumber: 1 };
      jest.spyOn(Token, "create").mockResolvedValue(created);
      const qSpy = jest.spyOn(Queue, "findByIdAndUpdate").mockResolvedValue(true);

      await tokenService.createToken("user1", "branch1", "queue1");

      expect(qSpy).toHaveBeenCalledWith("queue1", {
        $push: { tokens: "t1" },
      });
    });
  });

  describe("getMyTokens()", () => {
    it("should return tokens for user sorted by newest first", async () => {
      
      const tokens = [{ _id: "t2" }, { _id: "t1" }];

      const q = {
        populate: jest.fn().mockReturnThis(),
        sort: jest.fn().mockResolvedValue(tokens),
      };

      const findSpy = jest.spyOn(Token, "find").mockReturnValue(q);

      const result = await tokenService.getMyTokens("user1");

      expect(findSpy).toHaveBeenCalledWith({ user: "user1" });
      expect(q.populate).toHaveBeenCalledWith("branch queue");
      expect(q.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(result).toBe(tokens);
    });
  });

  describe("updateTokenStatus()", () => {
    it("should throw 404 if token not found", async () => {
      
      jest.spyOn(Token, "findById").mockResolvedValue(null);

      await expect(
        tokenService.updateTokenStatus("token1", TOKEN_STATUS.SERVING)
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("should set status and save token", async () => {
      
      const tokenDoc = {
        status: TOKEN_STATUS.WAITING,
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(Token, "findById").mockResolvedValue(tokenDoc);

      const result = await tokenService.updateTokenStatus(
        "token1",
        TOKEN_STATUS.CANCELLED
      );

      expect(tokenDoc.status).toBe(TOKEN_STATUS.CANCELLED);
      expect(tokenDoc.save).toHaveBeenCalled();
      expect(result).toBe(tokenDoc);
    });

    it("should set servedAt when status=SERVING", async () => {
      
      const tokenDoc = { save: jest.fn().mockResolvedValue(true) };
      jest.spyOn(Token, "findById").mockResolvedValue(tokenDoc);

      await tokenService.updateTokenStatus("token1", TOKEN_STATUS.SERVING);

      expect(tokenDoc.servedAt).toBeInstanceOf(Date);
    });

    it("should set completedAt when status=COMPLETED", async () => {
      
      const tokenDoc = { save: jest.fn().mockResolvedValue(true) };
      jest.spyOn(Token, "findById").mockResolvedValue(tokenDoc);

      await tokenService.updateTokenStatus("token1", TOKEN_STATUS.COMPLETED);

      expect(tokenDoc.completedAt).toBeInstanceOf(Date);
    });

    it("should set cancelledAt when status=CANCELLED", async () => {
      
      const tokenDoc = { save: jest.fn().mockResolvedValue(true) };
      jest.spyOn(Token, "findById").mockResolvedValue(tokenDoc);

      await tokenService.updateTokenStatus("token1", TOKEN_STATUS.CANCELLED);

      expect(tokenDoc.cancelledAt).toBeInstanceOf(Date);
    });

    it("should set skippedAt when status=SKIPPED", async () => {
      
      const tokenDoc = { save: jest.fn().mockResolvedValue(true) };
      jest.spyOn(Token, "findById").mockResolvedValue(tokenDoc);

      await tokenService.updateTokenStatus("token1", TOKEN_STATUS.SKIPPED);

      expect(tokenDoc.skippedAt).toBeInstanceOf(Date);
    });

    it("should set calledAt when status=CALLING", async () => {
    
      const tokenDoc = { save: jest.fn().mockResolvedValue(true) };
      jest.spyOn(Token, "findById").mockResolvedValue(tokenDoc);

      await tokenService.updateTokenStatus("token1", TOKEN_STATUS.CALLING);

      expect(tokenDoc.calledAt).toBeInstanceOf(Date);
    });
  });
});
