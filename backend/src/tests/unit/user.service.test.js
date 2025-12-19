import { jest } from "@jest/globals";
import User from "../../database/models/User.js";
import Branch from "../../database/models/Branch.js";
import { ROLES } from "../../core/constants.js";

const ROLE_VALUES = Object.values(ROLES);

jest.unstable_mockModule("../../utils/password.js", () => ({
  hashPassword: jest.fn(),
}));

let userService;
let passwordUtils;

beforeAll(async () => {
  passwordUtils = await import("../../utils/password.js");
  userService = await import("../../modules/user/service.js");
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe("User Service (Unit) - ESM", () => {
  describe("createUser()", () => {
    it("should throw 400 if role invalid", async () => {
      const badRole = "NOT_A_ROLE";

      // ensure test remains valid even if roles change
      expect(ROLE_VALUES.includes(badRole)).toBe(false);

      await expect(
        userService.createUser({
          name: "A",
          email: "a@test.com",
          password: "Pass@123!",
          telephone: "0771234567",
          role: badRole,
          branch: null,
        })
      ).rejects.toMatchObject({ statusCode: 400 });
    });

    it("should throw 409 if email already exists", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue({ _id: "u1" });

      await expect(
        userService.createUser({
          name: "A",
          email: "a@test.com",
          password: "Pass@123!",
          telephone: "0771234567",
          role: "STAFF",
          branch: null,
        })
      ).rejects.toMatchObject({ statusCode: 409 });

      expect(User.findOne).toHaveBeenCalledWith({ email: "a@test.com" });
    });

    it("should throw 400 if branch provided but not found", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);
      jest.spyOn(Branch, "exists").mockResolvedValue(false);

      await expect(
        userService.createUser({
          name: "A",
          email: "a@test.com",
          password: "Pass@123!",
          telephone: "0771234567",
          role: "STAFF",
          branch: "branchId1",
        })
      ).rejects.toMatchObject({ statusCode: 400 });

      expect(Branch.exists).toHaveBeenCalledWith({ _id: "branchId1" });
    });

    it("should create user and return sanitized userData (no password/refreshToken)", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);
      jest.spyOn(Branch, "exists").mockResolvedValue(true);
      passwordUtils.hashPassword.mockResolvedValue("hashed_pw");

      const createdUserDoc = {
        toObject: () => ({
          _id: "u1",
          name: "A",
          email: "a@test.com",
          password: "hashed_pw",
          refreshToken: "rt",
          role: "STAFF",
          telephone: "0771234567",
          branch: "branchId1",
        }),
      };

      jest.spyOn(User, "create").mockResolvedValue(createdUserDoc);

      const result = await userService.createUser({
        name: "A",
        email: "a@test.com",
        password: "Pass@123!",
        telephone: "0771234567",
        role: "STAFF",
        branch: "branchId1",
      });

      expect(passwordUtils.hashPassword).toHaveBeenCalled();
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

  describe("updateOwnProfile()", () => {
    it("should throw 409 if email already in use by another user", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue({ _id: "other" });

      await expect(
        userService.updateOwnProfile("u1", { email: "dup@test.com" })
      ).rejects.toMatchObject({ statusCode: 409 });

      expect(User.findOne).toHaveBeenCalledWith({
        email: "dup@test.com",
        _id: { $ne: "u1" },
      });
    });

    it("should throw 404 if user not found", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);

      // chain mock: findByIdAndUpdate().select().populate()
      const q = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(null),
      };
      jest.spyOn(User, "findByIdAndUpdate").mockReturnValue(q);

      await expect(
        userService.updateOwnProfile("u1", { name: "New" })
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("should update allowed fields and return user", async () => {
      jest.spyOn(User, "findOne").mockResolvedValue(null);

      const updatedUser = { _id: "u1", name: "New", email: "a@test.com" };
      const q = {
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockResolvedValue(updatedUser),
      };
      jest.spyOn(User, "findByIdAndUpdate").mockReturnValue(q);

      const result = await userService.updateOwnProfile("u1", {
        name: "New",
        role: "ADMIN", // should be ignored for own profile
      });

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        "u1",
        { name: "New" },
        { new: true, runValidators: true }
      );

      expect(result).toBe(updatedUser);
    });
  });

  describe("resetUserPassword()", () => {
    it("should throw 400 if password too short", async () => {
      await expect(userService.resetUserPassword("u1", "123")).rejects.toMatchObject(
        { statusCode: 400 }
      );
    });

    it("should throw 404 if user not found", async () => {
      passwordUtils.hashPassword.mockResolvedValue("hashed");

      const q = {
        select: jest.fn().mockResolvedValue(null),
      };
      jest.spyOn(User, "findByIdAndUpdate").mockReturnValue(q);

      await expect(
        userService.resetUserPassword("u1", "Pass@123!")
      ).rejects.toMatchObject({ statusCode: 404 });
    });

    it("should hash password and update user", async () => {
      passwordUtils.hashPassword.mockResolvedValue("hashed");

      const q = {
        select: jest.fn().mockResolvedValue({ _id: "u1" }),
      };
      jest.spyOn(User, "findByIdAndUpdate").mockReturnValue(q);

      const ok = await userService.resetUserPassword("u1", "Pass@123!");

      expect(passwordUtils.hashPassword).toHaveBeenCalledWith("Pass@123!");
      expect(ok).toBe(true);
    });
  });
});
