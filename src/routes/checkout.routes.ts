import { Router } from "express";
import { body, validationResult } from "express-validator";
import { checkoutController } from "../controllers/checkout.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/error.middleware";

const router = Router();

// Validation middleware for checkout
const validateCheckout = [
  body("items")
    .isArray({ min: 1 })
    .withMessage("Items array is required and must contain at least one item"),
  body("items.*.productId")
    .notEmpty()
    .withMessage("Product ID is required for each item"),
  body("items.*.quantity")
    .isInt({ min: 1 })
    .withMessage("Quantity must be a positive integer"),
];

// All checkout routes require authentication
router.use(authenticateToken);

// Routes
router.post("/", validateCheckout, asyncHandler(checkoutController.checkout));

export { router as checkoutRoutes };

