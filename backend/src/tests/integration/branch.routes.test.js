import request from "supertest";
import app from "../../app.js";

import User from "../../database/models/User.js";
import Branch from "../../database/models/Branch.js";
import { hashPassword } from "../../utils/password.js";
import { generateAccessToken } from "../../utils/jwt.js";

describe("Branch Routes (Integration)", () => {
  const base = "/api/branches"; 

  const createUser = async ({
    name = "Admin",
    email = "admin@test.com",
    password = "Pass@123!",
    role = "ADMIN",
    telephone = "0771234567",
    isActive = true,
    refreshToken = null,
    branch = null,
  } = {}) => {
    const hashed = await hashPassword(password);
    return User.create({
      name,
      email,
      password: hashed,
      role,
      telephone,
      isActive,
      refreshToken,
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

  it("should return 401 when no token is provided", async () => {
    const res = await request(app).get(`${base}/`);
    expect(res.statusCode).toBe(401);
  });

  it("should return 403 for non-admin on admin routes", async () => {
    const staff = await createUser({ email: "staff@test.com", role: "STAFF" });

    const res = await request(app)
      .get(`${base}/`)
      .set("Authorization", `Bearer ${tokenFor(staff)}`);

    expect(res.statusCode).toBe(403);
  });

  it("POST / should validate required fields (400)", async () => {
    const admin = await createUser({ email: "admin1@test.com", role: "ADMIN" });

    const res = await request(app)
      .post(`${base}/`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ name: "OnlyName" }); 

    expect(res.statusCode).toBe(400);
  });

  it("POST / should create branch (201) and persist to DB", async () => {
    const admin = await createUser({ email: "admin2@test.com", role: "ADMIN" });

    const payload = {
      name: "Main Branch",
      code: "col", 
      address: "No 1",
      city: "Colombo",
      contactNumber: "0771234567",
    };

    const res = await request(app)
      .post(`${base}/`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send(payload);

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty("data");
    expect(res.body.data).toHaveProperty("name", "Main Branch");

    const saved = await Branch.findOne({ code: payload.code });
    expect(saved).toBeTruthy();
  });

  it("POST / should fail with 409 on duplicate branch code (case-insensitive)", async () => {
    const admin = await createUser({ email: "admin3@test.com", role: "ADMIN" });

    await createBranch({ code: "COL" });

    const res = await request(app)
      .post(`${base}/`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({
        name: "Another",
        code: "col",
        address: "No 2",
        city: "Colombo",
        contactNumber: "0770000000",
      });

    expect(res.statusCode).toBe(409);
  });

  it("GET / should return branches (200) for ADMIN", async () => {
    const admin = await createUser({ email: "admin4@test.com", role: "ADMIN" });

    await createBranch({ code: "A1" });
    await createBranch({ code: "B1", isActive: false });

    const res = await request(app)
      .get(`${base}/`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("GET /:id should return 404 for invalid branch id", async () => {
    const admin = await createUser({ email: "admin5@test.com", role: "ADMIN" });

    const res = await request(app)
      .get(`${base}/507f1f77bcf86cd799439011`) 
      .set("Authorization", `Bearer ${tokenFor(admin)}`);

    expect(res.statusCode).toBe(404);
  });

  it("PATCH /:id should reject invalid fields (400)", async () => {
    const admin = await createUser({ email: "admin6@test.com", role: "ADMIN" });
    const branch = await createBranch({ code: "UP1" });

    const res = await request(app)
      .patch(`${base}/${branch._id.toString()}`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ notAllowed: "x" });

    expect(res.statusCode).toBe(400);
  });

  it("PATCH /:id should update allowed fields and persist (200)", async () => {
    const admin = await createUser({ email: "admin7@test.com", role: "ADMIN" });
    const branch = await createBranch({ code: "UP2", name: "Old" });

    const res = await request(app)
      .patch(`${base}/${branch._id.toString()}`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ name: "New Name", city: "Kandy" });

    expect(res.statusCode).toBe(200);

    const updated = await Branch.findById(branch._id);
    expect(updated.name).toBe("New Name");
    expect(updated.city).toBe("Kandy");
  });

  it("PATCH /:id should fail with 409 when updating code duplicates another branch", async () => {
    const admin = await createUser({ email: "admin8@test.com", role: "ADMIN" });
    const b1 = await createBranch({ code: "DUP1" });
    await createBranch({ code: "DUP2" });

    const res = await request(app)
      .patch(`${base}/${b1._id.toString()}`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ code: "dup2" });

    expect(res.statusCode).toBe(409);
  });

  it("DELETE /:id should deactivate (soft delete) branch (200) and persist isActive=false", async () => {
    const admin = await createUser({ email: "admin9@test.com", role: "ADMIN" });
    const branch = await createBranch({ code: "DEL1", isActive: true });

    const res = await request(app)
      .delete(`${base}/${branch._id.toString()}`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`);

    expect(res.statusCode).toBe(200);

    const updated = await Branch.findById(branch._id);
    expect(updated.isActive).toBe(false);
  });
});
