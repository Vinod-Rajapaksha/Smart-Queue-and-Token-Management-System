import request from "supertest";
import app from "../../app.js";

import User from "../../database/models/User.js";
import { hashPassword } from "../../utils/password.js";
import { generateAccessToken } from "../../utils/jwt.js";

describe("Auth Routes (Integration)", () => {
  const base = "/api/auth";

  const createUser = async ({
    name = "Admin",
    email = "admin@test.com",
    password = "Pass@123",
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

  it("POST /login should login and return tokens", async () => {
    await createUser({
      email: "staff@test.com",
      role: "STAFF",
      password: "Pass@123",
    });

    const res = await request(app).post(`${base}/login`).send({
      email: "staff@test.com",
      password: "Pass@123",
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty("accessToken");
    expect(res.body.data).toHaveProperty("refreshToken");
    expect(res.body.data).toHaveProperty("user");
    expect(res.body.data.user.email).toBe("staff@test.com");
  });

  it("POST /login should fail with wrong password", async () => {
    await createUser({
      email: "staff2@test.com",
      role: "STAFF",
      password: "Pass@123",
    });

    const res = await request(app).post(`${base}/login`).send({
      email: "staff2@test.com",
      password: "WrongPass",
    });

    expect(res.statusCode).toBe(401);
  });

  it("POST /refresh-token should return tokens and update stored refreshToken", async () => {
    await createUser({
      email: "staff3@test.com",
      role: "STAFF",
      password: "Pass@123",
    });

    const loginRes = await request(app).post(`${base}/login`).send({
      email: "staff3@test.com",
      password: "Pass@123",
    });

    const oldRT = loginRes.body.data.refreshToken;

    const refreshRes = await request(app)
      .post(`${base}/refresh-token`)
      .send({ refreshToken: oldRT });

    expect(refreshRes.statusCode).toBe(200);
    expect(refreshRes.body.data).toHaveProperty("accessToken");
    expect(refreshRes.body.data).toHaveProperty("refreshToken");

    const user = await User.findOne({ email: "staff3@test.com" });
    expect(user.refreshToken).toBe(refreshRes.body.data.refreshToken);
  });

  it("POST /logout should clear refreshToken (auth protected)", async () => {
    const user = await createUser({
      email: "staff4@test.com",
      role: "STAFF",
      password: "Pass@123",
    });

    const accessToken = generateAccessToken({
      id: user._id.toString(),
      role: user.role,
    });

    const res = await request(app)
      .post(`${base}/logout`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send();

    expect(res.statusCode).toBe(200);

    const updated = await User.findById(user._id);
    expect(updated.refreshToken).toBeNull();
  });

  it("POST /register should require ADMIN (auth + allowRoles)", async () => {
    const res = await request(app).post(`${base}/register`).send({
      name: "New User",
      email: "new@test.com",
      password: "Pass@123",
      role: "STAFF",
      telephone: "0771234567",
      branch: null,
    });

    expect([401, 403]).toContain(res.statusCode);
  });

  it("POST /register should allow ADMIN to create user", async () => {
    const admin = await createUser({
      email: "admin2@test.com",
      role: "ADMIN",
      password: "Pass@123",
    });

    const accessToken = generateAccessToken({
      id: admin._id.toString(),
      role: admin.role,
    });

    const res = await request(app)
      .post(`${base}/register`)
      .set("Authorization", `Bearer ${accessToken}`)
      .send({
        name: "Staff A",
        email: "staffA@test.com",
        password: "Pass@123",
        role: "STAFF",
        telephone: "0771234567",
        branch: null,
      });

    expect(res.statusCode).toBe(201);

    const saved = await User.findOne({ email: "staffA@test.com" });
    expect(saved).toBeTruthy();
    expect(saved.role).toBe("STAFF");
    expect(saved.telephone).toBe("0771234567");
  });
});
