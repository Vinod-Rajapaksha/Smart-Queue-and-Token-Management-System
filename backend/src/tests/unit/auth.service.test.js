import { jest } from "@jest/globals";
import User from "../../database/models/User.js";

jest.unstable_mockModule("../../utils/password.js", () => ({
  hashPassword: jest.fn(),
  comparePassword: jest.fn(),
}));

jest.unstable_mockModule("../../utils/jwt.js", () => ({
  generateAccessToken: jest.fn(),
  generateRefreshToken: jest.fn(),
  verifyRefreshToken: jest.fn(),
}));

let authService;
let passwordUtils;
let jwtUtils;

beforeAll(async () => {
  passwordUtils = await import("../../utils/password.js");
  jwtUtils = await import("../../utils/jwt.js");
  authService = await import("../../modules/auth/service.js");
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe("Auth Service (Unit) - ESM", () => {
  describe("register()", () => {
    it("should throw 409 if email already exists", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue({ _id: "u1" });

      await expect(
        authService.register({
          name: "A",
          email: "a@test.com",
          password: "Pass@123",
          role: "STAFF",
          branch: null,
        })
      ).rejects.toMatchObject({ statusCode: 409 });

      expect(User.findOne).toHaveBeenCalledWith({ email: "a@test.com" });
    });

    it("should create user and return sanitized userData (no password/refreshToken)", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);
      passwordUtils.hashPassword.mockResolvedValue("hashed");

      const createdUserDoc = {
        toObject: () => ({
          _id: "u1",
          name: "A",
          email: "a@test.com",
          password: "hashed",
          refreshToken: "rt",
          role: "STAFF",
          branch: null,
        }),
      };

      jest.spyOn(User, "create").mockResolvedValue(createdUserDoc);

      const result = await authService.register({
        name: "A",
        email: "a@test.com",
        password: "Pass@123",
        role: "STAFF",
        branch: null,
      });

      expect(passwordUtils.hashPassword).toHaveBeenCalledWith("Pass@123");
      expect(User.create).toHaveBeenCalled();

      expect(result).toMatchObject({
        _id: "u1",
        name: "A",
        email: "a@test.com",
        role: "STAFF",
      });
      expect(result.password).toBeUndefined();
      expect(result.refreshToken).toBeUndefined();
    });
  });

  describe("login()", () => {
    it("should throw 401 if user not found", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);

      await expect(
        authService.login({ email: "x@test.com", password: "Pass@123" })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should throw 403 if user is inactive", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue({ isActive: false });

      await expect(
        authService.login({ email: "x@test.com", password: "Pass@123" })
      ).rejects.toMatchObject({ statusCode: 403 });
    });

    it("should throw 401 if password mismatch", async () => {
      const userDoc = { isActive: true, password: "hashed" };
      jest.spyOn(User, "findOne").mockResolvedValue(userDoc);

      passwordUtils.comparePassword.mockResolvedValue(false);

      await expect(
        authService.login({ email: "x@test.com", password: "wrong" })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should return tokens + sanitized user, and save refreshToken", async () => {
      const userDoc = {
        _id: { toString: () => "u1" },
        role: "STAFF",
        isActive: true,
        password: "hashed",
        refreshToken: null,
        save: jest.fn().mockResolvedValue(true),
        toObject: () => ({
          _id: "u1",
          email: "x@test.com",
          password: "hashed",
          refreshToken: "willRemove",
          role: "STAFF",
          isActive: true,
        }),
      };

      jest.spyOn(User, "findOne").mockResolvedValue(userDoc);

      passwordUtils.comparePassword.mockResolvedValue(true);
      jwtUtils.generateAccessToken.mockReturnValue("AT");
      jwtUtils.generateRefreshToken.mockReturnValue("RT");

      const result = await authService.login({
        email: "x@test.com",
        password: "Pass@123",
      });

      expect(userDoc.save).toHaveBeenCalled();
      expect(result).toEqual({
        user: {
          _id: "u1",
          email: "x@test.com",
          role: "STAFF",
          isActive: true,
        },
        accessToken: "AT",
        refreshToken: "RT",
      });
    });
  });

  describe("refreshToken()", () => {
    it("should throw 401 if refresh token invalid", async () => {
      jwtUtils.verifyRefreshToken.mockImplementation(() => {
        throw new Error("bad token");
      });

      await expect(
        authService.refreshToken({ refreshToken: "BAD" })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should throw 401 if user not found/inactive", async () => {
      jwtUtils.verifyRefreshToken.mockReturnValue({ id: "u1" });

      jest.spyOn(User, "findById").mockResolvedValue(null);

      await expect(
        authService.refreshToken({ refreshToken: "RT" })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should throw 401 if refresh token doesn't match stored", async () => {
      jwtUtils.verifyRefreshToken.mockReturnValue({ id: "u1" });

      jest.spyOn(User, "findById").mockResolvedValue({
        isActive: true,
        refreshToken: "DIFFERENT",
      });

      await expect(
        authService.refreshToken({ refreshToken: "RT" })
      ).rejects.toMatchObject({ statusCode: 401 });
    });

    it("should rotate tokens and save new refresh token", async () => {
      jwtUtils.verifyRefreshToken.mockReturnValue({ id: "u1" });

      const userDoc = {
        _id: { toString: () => "u1" },
        role: "STAFF",
        isActive: true,
        refreshToken: "OLD_RT",
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, "findById").mockResolvedValue(userDoc);

      jwtUtils.generateAccessToken.mockReturnValue("NEW_AT");
      jwtUtils.generateRefreshToken.mockReturnValue("NEW_RT");

      const result = await authService.refreshToken({
        refreshToken: "OLD_RT",
      });

      expect(userDoc.refreshToken).toBe("NEW_RT");
      expect(userDoc.save).toHaveBeenCalled();

      expect(result).toEqual({
        accessToken: "NEW_AT",
        refreshToken: "NEW_RT",
      });
    });
  });

  describe("logout()", () => {
    it("should throw 404 if user not found", async () => {
      jest.spyOn(User, "findById").mockResolvedValue(null);

      await expect(authService.logout("u1")).rejects.toMatchObject({
        statusCode: 404,
      });
    });

    it("should set refreshToken null and save", async () => {
      const userDoc = {
        refreshToken: "RT",
        save: jest.fn().mockResolvedValue(true),
      };

      jest.spyOn(User, "findById").mockResolvedValue(userDoc);

      const ok = await authService.logout("u1");

      expect(userDoc.refreshToken).toBeNull();
      expect(userDoc.save).toHaveBeenCalled();
      expect(ok).toBe(true);
    });
  });
});
