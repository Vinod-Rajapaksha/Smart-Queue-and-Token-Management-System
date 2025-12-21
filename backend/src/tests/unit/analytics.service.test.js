import { jest } from "@jest/globals";

jest.unstable_mockModule("../../database/models/Token.js", () => ({
  __esModule: true,
  default: {
    aggregate: jest.fn(),
  },
}));

jest.unstable_mockModule("../../database/models/ServiceRating.js", () => ({
  __esModule: true,
  default: {
    aggregate: jest.fn(),
  },
}));

let mongoose;
let analyticsService;
let Token;
let ServiceRating;

beforeAll(async () => {
  mongoose = (await import("mongoose")).default;

  Token = (await import("../../database/models/Token.js")).default;
  ServiceRating = (await import("../../database/models/ServiceRating.js")).default;

  analyticsService = (await import("../../modules/analytics/service.js")).default;
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe("Analytics Service (Unit) - overview/volume/ratings", () => {
  describe("overview()", () => {
    it("throws 400 for invalid branchId", async () => {
      await expect(
        analyticsService.overview({ branchId: "bad-id" })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "Invalid branchId",
      });
    });

    it("throws 400 when from > to", async () => {
      await expect(
        analyticsService.overview({
          from: "2025-12-20T00:00:00.000Z",
          to: "2025-12-19T00:00:00.000Z",
        })
      ).rejects.toMatchObject({
        statusCode: 400,
        message: "`from` date must be before `to` date",
      });
    });

    it("returns safe defaults when aggregation is empty", async () => {
      Token.aggregate.mockResolvedValueOnce([]);

      const res = await analyticsService.overview({});

      expect(res.branchId).toBeNull();
      expect(res.totals).toEqual({
        total: 0,
        waiting: 0, 
        serving: 0,
        completed: 0,
        cancelled: 0,
      });
      expect(res.averages).toEqual({ avgWaitMs: 0, avgServiceMs: 0 });
      expect(res.range).toHaveProperty("from");
      expect(res.range).toHaveProperty("to");
    });

    it("builds $match with createdAt range and optional branch ObjectId", async () => {
      const branchId = new mongoose.Types.ObjectId().toString();

      Token.aggregate.mockResolvedValueOnce([
        {
          totals: [{ total: 2, serving: 1, completed: 1, cancelled: 0 }],
          timing: [{ avgWaitMs: 1250.6, avgServiceMs: 3000.2 }],
        },
      ]);

      const res = await analyticsService.overview({
        branchId,
        from: "2025-12-18T00:00:00.000Z",
        to: "2025-12-20T00:00:00.000Z",
      });

      expect(Token.aggregate).toHaveBeenCalledTimes(1);

      const pipeline = Token.aggregate.mock.calls[0][0];

      expect(pipeline[0]).toHaveProperty("$match");
      expect(pipeline[0].$match).toHaveProperty("createdAt");
      expect(pipeline[0].$match.createdAt).toHaveProperty("$gte");
      expect(pipeline[0].$match.createdAt).toHaveProperty("$lte");

      expect(pipeline[0].$match).toHaveProperty("branch");
      expect(pipeline[0].$match.branch).toBeInstanceOf(mongoose.Types.ObjectId);

      expect(res.branchId).toBe(branchId);
      expect(res.averages.avgWaitMs).toBe(1251); 
      expect(res.averages.avgServiceMs).toBe(3000);
    });
  });

  describe("volume()", () => {
    it("throws 400 for invalid branchId", async () => {
      await expect(
        analyticsService.volume({ branchId: "bad" })
      ).rejects.toMatchObject({ statusCode: 400, message: "Invalid branchId" });
    });

    it("defaults groupBy to day and uses %Y-%m-%d format", async () => {
      Token.aggregate.mockResolvedValueOnce([
        { bucket: "2025-12-19", total: 2, statusBreakdown: [] },
      ]);

      const res = await analyticsService.volume({
        from: "2025-12-18T00:00:00.000Z",
        to: "2025-12-20T00:00:00.000Z",
      });

      expect(res.groupBy).toBe("day");

      const pipeline = Token.aggregate.mock.calls[0][0];

      const firstGroup = pipeline.find((s) => s.$group?._id?.bucket);
      expect(firstGroup.$group._id.bucket.$dateToString.format).toBe("%Y-%m-%d");
    });

    it("supports groupBy=hour and uses %Y-%m-%d %H:00 format", async () => {
      Token.aggregate.mockResolvedValueOnce([
        { bucket: "2025-12-19 10:00", total: 1, statusBreakdown: [] },
      ]);

      const res = await analyticsService.volume({ groupBy: "hour" });
      expect(res.groupBy).toBe("hour");

      const pipeline = Token.aggregate.mock.calls[0][0];
      const firstGroup = pipeline.find((s) => s.$group?._id?.bucket);

      expect(firstGroup.$group._id.bucket.$dateToString.format).toBe(
        "%Y-%m-%d %H:00"
      );
    });
  });

  describe("ratings()", () => {
    it("throws 400 for invalid branchId", async () => {
      await expect(
        analyticsService.ratings({ branchId: "bad" })
      ).rejects.toMatchObject({ statusCode: 400, message: "Invalid branchId" });
    });

    it("returns zeros when no ratings found", async () => {
      ServiceRating.aggregate.mockResolvedValueOnce([]);

      const res = await analyticsService.ratings({});

      expect(res.totalRatings).toBe(0);
      expect(res.averageRating).toBe(0);
      expect(res.breakdown).toEqual([]);
    });

    it("calculates average rating and breakdown correctly", async () => {
      ServiceRating.aggregate.mockResolvedValueOnce([
        { _id: 3, count: 2 },
        { _id: 5, count: 1 },
      ]);

      const res = await analyticsService.ratings({});

      expect(res.totalRatings).toBe(3);
      
      expect(res.averageRating).toBe(3.67);
      expect(res.breakdown).toEqual([
        { rating: 3, count: 2 },
        { rating: 5, count: 1 },
      ]);
    });

    it("adds branch ObjectId into $match when branchId is provided", async () => {
      const branchId = new mongoose.Types.ObjectId().toString();
      ServiceRating.aggregate.mockResolvedValueOnce([]);

      await analyticsService.ratings({
        branchId,
        from: "2025-12-18T00:00:00.000Z",
        to: "2025-12-20T00:00:00.000Z",
      });

      const pipeline = ServiceRating.aggregate.mock.calls[0][0];
      expect(pipeline[0]).toHaveProperty("$match");
      expect(pipeline[0].$match).toHaveProperty("branch");
      expect(pipeline[0].$match.branch).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(pipeline[0].$match).toHaveProperty("createdAt");
    });
  });
});
