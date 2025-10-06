import { Request, Response } from "express";
import { directusService } from "../config/directus";
import { AppError } from "../middleware/error.middleware";
import { ApiResponse, BlogPost } from "../types";
import { logger } from "../utils/logger";

class BlogController {
  async getAllBlogPosts(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Fetching all blog posts from Directus");

      const blogPosts = await directusService.getBlogPosts();

      // Transform the data to match our BlogPost interface
      const transformedPosts: BlogPost[] = blogPosts.map((post: any) => ({
        id: post.id,
        title: post.title,
        slug: post.slug,
        content: post.content,
        author: post.author,
        published_date: post.published_date,
      }));

      const response: ApiResponse<BlogPost[]> = {
        success: true,
        data: transformedPosts,
        message: `Retrieved ${transformedPosts.length} blog posts`,
      };

      logger.info(
        `Successfully retrieved ${transformedPosts.length} blog posts`
      );
      res.status(200).json(response);
    } catch (error) {
      logger.error("Failed to fetch blog posts:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to fetch blog posts", 500);
    }
  }

  async getBlogPostBySlug(req: Request, res: Response): Promise<void> {
    try {
      const { slug } = req.params;

      if (!slug) {
        throw new AppError("Blog post slug is required", 400);
      }

      logger.info(`Fetching blog post with slug: ${slug} from Directus`);

      const blogPost = await directusService.getBlogPostBySlug(slug);

      if (!blogPost) {
        throw new AppError("Blog post not found", 404);
      }

      // Transform the data to match our BlogPost interface
      const transformedPost: BlogPost = {
        id: blogPost.id,
        title: blogPost.title,
        slug: blogPost.slug,
        content: blogPost.content,
        author: blogPost.author,
        published_date: blogPost.published_date,
      };

      const response: ApiResponse<BlogPost> = {
        success: true,
        data: transformedPost,
        message: "Blog post retrieved successfully",
      };

      logger.info(`Successfully retrieved blog post with slug: ${slug}`);
      res.status(200).json(response);
    } catch (error) {
      logger.error(
        `Failed to fetch blog post with slug ${req.params.slug}:`,
        error
      );
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to fetch blog post", 500);
    }
  }
}

export const blogController = new BlogController();
