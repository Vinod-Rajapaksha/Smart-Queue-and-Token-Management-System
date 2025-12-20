import request from "supertest";
import app from "../../app.js";

import mongoose from "mongoose";

import Token from "../../database/models/Token.js";
import ServiceRating from "../../database/models/ServiceRating.js";

import Branch from "../../database/models/Branch.js";
import Queue from "../../database/models/Queue.js";
import Counter from "../../database/models/Counter.js";

import User from "../../database/models/User.js";
import { hashPassword } from "../../utils/password.js";
import { generateAccessToken } from "../../utils/jwt.js";

describe("Rating Routes (Integration)", () => {
  const base = "/api/ratings";

  const createUser = async ({
    name = "User",
    email = "u@test.com",
    password = "Pass@123",
    role = "CUSTOMER",
    isActive = true,
    refreshToken = null,
    telephone = "0771234567",
    branch = null,
  } = {}) => {
    const hashed = await hashPassword(password);

    return User.create({
      name,
      email,
      password: hashed,
      role,
      isActive,
      refreshToken,
      telephone,
      branch,
    });
  };

  const authHeaderFor = (user) => {
    const accessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });
    return { Authorization: `Bearer ${accessToken}` };
  };

  const seedBranchQueueCounter = async () => {
    const branch = await Branch.create({
      name: "Main Branch",
      code: "BR1",
      address: "No 1, Main Street",
      city: "Colombo",
      contactNumber: "0112345678",
    });

    const queue = await Queue.create({
      branch: branch._id,
      status: "OPEN",
    });

    const counter = await Counter.create({
      branch: branch._id,
      name: "Counter 1",
      code: "C1",
    });

    return { branch, queue, counter };
  };

  const seedToken = async ({ status = "COMPLETED" } = {}) => {
    const { branch, queue, counter } = await seedBranchQueueCounter();

    const customerForToken = await createUser({
      email: `token_customer_${status.toLowerCase()}@test.com`,
      role: "CUSTOMER",
      branch: branch._id,
    });

    const token = await Token.create({
      tokenNumber: 1,
      status,
      user: customerForToken._id,
      branch: branch._id,
      queue: queue._id,
      counter: counter._id,
    });

    return { branch, queue, counter, token, customerForToken };
  };

  const createCompletedToken = async ({
    branch,
    queue,
    counter,
    user,
    tokenNumber,
  }) => {
    return Token.create({
      tokenNumber,
      status: "COMPLETED",
      user: user._id,
      branch: branch._id,
      queue: queue._id,
      counter: counter._id,
    });
  };

  beforeEach(async () => {
    await Promise.all([
      ServiceRating.deleteMany({}),
      Token.deleteMany({}),
      Branch.deleteMany({}),
      Queue.deleteMany({}),
      Counter.deleteMany({}),
      User.deleteMany({}),
    ]);
  });

  describe("Auth & Roles", () => {
    it("should return 401 when no auth token (all routes)", async () => {
      await request(app).post(base).send({ tokenId: "x", rating: 5 }).expect(401);
      await request(app).get(base).expect(401);
      await request(app).get(`${base}/summary`).expect(401);
    });

    it("should return 403 when unauthorized roles access routes", async () => {
      const { token } = await seedToken({ status: "COMPLETED" });

      const admin = await createUser({ email: "admin@test.com", role: "ADMIN" });
      const staff = await createUser({ email: "staff@test.com", role: "STAFF" });
      const customer = await createUser({
        email: "cust@test.com",
        role: "CUSTOMER",
      });

      await request(app)
        .post(base)
        .set(authHeaderFor(admin))
        .send({ tokenId: token._id.toString(), rating: 5 })
        .expect(403);

      await request(app)
        .post(base)
        .set(authHeaderFor(staff))
        .send({ tokenId: token._id.toString(), rating: 5 })
        .expect(403);

      
      await request(app).get(base).set(authHeaderFor(customer)).expect(403);
      await request(app)
        .get(`${base}/summary`)
        .set(authHeaderFor(customer))
        .expect(403);
    });
  });

  describe("POST /api/ratings", () => {
    it("should validate body (missing tokenId) -> 400", async () => {
      const customer = await createUser({ email: "c1@test.com", role: "CUSTOMER" });

      const res = await request(app)
        .post(base)
        .set(authHeaderFor(customer))
        .send({ rating: 5 });

      expect(res.statusCode).toBe(400);
    });

    it("should return 404 if token not found", async () => {
      const customer = await createUser({ email: "c2@test.com", role: "CUSTOMER" });

      const res = await request(app)
        .post(base)
        .set(authHeaderFor(customer))
        .send({ tokenId: new mongoose.Types.ObjectId().toString(), rating: 5 });

      expect(res.statusCode).toBe(404);
    });

    it("should return 400 if token is not COMPLETED", async () => {
      const { token } = await seedToken({ status: "WAITING" });
      const customer = await createUser({ email: "c3@test.com", role: "CUSTOMER" });

      const res = await request(app)
        .post(base)
        .set(authHeaderFor(customer))
        .send({ tokenId: token._id.toString(), rating: 4 });

      expect(res.statusCode).toBe(400);
    });

    it("should create rating (201) when token is COMPLETED and persist in DB", async () => {
      const { token, branch, queue, counter } = await seedToken({
        status: "COMPLETED",
      });
      const customer = await createUser({ email: "c4@test.com", role: "CUSTOMER" });

      const res = await request(app)
        .post(base)
        .set(authHeaderFor(customer))
        .send({ tokenId: token._id.toString(), rating: 5, comment: "Nice" });

      expect(res.statusCode).toBe(201);
      expect(res.body.data).toHaveProperty("_id");

      const saved = await ServiceRating.findOne({ tokenId: token._id });
      expect(saved).toBeTruthy();

      expect(saved.rating).toBe(5);
      expect(saved.comment).toBe("Nice");

      expect(saved.branchId.toString()).toBe(branch._id.toString());
      expect(saved.queueId.toString()).toBe(queue._id.toString());
      expect(saved.counterId.toString()).toBe(counter._id.toString());

      
      expect(saved.createdBy).toBeNull();
    });

    it("should prevent duplicate rating (409)", async () => {
      const { token, branch, queue, counter } = await seedToken({
        status: "COMPLETED",
      });
      const customer = await createUser({ email: "c5@test.com", role: "CUSTOMER" });

      await ServiceRating.create({
        tokenId: token._id,
        branchId: branch._id,
        queueId: queue._id,
        counterId: counter._id,
        rating: 5,
        comment: "",
        createdBy: customer._id,
      });

      const res = await request(app)
        .post(base)
        .set(authHeaderFor(customer))
        .send({ tokenId: token._id.toString(), rating: 4 });

      expect(res.statusCode).toBe(409);
    });
  });

  describe("GET /api/ratings", () => {
    it("should allow ADMIN/MANAGER and return paginated list", async () => {
      const { branch, queue, counter } = await seedBranchQueueCounter();
      const user = await createUser({
        email: "seed_user@test.com",
        role: "CUSTOMER",
        branch: branch._id,
      });

      const token1 = await createCompletedToken({
        branch,
        queue,
        counter,
        user,
        tokenNumber: 1,
      });
      const token2 = await createCompletedToken({
        branch,
        queue,
        counter,
        user,
        tokenNumber: 2,
      });

      await ServiceRating.create([
        {
          tokenId: token1._id,
          branchId: branch._id,
          queueId: queue._id,
          counterId: counter._id,
          rating: 5,
          comment: "",
          createdBy: null,
        },
        {
          tokenId: token2._id,
          branchId: branch._id,
          queueId: queue._id,
          counterId: counter._id,
          rating: 4,
          comment: "",
          createdBy: null,
        },
      ]);

      const manager = await createUser({ email: "m1@test.com", role: "MANAGER" });

      const res = await request(app)
        .get(`${base}?branchId=${branch._id.toString()}&page=1&limit=10`)
        .set(authHeaderFor(manager))
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveProperty("items");
      expect(res.body.data).toHaveProperty("pagination");
      expect(res.body.data.items.length).toBe(2);
    });
  });

  describe("GET /api/ratings/summary", () => {
    it("should return zeroed summary when no ratings", async () => {
      const admin = await createUser({ email: "a1@test.com", role: "ADMIN" });

      const res = await request(app)
        .get(`${base}/summary`)
        .set(authHeaderFor(admin))
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data).toEqual({
        avgRating: 0,
        count: 0,
        stars1: 0,
        stars2: 0,
        stars3: 0,
        stars4: 0,
        stars5: 0,
      });
    });

    it("should return computed summary", async () => {
      const { branch, queue, counter } = await seedBranchQueueCounter();
      const user = await createUser({
        email: "seed_user2@test.com",
        role: "CUSTOMER",
        branch: branch._id,
      });

      const token1 = await createCompletedToken({
        branch,
        queue,
        counter,
        user,
        tokenNumber: 1,
      });
      const token2 = await createCompletedToken({
        branch,
        queue,
        counter,
        user,
        tokenNumber: 2,
      });

      await ServiceRating.create([
        {
          tokenId: token1._id,
          branchId: branch._id,
          queueId: queue._id,
          counterId: counter._id,
          rating: 5,
          comment: "",
          createdBy: null,
        },
        {
          tokenId: token2._id,
          branchId: branch._id,
          queueId: queue._id,
          counterId: counter._id,
          rating: 4,
          comment: "",
          createdBy: null,
        },
      ]);

      const admin = await createUser({ email: "a2@test.com", role: "ADMIN" });

      const res = await request(app)
        .get(`${base}/summary?branchId=${branch._id.toString()}`)
        .set(authHeaderFor(admin))
        .send();

      expect(res.statusCode).toBe(200);
      expect(res.body.data.count).toBe(2);
      expect(res.body.data.stars5).toBe(1);
      expect(res.body.data.stars4).toBe(1);
    });
  });
});
