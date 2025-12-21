import { jest } from "@jest/globals";
import request from "supertest";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

jest.unstable_mockModule("../../middleware/auth.js", () => ({
  __esModule: true,
  auth: (req, res, next) => {
    const header = req.headers.authorization || "";
    if (!header.startsWith("Bearer ")) {
      return res.status(401).json({ statusCode: 401, message: "Unauthorized" });
    }

    const token = header.replace("Bearer ", "").trim();
    if (token === "admin") req.user = { id: "u-admin", role: "ADMIN" };
    else if (token === "manager") req.user = { id: "u-mgr", role: "MANAGER" };
    else if (token === "staff") req.user = { id: "u-staff", role: "STAFF" };
    else {
      return res.status(401).json({ statusCode: 401, message: "Unauthorized" });
    }

    next();
  },
}));

jest.unstable_mockModule("../../middleware/role.js", () => ({
  __esModule: true,
  allowRoles:
    (...allowed) =>
    (req, res, next) => {
      if (!req.user?.role) {
        return res.status(401).json({ statusCode: 401, message: "Unauthorized" });
      }
      if (!allowed.includes(req.user.role)) {
        return res.status(403).json({ statusCode: 403, message: "Forbidden" });
      }
      next();
    },
}));

jest.unstable_mockModule("../../core/constants.js", () => ({
  __esModule: true,
  ROLES: { ADMIN: "ADMIN", MANAGER: "MANAGER" },
}));

let mongo;
let app;

let analyticsRouter;
let Token;
let ServiceRating;

const iso = (d) => new Date(d).toISOString();

beforeAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  mongo = await MongoMemoryServer.create();
  await mongoose.connect(mongo.getUri(), {
    
  });

  analyticsRouter = (await import("../../modules/analytics/routes.js")).default;
  Token = (await import("../../database/models/Token.js")).default;
  ServiceRating = (await import("../../database/models/ServiceRating.js")).default;
  errorHandler = (await import("../../middleware/error.js")).default; 

  app = express();
  app.use(express.json());
  app.use("/api/analytics", analyticsRouter);
  app.use(errorHandler);
});

