import request from "supertest";
import app from "../../app.js";

import User from "../../database/models/User.js";
import { hashPassword } from "../../utils/password.js";
import { generateAccessToken } from "../../utils/jwt.js";

describe("User Routes (Integration)", () => {
  const base = "/api/users"; 

  const createUser = async ({
    name = "User",
    email = "user@test.com",
    password = "Pass@123!",
    role = "STAFF",
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

  it("GET /me should fail without token", async () => {
    const res = await request(app).get(`${base}/me`);
    expect(res.statusCode).toBe(401);
  });

  it("GET /me should return profile for authenticated user", async () => {
    const user = await createUser({ email: "me@test.com", role: "STAFF" });
    const res = await request(app)
      .get(`${base}/me`)
      .set("Authorization", `Bearer ${tokenFor(user)}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("email", "me@test.com");
    expect(res.body.data.password).toBeUndefined();
    expect(res.body.data.refreshToken).toBeUndefined();
  });

  it("PATCH /me should validate email (400)", async () => {
    const user = await createUser({ email: "me2@test.com", role: "STAFF" });

    const res = await request(app)
      .patch(`${base}/me`)
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ email: "not-an-email" });

    expect(res.statusCode).toBe(400);
  });

  it("PATCH /me should update profile fields", async () => {
    const user = await createUser({ email: "me3@test.com", role: "STAFF" });

    const res = await request(app)
      .patch(`${base}/me`)
      .set("Authorization", `Bearer ${tokenFor(user)}`)
      .send({ name: "New Name", telephone: "0779999999" });

    expect(res.statusCode).toBe(200);

    const updated = await User.findById(user._id);
    expect(updated.name).toBe("New Name");
    expect(updated.telephone).toBe("0779999999");
  });

  it("GET / (list users) should require ADMIN (403 for STAFF)", async () => {
    const staff = await createUser({ email: "staff@test.com", role: "STAFF" });

    const res = await request(app)
      .get(`${base}/`)
      .set("Authorization", `Bearer ${tokenFor(staff)}`);

    expect(res.statusCode).toBe(403);
  });

  it("GET / (list users) should allow ADMIN", async () => {
    await createUser({ email: "x1@test.com", role: "STAFF" });
    const admin = await createUser({ email: "admin@test.com", role: "ADMIN" });

    const res = await request(app)
      .get(`${base}/`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("PATCH /:id/status should validate isActive (400)", async () => {
    const admin = await createUser({ email: "admin2@test.com", role: "ADMIN" });
    const target = await createUser({ email: "target@test.com", role: "STAFF" });

    const res = await request(app)
      .patch(`${base}/${target._id.toString()}/status`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ isActive: "true" });

    expect(res.statusCode).toBe(400);
  });

  it("PATCH /:id/status should update status (ADMIN)", async () => {
    const admin = await createUser({ email: "admin3@test.com", role: "ADMIN" });
    const target = await createUser({
      email: "target2@test.com",
      role: "STAFF",
      isActive: true,
    });

    const res = await request(app)
      .patch(`${base}/${target._id.toString()}/status`)
      .set("Authorization", `Bearer ${tokenFor(admin)}`)
      .send({ isActive: false });

    expect(res.statusCode).toBe(200);

    const updated = await User.findById(target._id);
    expect(updated.isActive).toBe(false);
  });
});
