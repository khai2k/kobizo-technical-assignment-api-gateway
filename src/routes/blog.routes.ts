import { Router } from "express";
import { blogController } from "../controllers/blog.controller";
import { asyncHandler } from "../middleware/error.middleware";

const router = Router();

// Routes
router.get("/", asyncHandler(blogController.getAllBlogPosts));
router.get("/:slug", asyncHandler(blogController.getBlogPostBySlug));

export { router as blogRoutes };