afterEach(async () => {
 
  if (mongoose.connection.readyState === 1) {
    await mongoose.connection.db.dropDatabase();
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  if (mongo) await mongo.stop();
});

describe("Analytics Routes (Integration)", () => {
  describe("GET /api/analytics/overview", () => {
    it("401 when no auth header", async () => {
      const res = await request(app).get("/api/analytics/overview");
      expect(res.status).toBe(401);
      expect(res.body).toMatchObject({ statusCode: 401 });
    });

    it("403 for unauthorized role", async () => {
      const res = await request(app)
        .get("/api/analytics/overview")
        .set("Authorization", "Bearer staff");

      expect(res.status).toBe(403);
      expect(res.body).toMatchObject({ statusCode: 403 });
    });

    it("400 for invalid branchId (manager)", async () => {
      const res = await request(app)
        .get("/api/analytics/overview")
        .set("Authorization", "Bearer manager")
        .query({ branchId: "bad-id" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        statusCode: 400,
        message: "Invalid branchId",
      });
    });

    it("400 when from > to", async () => {
      const res = await request(app)
        .get("/api/analytics/overview")
        .set("Authorization", "Bearer admin")
        .query({
          from: iso("2025-12-20T00:00:00.000Z"),
          to: iso("2025-12-19T00:00:00.000Z"),
        });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        statusCode: 400,
        message: "`from` date must be before `to` date",
      });
    });

    it("200 returns overview totals + averages (admin)", async () => {
      const branchId = new mongoose.Types.ObjectId();
      const queueId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      await Token.create([
        {
          tokenNumber: 1,
          user: userId,
          branch: branchId,
          queue: queueId,
          status: "COMPLETED",
          createdAt: new Date("2025-12-18T10:00:00.000Z"),
          servedAt: new Date("2025-12-18T10:00:01.250Z"), 
          completedAt: new Date("2025-12-18T10:00:04.250Z"), 
        },
        {
          tokenNumber: 2,
          user: userId,
          branch: branchId,
          queue: queueId,
          status: "SERVING",
          createdAt: new Date("2025-12-19T10:00:00.000Z"),
          servedAt: new Date("2025-12-19T10:00:02.000Z"), 
        },
        {
          tokenNumber: 3,
          user: userId,
          branch: branchId,
          queue: queueId,
          status: "CANCELLED",
          createdAt: new Date("2025-12-19T11:00:00.000Z"),
        },
      ]);

      const res = await request(app)
        .get("/api/analytics/overview")
        .set("Authorization", "Bearer admin")
        .query({
          branchId: branchId.toString(),
          from: iso("2025-12-18T00:00:00.000Z"),
          to: iso("2025-12-20T00:00:00.000Z"),
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("data");

      const data = res.body.data;

      expect(data.branchId).toBe(branchId.toString());
      expect(data.totals).toMatchObject({
        total: 3,
        serving: 1,
        completed: 1,
        cancelled: 1,
        waiting: 0, 
      });

      expect(data.averages).toMatchObject({
        avgWaitMs: 1625,
        avgServiceMs: 3000,
      });
    });
  });

  describe("GET /api/analytics/volume", () => {
    it("200 returns daily buckets by default", async () => {
      const branchId = new mongoose.Types.ObjectId();
      const queueId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      await Token.create([
        {
          tokenNumber: 1,
          user: userId,
          branch: branchId,
          queue: queueId,
          status: "WAITING",
          createdAt: new Date("2025-12-19T10:00:00.000Z"),
        },
        {
          tokenNumber: 2,
          user: userId,
          branch: branchId,
          queue: queueId,
          status: "COMPLETED",
          createdAt: new Date("2025-12-19T11:00:00.000Z"),
        },
      ]);

      const res = await request(app)
        .get("/api/analytics/volume")
        .set("Authorization", "Bearer admin")
        .query({
          branchId: branchId.toString(),
          from: iso("2025-12-18T00:00:00.000Z"),
          to: iso("2025-12-20T00:00:00.000Z"),
        });

      expect(res.status).toBe(200);
      const data = res.body.data;

      expect(data.groupBy).toBe("day");
      expect(data.branchId).toBe(branchId.toString());
      expect(data.data).toHaveLength(1);

      expect(data.data[0]).toMatchObject({
        bucket: "2025-12-19",
        total: 2,
      });

      const statuses = data.data[0].statusBreakdown.map((x) => x.status);
      expect(statuses).toEqual(expect.arrayContaining(["WAITING", "COMPLETED"]));
    });

    it("200 supports groupBy=hour", async () => {
      const branchId = new mongoose.Types.ObjectId();
      const queueId = new mongoose.Types.ObjectId();
      const userId = new mongoose.Types.ObjectId();

      await Token.create([
        {
          tokenNumber: 1,
          user: userId,
          branch: branchId,
          queue: queueId,
          status: "WAITING",
          createdAt: new Date("2025-12-19T10:05:00.000Z"),
        },
        {
          tokenNumber: 2,
          user: userId,
          branch: branchId,
          queue: queueId,
          status: "WAITING",
          createdAt: new Date("2025-12-19T10:45:00.000Z"),
        },
      ]);

      const res = await request(app)
        .get("/api/analytics/volume")
        .set("Authorization", "Bearer manager")
        .query({
          branchId: branchId.toString(),
          groupBy: "hour",
          from: iso("2025-12-19T00:00:00.000Z"),
          to: iso("2025-12-20T00:00:00.000Z"),
        });

      expect(res.status).toBe(200);
      const data = res.body.data;

      expect(data.groupBy).toBe("hour");
      expect(data.data).toHaveLength(1);
      expect(data.data[0].bucket).toBe("2025-12-19 10:00");
      expect(data.data[0].total).toBe(2);
    });

    it("400 for invalid branchId", async () => {
      const res = await request(app)
        .get("/api/analytics/volume")
        .set("Authorization", "Bearer admin")
        .query({ branchId: "bad" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        statusCode: 400,
        message: "Invalid branchId",
      });
    });
  });

  describe("GET /api/analytics/ratings", () => {
    it("200 returns zeros when no ratings", async () => {
      const res = await request(app)
        .get("/api/analytics/ratings")
        .set("Authorization", "Bearer admin");

      expect(res.status).toBe(200);
      const data = res.body.data;

      expect(data.totalRatings).toBe(0);
      expect(data.averageRating).toBe(0);
      expect(data.breakdown).toEqual([]);
    });

    it("200 calculates average + breakdown (no branch filter)", async () => {
      const branchId = new mongoose.Types.ObjectId();
      const queueId = new mongoose.Types.ObjectId();
      const counterId = new mongoose.Types.ObjectId();

      await ServiceRating.create([
        {
          tokenId: new mongoose.Types.ObjectId(),
          branchId,
          queueId,
          counterId,
          rating: 3,
          createdAt: new Date("2025-12-19T10:00:00.000Z"),
        },
        {
          tokenId: new mongoose.Types.ObjectId(),
          branchId,
          queueId,
          counterId,
          rating: 3,
          createdAt: new Date("2025-12-19T10:10:00.000Z"),
        },
        {
          tokenId: new mongoose.Types.ObjectId(),
          branchId,
          queueId,
          counterId,
          rating: 5,
          createdAt: new Date("2025-12-19T10:20:00.000Z"),
        },
      ]);

      const res = await request(app)
        .get("/api/analytics/ratings")
        .set("Authorization", "Bearer manager")
        .query({
          from: iso("2025-12-18T00:00:00.000Z"),
          to: iso("2025-12-20T00:00:00.000Z"),
        });

      expect(res.status).toBe(200);

      const data = res.body.data;
      expect(data.totalRatings).toBe(3);
      expect(data.averageRating).toBe(3.67);
      expect(data.breakdown).toEqual([
        { rating: 3, count: 2 },
        { rating: 5, count: 1 },
      ]);
    });

    it("400 for invalid branchId", async () => {
      const res = await request(app)
        .get("/api/analytics/ratings")
        .set("Authorization", "Bearer admin")
        .query({ branchId: "bad" });

      expect(res.status).toBe(400);
      expect(res.body).toMatchObject({
        statusCode: 400,
        message: "Invalid branchId",
      });
    });
  });
});
