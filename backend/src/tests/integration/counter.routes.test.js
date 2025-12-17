import request from "supertest";
import app from "../../app.js";

import User from "../../database/models/User.js";
import Branch from "../../database/models/Branch.js";
import Counter from "../../database/models/Counter.js";

import { hashPassword } from "../../utils/password.js";
import { generateAccessToken } from "../../utils/jwt.js";

describe("Counter Routes (Integration)", () => {
  const base = "/api/counters"; // change if your mount path differs

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

  const createBranch = async ({
    name = "Main Branch",
    code = "COL",
    address = "No 1",
    city = "Colombo",
    contactNumber = "0771234567",
    isActive = true,
  } = {}) => {
    return Branch.create({ name, code, address, city, contactNumber, isActive });
  };

  it("GET / should return 401 without token", async () => {
    const res = await request(app).get(`${base}/`);
    expect(res.statusCode).toBe(401);
  });

  it("POST / should return 403 for STAFF (admin-only)", async () => {
    const staff = await createUser({ email: "staff@test.com", role: "STAFF" });
    const branch = await createBranch({ code: "B1" });

    const res = await request(app)
      .post(`${base}/`)
      .set("Authorization", `Bearer ${tokenFor(staff)}`)
      .send({ branchId: branch._id.toString(), name: "C1", code: "C1" });

    expect(res.statusCode).toBe(403);
  });

  it("POST / should validate payload (400) when missing required fields", async () => {
    const admin = await createUser({ email: "admin1@test.com", role: "ADMIN" });

    const res = await request(app)
      .post(`${base}/`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ name: "OnlyName" });

    expect(res.statusCode).toBe(400);
  });

  it("POST / should create counter (201) and persist to DB", async () => {
    const admin = await createUser({ email: "admin2@test.com", role: "ADMIN" });
    const branch = await createBranch({ code: "B2" });

    const res = await request(app)
      .post(`${base}/`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({
        branchId: branch._id.toString(),
        name: "  Counter A  ",
        code: "  CA  ",
        services: ["S1"],
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty("name");

    const saved = await Counter.findOne({ branch: branch._id, code: "CA" });
    expect(saved).toBeTruthy();
    expect(saved.name).toBe("Counter A");
  });

  it("POST / should fail with 409 for duplicate code within same branch", async () => {
    const admin = await createUser({ email: "admin3@test.com", role: "ADMIN" });
    const branch = await createBranch({ code: "B3" });

    await Counter.create({
      branch: branch._id,
      name: "Existing",
      code: "DUP",
      isActive: true,
    });

    const res = await request(app)
      .post(`${base}/`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({
        branchId: branch._id.toString(),
        name: "New One",
        code: "DUP",
      });

    expect(res.statusCode).toBe(409);
  });

  it("GET / should allow STAFF and return paginated result", async () => {
    const staff = await createUser({ email: "staff2@test.com", role: "STAFF" });
    const branch = await createBranch({ code: "B4" });

    await Counter.create({ branch: branch._id, name: "C1", code: "C1" });
    await Counter.create({ branch: branch._id, name: "C2", code: "C2" });

    const res = await request(app)
      .get(`${base}/?branchId=${branch._id.toString()}&page=1&limit=10`)
      .set("Authorization", `Bearer ${tokenFor(staff)}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("items");
    expect(res.body.data).toHaveProperty("pagination");
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("GET /:id should allow STAFF and return 404 if not found", async () => {
    const staff = await createUser({ email: "staff3@test.com", role: "STAFF" });

    const res = await request(app)
      .get(`${base}/507f1f77bcf86cd799439011`)
      .set("Authorization", `Bearer ${tokenFor(staff)}`);

    expect(res.statusCode).toBe(404);
  });

  it("PATCH /:id should validate update fields (400 invalid field)", async () => {
    const admin = await createUser({ email: "admin4@test.com", role: "ADMIN" });
    const branch = await createBranch({ code: "B5" });

    const counter = await Counter.create({
      branch: branch._id,
      name: "C1",
      code: "C1",
      isActive: true,
    });

    const res = await request(app)
      .patch(`${base}/${counter._id.toString()}`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ badField: "x" });

    expect(res.statusCode).toBe(400);
  });

  it("PATCH /:id should update counter (200) and persist", async () => {
    const admin = await createUser({ email: "admin5@test.com", role: "ADMIN" });
    const branch = await createBranch({ code: "B6" });

    const counter = await Counter.create({
      branch: branch._id,
      name: "Old",
      code: "OLD",
      isActive: true,
    });

    const res = await request(app)
      .patch(`${base}/${counter._id.toString()}`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ name: "  New  ", code: " N1 " });

    expect(res.statusCode).toBe(200);

    const updated = await Counter.findById(counter._id);
    expect(updated.name).toBe("New");
    expect(updated.code).toBe("N1");
  });

  it("PATCH /:id/status should validate isActive (400)", async () => {
    const admin = await createUser({ email: "admin6@test.com", role: "ADMIN" });
    const branch = await createBranch({ code: "B7" });

    const counter = await Counter.create({
      branch: branch._id,
      name: "C1",
      code: "C1",
      isActive: true,
    });

    const res = await request(app)
      .patch(`${base}/${counter._id.toString()}/status`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ isActive: "true" }); // invalid type

    expect(res.statusCode).toBe(400);
  });

  it("PATCH /:id/status should update isActive (200) and persist", async () => {
    const admin = await createUser({ email: "admin7@test.com", role: "ADMIN" });
    const branch = await createBranch({ code: "B8" });

    const counter = await Counter.create({
      branch: branch._id,
      name: "C1",
      code: "C1",
      isActive: true,
    });

    const res = await request(app)
      .patch(`${base}/${counter._id.toString()}/status`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ isActive: false });

    expect(res.statusCode).toBe(200);

    const updated = await Counter.findById(counter._id);
    expect(updated.isActive).toBe(false);
  });

  it("DELETE /:id should disable counter (soft delete) (200) and persist isActive=false", async () => {
    const admin = await createUser({ email: "admin8@test.com", role: "ADMIN" });
    const branch = await createBranch({ code: "B9" });

    const counter = await Counter.create({
      branch: branch._id,
      name: "C1",
      code: "C1",
      isActive: true,
    });

    const res = await request(app)
      .delete(`${base}/${counter._id.toString()}`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`);

    expect(res.statusCode).toBe(200);

    const updated = await Counter.findById(counter._id);
    expect(updated.isActive).toBe(false);
  });
});
