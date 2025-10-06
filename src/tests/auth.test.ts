import request from "supertest";
import app from "../index";
import { directusService } from "../config/directus";

// Mock the Directus service
jest.mock("../config/directus");
const mockedDirectusService = directusService as jest.Mocked<
  typeof directusService
>;

describe("Auth Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const mockUser = {
        id: "1",
        email: "test@example.com",
        first_name: "Test",
        last_name: "User",
        role: "user",
        status: "active",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      };

      const mockDirectusResponse = {
        access_token: "directus-token",
        refresh_token: "refresh-token",
        expires: Date.now() + 3600000,
        expires_at: Date.now() + 3600000,
        user: mockUser,
      };

      mockedDirectusService.loginUser.mockResolvedValue(mockDirectusResponse);
      mockedDirectusService.getUserInfo.mockResolvedValue(mockUser);

      const response = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("access_token");
      expect(response.body.data.user).toEqual(mockUser);
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "invalid-email",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for short password", async () => {
      const response = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 401 for invalid credentials", async () => {
      mockedDirectusService.loginUser.mockRejectedValue(
        new Error("Invalid credentials")
      );

      const response = await request(app).post("/api/v1/auth/login").send({
        email: "test@example.com",
        password: "wrongpassword",
      });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });

  describe("POST /api/v1/auth/register", () => {
    it("should register successfully with valid data", async () => {
      const mockUser = {
        id: "1",
        email: "newuser@example.com",
        first_name: "New",
        last_name: "User",
        role: "user",
        status: "active",
        created_at: "2023-01-01T00:00:00Z",
        updated_at: "2023-01-01T00:00:00Z",
      };

      mockedDirectusService.registerUser.mockResolvedValue(mockUser);

      const response = await request(app).post("/api/v1/auth/register").send({
        email: "newuser@example.com",
        password: "password123",
        first_name: "New",
        last_name: "User",
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("access_token");
      expect(response.body.data.user).toEqual(mockUser);
    });

    it("should return 400 for invalid email format", async () => {
      const response = await request(app).post("/api/v1/auth/register").send({
        email: "invalid-email",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
