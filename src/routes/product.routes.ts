import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { authenticateToken } from "../middleware/auth.middleware";
import { asyncHandler } from "../middleware/error.middleware";

const router = Router();

// All product routes require authentication
router.use(authenticateToken);

// Routes
router.get("/", asyncHandler(productController.getAllProducts));
router.get("/:id", asyncHandler(productController.getProductById));

export { router as productRoutes };
