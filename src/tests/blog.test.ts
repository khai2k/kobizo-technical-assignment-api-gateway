import request from "supertest";
import app from "../index";
import { directusService } from "../config/directus";

// Mock the Directus service
jest.mock("../config/directus");
const mockedDirectusService = directusService as jest.Mocked<
  typeof directusService
>;

describe("Blog Endpoints", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/blog", () => {
    it("should return all blog posts", async () => {
      const mockBlogPosts = [
        {
          id: "1",
          title: "Getting Started with Next.js",
          slug: "getting-started-with-nextjs",
          content: "This is a comprehensive guide to Next.js development...",
          author: "John Doe",
          published_date: "2023-01-01T00:00:00Z",
        },
        {
          id: "2",
          title: "Advanced TypeScript Patterns",
          slug: "advanced-typescript-patterns",
          content: "Explore advanced TypeScript concepts and patterns...",
          author: "Jane Smith",
          published_date: "2023-01-02T00:00:00Z",
        },
      ];

      mockedDirectusService.getBlogPosts.mockResolvedValue(mockBlogPosts);

      const response = await request(app).get("/api/v1/blog");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty("id", "1");
      expect(response.body.data[0]).toHaveProperty(
        "title",
        "Getting Started with Next.js"
      );
      expect(response.body.data[0]).toHaveProperty(
        "slug",
        "getting-started-with-nextjs"
      );
      expect(response.body.data[0]).toHaveProperty("author", "John Doe");
    });

    it("should return empty array when no blog posts exist", async () => {
      mockedDirectusService.getBlogPosts.mockResolvedValue([]);

      const response = await request(app).get("/api/v1/blog");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(0);
      expect(response.body.message).toBe("Retrieved 0 blog posts");
    });

    it("should return 500 when Directus service fails", async () => {
      mockedDirectusService.getBlogPosts.mockRejectedValue(
        new Error("Directus connection failed")
      );

      const response = await request(app).get("/api/v1/blog");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it("should handle blog posts with simple author field", async () => {
      const mockBlogPosts = [
        {
          id: "1",
          title: "Blog Post With Author",
          slug: "blog-post-with-author",
          content: "Content here...",
          author: "John Doe",
          published_date: "2023-01-01T00:00:00Z",
        },
      ];

      mockedDirectusService.getBlogPosts.mockResolvedValue(mockBlogPosts);

      const response = await request(app).get("/api/v1/blog");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data[0].author).toBe("John Doe");
    });
  });

  describe("GET /api/v1/blog/:slug", () => {
    it("should return specific blog post by slug", async () => {
      const mockBlogPost = {
        id: "1",
        title: "Getting Started with Next.js",
        slug: "getting-started-with-nextjs",
        content: "This is a comprehensive guide to Next.js development...",
        author: "John Doe",
        published_date: "2023-01-01T00:00:00Z",
      };

      mockedDirectusService.getBlogPostBySlug.mockResolvedValue(mockBlogPost);

      const response = await request(app).get(
        "/api/v1/blog/getting-started-with-nextjs"
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty("id", "1");
      expect(response.body.data).toHaveProperty(
        "title",
        "Getting Started with Next.js"
      );
      expect(response.body.data).toHaveProperty(
        "slug",
        "getting-started-with-nextjs"
      );
      expect(response.body.data).toHaveProperty("author", "John Doe");
    });

    it("should return 404 for non-existent blog post", async () => {
      mockedDirectusService.getBlogPostBySlug.mockResolvedValue(null);

      const response = await request(app).get("/api/v1/blog/non-existent-slug");

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe("Blog post not found");
    });

    it("should return 200 for root blog endpoint", async () => {
      const mockBlogPosts = [
        {
          id: "1",
          title: "Blog Post",
          slug: "blog-post",
          content: "Content here...",
          author: "John Doe",
          published_date: "2023-01-01T00:00:00Z",
        },
      ];

      mockedDirectusService.getBlogPosts.mockResolvedValue(mockBlogPosts);

      const response = await request(app).get("/api/v1/blog/");

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    it("should return 500 when Directus service fails", async () => {
      mockedDirectusService.getBlogPostBySlug.mockRejectedValue(
        new Error("Directus connection failed")
      );

      const response = await request(app).get("/api/v1/blog/test-slug");

      expect(response.status).toBe(500);
      expect(response.body.success).toBe(false);
    });

    it("should handle blog post with simple author field", async () => {
      const mockBlogPost = {
        id: "1",
        title: "Blog Post With Author",
        slug: "blog-post-with-author",
        content: "Content here...",
        author: "John Doe",
        published_date: "2023-01-01T00:00:00Z",
      };

      mockedDirectusService.getBlogPostBySlug.mockResolvedValue(mockBlogPost);

      const response = await request(app).get(
        "/api/v1/blog/blog-post-with-author"
      );

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.author).toBe("John Doe");
    });
  });
});
