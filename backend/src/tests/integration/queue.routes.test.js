import request from "supertest";
import app from "../../app.js";

import User from "../../database/models/User.js";
import Branch from "../../database/models/Branch.js";
import Counter from "../../database/models/Counter.js";
import Queue from "../../database/models/Queue.js";
import Token from "../../database/models/Token.js";

import { hashPassword } from "../../utils/password.js";
import { generateAccessToken } from "../../utils/jwt.js";
import { TOKEN_STATUS, QUEUE_STATUS } from "../../core/constants.js";

describe("Queue Routes (Integration) - aligned with constants + replset tx", () => {
  const base = "/api/queues";

  const createUser = async ({
    name = "Admin",
    email = "admin@test.com",
    password = "Pass@123!",
    role = "ADMIN",
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

  const tokenFor = (user) =>
    generateAccessToken({ id: user._id.toString(), role: user.role });

  const createBranch = async () =>
    Branch.create({
      name: "Main",
      code: "COL",
      address: "No 1",
      city: "Colombo",
      contactNumber: "0771234567",
      isActive: true,
    });

  const createCounter = async (branchId, isActive = true) =>
    Counter.create({
      branch: branchId,
      name: "Counter A",
      code: "C1",
      isActive,
    });

  it("401 when no token", async () => {
    const res = await request(app).post(`${base}/open`).send({ branchId: "x" });
    expect(res.statusCode).toBe(401);
  });

  it("403 for CUSTOMER role (not allowed)", async () => {
    const customer = await createUser({
      email: "cust@test.com",
      role: "CUSTOMER",
    });
    const branch = await createBranch();

    const res = await request(app)
      .post(`${base}/open`)
      .set("Authorization", `Bearer ${tokenFor(customer)}`)
      .send({ branchId: branch._id.toString() });

    expect(res.statusCode).toBe(403);
  });

  it("POST /open -> 400 invalid branchId", async () => {
    const admin = await createUser({ email: "admin1@test.com", role: "ADMIN" });

    const res = await request(app)
      .post(`${base}/open`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ branchId: "bad" });

    expect(res.statusCode).toBe(400);
  });

  it("POST /open -> 201 opens queue (status OPEN)", async () => {
    const admin = await createUser({ email: "admin2@test.com", role: "ADMIN" });
    const branch = await createBranch();

    const res = await request(app)
      .post(`${base}/open`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ branchId: branch._id.toString() });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty("status", QUEUE_STATUS.OPEN);
  });

  it("GET /active/:branchId -> 404 when no open queue", async () => {
    const staff = await createUser({ email: "staff1@test.com", role: "STAFF" });
    const branch = await createBranch();

    const res = await request(app)
      .get(`${base}/active/${branch._id.toString()}`)
      .set("Authorization", `Bearer ${tokenFor(staff)}`);

    expect(res.statusCode).toBe(404);
  });

  it("POST /next -> 200 sets next token to CALLING and updates queue.currentToken", async () => {
    const manager = await createUser({
      email: "mgr@test.com",
      role: "MANAGER",
    });
    const branch = await createBranch();
    const counter = await createCounter(branch._id, true);

    const openRes = await request(app)
      .post(`${base}/open`)
      .set("Authorization", `Bearer ${tokenFor(manager)}`)
      .send({ branchId: branch._id.toString() });

    const queueId = openRes.body.data._id;

    const token = await Token.create({
      tokenNumber: 1,
      user: manager._id,
      branch: branch._id,
      queue: queueId,
      status: TOKEN_STATUS.WAITING,
    });

    const res = await request(app)
      .post(`${base}/next`)
      .set("Authorization", `Bearer ${tokenFor(manager)}`)
      .send({
        branchId: branch._id.toString(),
        counterId: counter._id.toString(),
      });

    expect(res.statusCode).toBe(200);

    const updatedToken = await Token.findById(token._id);
    expect(updatedToken.status).toBe(TOKEN_STATUS.CALLING);
    expect(String(updatedToken.counter)).toBe(String(counter._id));

    const updatedQueue = await Queue.findById(queueId);
    expect(String(updatedQueue.currentToken)).toBe(String(token._id));
  });

  it("PATCH /tokens/:tokenId/serving -> 200 marks SERVING (from CALLING)", async () => {
    const staff = await createUser({ email: "staff2@test.com", role: "STAFF" });
    const branch = await createBranch();
    const queue = await Queue.create({
      branch: branch._id,
      status: QUEUE_STATUS.OPEN,
    });

    const token = await Token.create({
      tokenNumber: 1,
      user: staff._id,
      branch: branch._id,
      queue: queue._id,
      status: TOKEN_STATUS.CALLING,
    });

    const res = await request(app)
      .patch(`${base}/tokens/${token._id.toString()}/serving`)
      .set("Authorization", `Bearer ${tokenFor(staff)}`);

    expect(res.statusCode).toBe(200);

    const updated = await Token.findById(token._id);
    expect(updated.status).toBe(TOKEN_STATUS.SERVING);
  });

  it("PATCH /tokens/:tokenId/skipped -> 200 marks SKIPPED (from CALLING)", async () => {
    const staff = await createUser({ email: "staff3@test.com", role: "STAFF" });
    const branch = await createBranch();
    const queue = await Queue.create({
      branch: branch._id,
      status: QUEUE_STATUS.OPEN,
    });

    const token = await Token.create({
      tokenNumber: 1,
      user: staff._id,
      branch: branch._id,
      queue: queue._id,
      status: TOKEN_STATUS.CALLING,
    });

    const res = await request(app)
      .patch(`${base}/tokens/${token._id.toString()}/skipped`)
      .set("Authorization", `Bearer ${tokenFor(staff)}`);

    expect(res.statusCode).toBe(200);

    const updated = await Token.findById(token._id);
    expect(updated.status).toBe(TOKEN_STATUS.SKIPPED);
  });

  it("PATCH /tokens/:tokenId/cancelled -> 200 marks CANCELLED (from CALLING)", async () => {
    const staff = await createUser({ email: "staff4@test.com", role: "STAFF" });
    const branch = await createBranch();
    const queue = await Queue.create({
      branch: branch._id,
      status: QUEUE_STATUS.OPEN,
    });

    const token = await Token.create({
      tokenNumber: 1,
      user: staff._id,
      branch: branch._id,
      queue: queue._id,
      status: TOKEN_STATUS.CALLING,
    });

    const res = await request(app)
      .patch(`${base}/tokens/${token._id.toString()}/cancelled`)
      .set("Authorization", `Bearer ${tokenFor(staff)}`);

    expect(res.statusCode).toBe(200);

    const updated = await Token.findById(token._id);
    expect(updated.status).toBe(TOKEN_STATUS.CANCELLED);
  });

  it("PATCH /tokens/:tokenId/cancelled -> 200 marks CANCELLED (from SKIPPED)", async () => {
    const staff = await createUser({ email: "staff5@test.com", role: "STAFF" });
    const branch = await createBranch();
    const queue = await Queue.create({
      branch: branch._id,
      status: QUEUE_STATUS.OPEN,
    });

    const token = await Token.create({
      tokenNumber: 1,
      user: staff._id,
      branch: branch._id,
      queue: queue._id,
      status: TOKEN_STATUS.SKIPPED,
    });

    const res = await request(app)
      .patch(`${base}/tokens/${token._id.toString()}/cancelled`)
      .set("Authorization", `Bearer ${tokenFor(staff)}`);

    expect(res.statusCode).toBe(200);

    const updated = await Token.findById(token._id);
    expect(updated.status).toBe(TOKEN_STATUS.CANCELLED);
  });

  it("PATCH /tokens/:tokenId/completed -> 200 marks COMPLETED (from SERVING)", async () => {
    const staff = await createUser({ email: "staff6@test.com", role: "STAFF" });
    const branch = await createBranch();
    const queue = await Queue.create({
      branch: branch._id,
      status: QUEUE_STATUS.OPEN,
    });

    const token = await Token.create({
      tokenNumber: 1,
      user: staff._id,
      branch: branch._id,
      queue: queue._id,
      status: TOKEN_STATUS.SERVING,
    });

    const res = await request(app)
      .patch(`${base}/tokens/${token._id.toString()}/completed`)
      .set("Authorization", `Bearer ${tokenFor(staff)}`);

    expect(res.statusCode).toBe(200);

    const updated = await Token.findById(token._id);
    expect(updated.status).toBe(TOKEN_STATUS.COMPLETED);
  });

  it("PATCH /close -> 200 closes open queue", async () => {
    const admin = await createUser({ email: "admin7@test.com", role: "ADMIN" });
    const branch = await createBranch();

    await request(app)
      .post(`${base}/open`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ branchId: branch._id.toString() });

    const res = await request(app)
      .patch(`${base}/close`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ branchId: branch._id.toString() });

    expect(res.statusCode).toBe(200);

    const stillOpen = await Queue.findOne({
      branch: branch._id,
      status: QUEUE_STATUS.OPEN,
    });
    expect(stillOpen).toBeNull();
  });

  it("GET / -> 200 lists queues", async () => {
    const staff = await createUser({ email: "staff7@test.com", role: "STAFF" });
    const branch = await createBranch();

    await Queue.create({ branch: branch._id, status: QUEUE_STATUS.OPEN });
    await Queue.create({ branch: branch._id, status: QUEUE_STATUS.CLOSED });

    const res = await request(app)
      .get(`${base}/?branchId=${branch._id.toString()}`)
      .set("Authorization", `Bearer ${tokenFor(staff)}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("items");
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });
});
