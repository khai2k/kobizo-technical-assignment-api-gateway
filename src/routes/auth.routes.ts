import { Router } from "express";
import { body, validationResult } from "express-validator";
import { authController } from "../controllers/auth.controller";
import { asyncHandler } from "../middleware/error.middleware";

const router = Router();

// Validation middleware
const validateLogin = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
];

const validateRegister = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("first_name")
    .optional()
    .isLength({ min: 1 })
    .withMessage("First name must not be empty"),
  body("last_name")
    .optional()
    .isLength({ min: 1 })
    .withMessage("Last name must not be empty"),
];

// Routes
router.post("/login", validateLogin, asyncHandler(authController.login));
router.post(
  "/register",
  validateRegister,
  asyncHandler(authController.register)
);
router.post("/logout", asyncHandler(authController.logout));
router.get("/me", asyncHandler(authController.getCurrentUser));

export { router as authRoutes };
