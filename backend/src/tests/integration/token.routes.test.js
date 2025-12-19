
import { jest } from "@jest/globals";
import express from "express";
import request from "supertest";


jest.unstable_mockModule("../../middleware/auth.js", () => ({
  auth: (req, _res, next) => {
    req.user = { id: "user1", role: "ADMIN" }; 
    next();
  },
}));

jest.unstable_mockModule("../../middleware/role.js", () => ({
  allowRoles: (...roles) => {
   
    return (_req, _res, next) => next();
  },
}));


const tokenServiceMock = {
  createToken: jest.fn(),
  getMyTokens: jest.fn(),
  updateTokenStatus: jest.fn(),
};

jest.unstable_mockModule("../../modules/token/service.js", () => ({
  default: tokenServiceMock,
}));

let tokenRouter;

beforeAll(async () => {
  tokenRouter = (await import("../../modules/token/routes.js")).default;
});

afterEach(() => {
  jest.clearAllMocks();
});

const makeApp = () => {
  const app = express();
  app.use(express.json());

  app.use("/api/tokens", tokenRouter);

  app.use((err, _req, res, _next) => {
    const status = err.statusCode || 500;
    res.status(status).json({
      statusCode: status,
      message: err.message || "Internal Server Error",
      data: null,
    });
  });

  return app;
};

describe("Token Routes (Integration) - ESM", () => {
  describe("POST /api/tokens", () => {
    it("should return 400 if branchId invalid (validation)", async () => {
      
      const app = makeApp();

      const res = await request(app).post("/api/tokens").send({
        branchId: "notObjectId",
        queueId: "507f191e810c19729de860ea",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/branchId/i);
      expect(tokenServiceMock.createToken).not.toHaveBeenCalled();
    });

    it("should return 400 if queueId invalid (validation)", async () => {
      
      const app = makeApp();

      const res = await request(app).post("/api/tokens").send({
        branchId: "507f191e810c19729de860ea",
        queueId: "bad",
      });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/queueId/i);
      expect(tokenServiceMock.createToken).not.toHaveBeenCalled();
    });

    it("should create token and return 201 (controller -> service call)", async () => {
     
      const app = makeApp();

      tokenServiceMock.createToken.mockResolvedValue({
        _id: "t1",
        tokenNumber: 1,
        status: "WAITING",
      });

      const res = await request(app).post("/api/tokens").send({
        branchId: "507f191e810c19729de860ea",
        queueId: "507f191e810c19729de860eb",
      });

      expect(res.status).toBe(201);
      expect(tokenServiceMock.createToken).toHaveBeenCalledWith(
        "user1",
        "507f191e810c19729de860ea",
        "507f191e810c19729de860eb"
      );

      expect(res.body).toMatchObject({
        statusCode: 201,
        message: "Token created successfully",
        data: expect.any(Object),
      });
    });
  });

  describe("GET /api/tokens/me", () => {
    it("should return tokens for logged-in user", async () => {
     
      const app = makeApp();

      tokenServiceMock.getMyTokens.mockResolvedValue([{ _id: "t1" }]);

      const res = await request(app).get("/api/tokens/me");

      expect(res.status).toBe(200);
      expect(tokenServiceMock.getMyTokens).toHaveBeenCalledWith("user1");
      expect(res.body).toMatchObject({
        statusCode: 200,
        message: "Tokens fetched",
        data: [{ _id: "t1" }],
      });
    });
  });

  describe("PATCH /api/tokens/:id/status", () => {
    it("should return 400 if token id invalid (validation)", async () => {
     
      const app = makeApp();

      const res = await request(app)
        .patch("/api/tokens/notObjectId/status")
        .send({ status: "WAITING" });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/token id/i);
      expect(tokenServiceMock.updateTokenStatus).not.toHaveBeenCalled();
    });

    it("should return 400 if status missing (validation)", async () => {
     
      const app = makeApp();

      const res = await request(app)
        .patch("/api/tokens/507f191e810c19729de860ea/status")
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/status is required/i);
      expect(tokenServiceMock.updateTokenStatus).not.toHaveBeenCalled();
    });

    it("should return 400 if status invalid (validation allowedStatuses)", async () => {
      
      const app = makeApp();

      const res = await request(app)
        .patch("/api/tokens/507f191e810c19729de860ea/status")
        .send({ status: "CREATED" }); 

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/invalid status/i);
      expect(tokenServiceMock.updateTokenStatus).not.toHaveBeenCalled();
    });

    it("should update token status and return 200", async () => {
    
      const app = makeApp();

      tokenServiceMock.updateTokenStatus.mockResolvedValue({
        _id: "507f191e810c19729de860ea",
        status: "COMPLETED",
      });

      const res = await request(app)
        .patch("/api/tokens/507f191e810c19729de860ea/status")
        .send({ status: "COMPLETED" });

      expect(res.status).toBe(200);
      expect(tokenServiceMock.updateTokenStatus).toHaveBeenCalledWith(
        "507f191e810c19729de860ea",
        "COMPLETED"
      );

      expect(res.body).toMatchObject({
        statusCode: 200,
        message: "Token status updated",
        data: expect.any(Object),
      });
    });
  });
});
