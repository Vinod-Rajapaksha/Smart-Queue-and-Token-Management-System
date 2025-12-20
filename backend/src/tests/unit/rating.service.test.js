import { jest } from "@jest/globals";
import mongoose from "mongoose";

jest.unstable_mockModule("../../database/models/Token.js", () => ({
  default: {
    findById: jest.fn(),
  },
}));

jest.unstable_mockModule("../../database/models/ServiceRating.js", () => ({
  default: {
    findOne: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
    countDocuments: jest.fn(),
    aggregate: jest.fn(),
  },
}));

let ratingService;
let Token;
let ServiceRating;

beforeAll(async () => {
  Token = (await import("../../database/models/Token.js")).default;
  ServiceRating = (await import("../../database/models/ServiceRating.js")).default;
  ratingService = await import("../../modules/rating/service.js");
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe("Rating Service (Unit) - ESM", () => {
  describe("createRating()", () => {
    it("should throw 404 if token not found", async () => {
      Token.findById.mockResolvedValue(null);

      await expect(
        ratingService.createRating({
          tokenId: "t1",
          rating: 5,
          comment: "ok",
          userId: "u1",
        })
      ).rejects.toMatchObject({ statusCode: 404, message: "Token not found" });

      expect(Token.findById).toHaveBeenCalledWith("t1");
    });

    it("should throw 400 if token status is not COMPLETED", async () => {
      Token.findById.mockResolvedValue({
        _id: "t1",
        status: "WAITING",
      });

      await expect(
        ratingService.createRating({
          tokenId: "t1",
          rating: 5,
          comment: "ok",
          userId: "u1",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Rating allowed only after token is completed",
      });
    });

    it("should throw 409 if rating already submitted for token", async () => {
      Token.findById.mockResolvedValue({
        _id: "t1",
        status: "COMPLETED",
      });

      ServiceRating.findOne.mockResolvedValue({ _id: "r1" });

      await expect(
        ratingService.createRating({
          tokenId: "t1",
          rating: 5,
          comment: "ok",
          userId: "u1",
        })
      ).rejects.toMatchObject({
        statusCode: 409,
        message: "Rating already submitted for this token",
      });

      expect(ServiceRating.findOne).toHaveBeenCalledWith({ tokenId: "t1" });
    });

    it("should create rating mapped from token metadata (branch/queue/counter) and return doc", async () => {
      const tokenDoc = {
        _id: "t1",
        status: "COMPLETED",
        branch: { _id: "b1" },
        queue: { _id: "q1" },
        counter: { _id: "c1" },
      };

      Token.findById.mockResolvedValue(tokenDoc);
      ServiceRating.findOne.mockResolvedValue(null);

      ServiceRating.create.mockResolvedValue({ _id: "r1", rating: 4 });

      const result = await ratingService.createRating({
        tokenId: "t1",
        rating: "4",
        comment: undefined,
        userId: null,
      });

      expect(ServiceRating.create).toHaveBeenCalledWith({
        tokenId: "t1",
        branchId: "b1",
        queueId: "q1",
        counterId: "c1",
        rating: 4,
        comment: "",
        createdBy: null,
      });

      expect(result).toMatchObject({ _id: "r1", rating: 4 });
    });
  });

  describe("listRatings()", () => {
    it("should apply filters, paginate, sort, populate and return items + pagination", async () => {
      const items = [{ _id: "r1" }, { _id: "r2" }];

      const chain = {
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(items),
        then(res, rej) {
          return this.exec().then(res, rej);
        },
      };

      ServiceRating.find.mockReturnValue(chain);
      ServiceRating.countDocuments.mockResolvedValue(42);

      const out = await ratingService.listRatings({
        branchId: "b1",
        queueId: "q1",
        page: 2,
        limit: 10,
      });

      expect(ServiceRating.find).toHaveBeenCalledWith({
        branchId: "b1",
        queueId: "q1",
      });

      expect(chain.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(chain.skip).toHaveBeenCalledWith(10);
      expect(chain.limit).toHaveBeenCalledWith(10);

      expect(chain.populate).toHaveBeenCalledWith("tokenId", "tokenNumber status");
      expect(chain.populate).toHaveBeenCalledWith("branchId", "name code");
      expect(chain.populate).toHaveBeenCalledWith("queueId", "name");
      expect(chain.populate).toHaveBeenCalledWith("counterId", "name number");

      expect(out).toEqual({
        items,
        pagination: {
          page: 2,
          limit: 10,
          total: 42,
          pages: Math.ceil(42 / 10),
        },
      });
    });
  });

  describe("getRatingSummary()", () => {
    const branchId = new mongoose.Types.ObjectId().toString();
    const queueId = new mongoose.Types.ObjectId().toString();

    it("should return summary when aggregation returns data", async () => {
      ServiceRating.aggregate.mockResolvedValue([
        {
          avgRating: 4.25,
          count: 8,
          stars1: 0,
          stars2: 1,
          stars3: 2,
          stars4: 3,
          stars5: 2,
        },
      ]);

      const out = await ratingService.getRatingSummary({
        branchId,
        queueId,
      });

      expect(out).toMatchObject({
        avgRating: 4.25,
        count: 8,
        stars5: 2,
      });
    });

    it("should return zeroed summary if no results", async () => {
      ServiceRating.aggregate.mockResolvedValue([]);

      const out = await ratingService.getRatingSummary({
        branchId,
        queueId,
      });

      expect(out).toEqual({
        avgRating: 0,
        count: 0,
        stars1: 0,
        stars2: 0,
        stars3: 0,
        stars4: 0,
        stars5: 0,
      });
    });
  });
});
