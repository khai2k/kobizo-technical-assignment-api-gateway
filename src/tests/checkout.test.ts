import request from "supertest";
import app from "../index";
import { directusService } from "../config/directus";

// Mock the Directus service
jest.mock("../config/directus");
const mockedDirectusService = directusService as jest.Mocked<
  typeof directusService
>;

// Mock JWT token for authenticated requests
const mockToken = "mock-jwt-token";

describe("Checkout Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/checkout", () => {
    it("should process checkout successfully when all items are in stock", async () => {
      const mockProducts = [
        {
          id: "1",
          name: "Product 1",
          stock_quantity: 10,
        },
        {
          id: "2",
          name: "Product 2",
          stock_quantity: 5,
        },
      ];

      mockedDirectusService.checkStockAvailability.mockResolvedValue(
        mockProducts
      );

      // Mock JWT verification
      jest.spyOn(require("jsonwebtoken"), "verify").mockReturnValue({
        user: { id: "1", email: "test@example.com" },
      });

      const checkoutData = {
        items: [
          { productId: "1", quantity: 3 },
          { productId: "2", quantity: 2 },
        ],
      };

      const response = await request(app)
        .post("/api/v1/checkout")
        .set("Authorization", `Bearer ${mockToken}`)
        .send(checkoutData);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.canProceed).toBe(true);
      expect(response.body.data.totalItems).toBe(5);
      expect(response.body.data.stockCheck).toHaveLength(2);
      expect(response.body.data.stockCheck[0].isAvailable).toBe(true);
      expect(response.body.data.stockCheck[1].isAvailable).toBe(true);
    });

    it("should return 400 when items are out of stock", async () => {
      const mockProducts = [
        {
          id: "1",
          name: "Product 1",
          stock_quantity: 2, // Less than requested quantity
        },
        {
          id: "2",
          name: "Product 2",
          stock_quantity: 5,
        },
      ];

      mockedDirectusService.checkStockAvailability.mockResolvedValue(
        mockProducts
      );

      // Mock JWT verification
      jest.spyOn(require("jsonwebtoken"), "verify").mockReturnValue({
        user: { id: "1", email: "test@example.com" },
      });

      const checkoutData = {
        items: [
          { productId: "1", quantity: 5 }, // More than available stock
          { productId: "2", quantity: 2 },
        ],
      };

      const response = await request(app)
        .post("/api/v1/checkout")
        .set("Authorization", `Bearer ${mockToken}`)
        .send(checkoutData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.data.canProceed).toBe(false);
      expect(response.body.data.stockCheck[0].isAvailable).toBe(false);
      expect(response.body.data.stockCheck[1].isAvailable).toBe(true);
      expect(response.body.data.message).toContain("out of stock");
    });

    it("should return 400 when product is not found", async () => {
      const mockProducts = [
        {
          id: "2",
          name: "Product 2",
          stock_quantity: 5,
        },
        // Product 1 is missing from the response
      ];

      mockedDirectusService.checkStockAvailability.mockResolvedValue(
        mockProducts
      );

      // Mock JWT verification
      jest.spyOn(require("jsonwebtoken"), "verify").mockReturnValue({
        user: { id: "1", email: "test@example.com" },
      });

      const checkoutData = {
        items: [
          { productId: "1", quantity: 1 }, // Product not found
          { productId: "2", quantity: 2 },
        ],
      };

      const response = await request(app)
        .post("/api/v1/checkout")
        .set("Authorization", `Bearer ${mockToken}`)
        .send(checkoutData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.data.canProceed).toBe(false);
      expect(response.body.data.stockCheck[0].isAvailable).toBe(false);
      expect(response.body.data.stockCheck[0].productName).toBe(
        "Product not found"
      );
    });

    it("should return 401 for unauthenticated request", async () => {
      const checkoutData = {
        items: [{ productId: "1", quantity: 1 }],
      };

      const response = await request(app)
        .post("/api/v1/checkout")
        .send(checkoutData);

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for invalid request data", async () => {
      // Mock JWT verification
      jest.spyOn(require("jsonwebtoken"), "verify").mockReturnValue({
        user: { id: "1", email: "test@example.com" },
      });

      const invalidData = {
        items: [], // Empty items array
      };

      const response = await request(app)
        .post("/api/v1/checkout")
        .set("Authorization", `Bearer ${mockToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for invalid item structure", async () => {
      // Mock JWT verification
      jest.spyOn(require("jsonwebtoken"), "verify").mockReturnValue({
        user: { id: "1", email: "test@example.com" },
      });

      const invalidData = {
        items: [
          { productId: "1" }, // Missing quantity
          { quantity: 2 }, // Missing productId
        ],
      };

      const response = await request(app)
        .post("/api/v1/checkout")
        .set("Authorization", `Bearer ${mockToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should return 400 for zero or negative quantities", async () => {
      // Mock JWT verification
      jest.spyOn(require("jsonwebtoken"), "verify").mockReturnValue({
        user: { id: "1", email: "test@example.com" },
      });

      const invalidData = {
        items: [
          { productId: "1", quantity: 0 }, // Zero quantity
          { productId: "2", quantity: -1 }, // Negative quantity
        ],
      };

      const response = await request(app)
        .post("/api/v1/checkout")
        .set("Authorization", `Bearer ${mockToken}`)
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    it("should handle Directus service errors gracefully", async () => {
      mockedDirectusService.checkStockAvailability.mockRejectedValue(
        new Error("Directus connection failed")
      );

      // Mock JWT verification
      jest.spyOn(require("jsonwebtoken"), "verify").mockReturnValue({
        user: { id: "1", email: "test@example.com" },
      });

      const checkoutData = {
        items: [{ productId: "1", quantity: 1 }],
      };

      const response = await request(app)
        .post("/api/v1/checkout")
        .set("Authorization", `Bearer ${mockToken}`)
        .send(checkoutData);

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });
  });
});
