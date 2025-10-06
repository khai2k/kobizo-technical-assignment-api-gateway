import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { validationResult } from "express-validator";
import { directusService } from "../config/directus";
import { AppError } from "../middleware/error.middleware";
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types";
import { logger } from "../utils/logger";

class AuthController {
  private static generateToken(user: User): string {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || "24h";

    if (!jwtSecret) {
      throw new AppError("JWT secret not configured", 500);
    }

    return jwt.sign({ user }, jwtSecret, {
      expiresIn: jwtExpiresIn,
    } as jwt.SignOptions);
  }

  async login(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation failed", 400);
    }

    const { email, password }: LoginRequest = req.body;

    try {
      // Authenticate with Directus
      const directusResponse = await directusService.loginUser(email, password);

      if (!directusResponse || !directusResponse.access_token) {
        throw new AppError("Invalid credentials", 401);
      }

      // Get user information from Directus using the access token
      const userInfo = await directusService.getUserInfo(
        directusResponse.access_token
      );

      if (!userInfo) {
        throw new AppError("Failed to get user information", 401);
      }

      // Generate JWT token
      const token = AuthController.generateToken(userInfo as User);

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          access_token: token,
          refresh_token: directusResponse.refresh_token,
          expires: directusResponse.expires_at,
          user: userInfo,
        },
        message: "Login successful",
      };

      logger.info(`User logged in: ${email}`);
      res.status(200).json(response);
    } catch (error) {
      logger.error("Login failed:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Login failed", 401);
    }
  }

  async register(req: Request, res: Response): Promise<void> {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      throw new AppError("Validation failed", 400);
    }

    const { email, password, first_name, last_name }: RegisterRequest =
      req.body;

    try {
      // Register user with Directus
      const userData = {
        email,
        password,
        first_name: first_name || "",
        last_name: last_name || "",
      };

      const directusResponse = await directusService.registerUser(userData);

      if (!directusResponse) {
        throw new AppError("Registration failed", 400);
      }

      // Generate JWT token for the new user
      const user: User = {
        id: directusResponse.id,
        email: directusResponse.email,
        first_name: directusResponse.first_name,
        last_name: directusResponse.last_name,
        role: directusResponse.role || "user",
        status: directusResponse.status || "active",
        created_at: directusResponse.created_at,
        updated_at: directusResponse.updated_at,
      };

      const token = AuthController.generateToken(user);

      const response: ApiResponse<AuthResponse> = {
        success: true,
        data: {
          access_token: token,
          expires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
          user,
        },
        message: "Registration successful",
      };

      logger.info(`User registered: ${email}`);
      res.status(201).json(response);
    } catch (error) {
      logger.error("Registration failed:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Registration failed", 400);
    }
  }

  async logout(req: Request, res: Response): Promise<void> {
    // In a stateless JWT system, logout is handled client-side
    // by removing the token. We can optionally maintain a blacklist
    // of tokens, but for simplicity, we'll just return success.

    const response: ApiResponse = {
      success: true,
      message: "Logout successful",
    };

    logger.info("User logged out");
    res.status(200).json(response);
  }

  async getCurrentUser(req: Request, res: Response): Promise<void> {
    if (!req.user) {
      throw new AppError("User not authenticated", 401);
    }

    const response: ApiResponse<User> = {
      success: true,
      data: req.user,
      message: "User information retrieved",
    };

    res.status(200).json(response);
  }
}

export const authController = new AuthController();
