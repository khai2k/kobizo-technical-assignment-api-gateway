import {
  createDirectus,
  rest,
  authentication,
  readItems,
  readMe,
  createItem,
} from "@directus/sdk";
import { logger } from "../utils/logger";

// Define the schema for our collections
interface Schema {
  products: {
    id: string;
    name: string;
    slug: string;
    price: number;
    description: string;
    stock_quantity: number;
    image_url: string;
    created_at: string;
    updated_at: string;
  };
  users: any;
  blog_posts: {
    id: string;
    title: string;
    slug: string;
    content: string;
    author: string;
    published_date: string;
  };
}

class DirectusService {
  private client: any;
  private isAuthenticated: boolean = false;

  constructor() {
    const directusUrl = process.env.DIRECTUS_URL || "http://localhost:8055";
    this.client = createDirectus(directusUrl)
      .with(rest())
      .with(authentication());
  }

  async authenticate(): Promise<void> {
    try {
      const email = process.env.DIRECTUS_EMAIL;
      const password = process.env.DIRECTUS_PASSWORD;
      const token = process.env.DIRECTUS_TOKEN;

      if (token) {
        // Use static token authentication
        await this.client.setToken(token);
        this.isAuthenticated = true;
        logger.info("Authenticated with Directus using static token");
      } else if (email && password) {
        // Use email/password authentication
        await this.client.login(email, password);
        this.isAuthenticated = true;
        logger.info("Authenticated with Directus using email/password");
      } else {
        throw new Error("No authentication method configured");
      }
    } catch (error) {
      logger.error("Failed to authenticate with Directus:", error);
      throw new Error("Directus authentication failed");
    }
  }

  async ensureAuthenticated(): Promise<void> {
    if (!this.isAuthenticated) {
      await this.authenticate();
    }
  }

  async loginUser(email: string, password: string): Promise<any> {
    try {
      // Create a new client instance for user authentication
      const userClient = createDirectus(
        process.env.DIRECTUS_URL || "http://localhost:8055"
      )
        .with(rest())
        .with(authentication());

      const response = await userClient.login(email, password);
      return response;
    } catch (error) {
      logger.error("User login failed:", error);
      throw new Error("Invalid credentials");
    }
  }

  async registerUser(userData: {
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
  }): Promise<any> {
    try {
      // Create a new client instance for user registration
      const userClient = createDirectus(
        process.env.DIRECTUS_URL || "http://localhost:8055"
      )
        .with(rest())
        .with(authentication());

      const response = await userClient.request(createItem("users", userData));
      return response;
    } catch (error) {
      logger.error("User registration failed:", error);
      throw new Error("Registration failed");
    }
  }

  async getProducts(): Promise<any[]> {
    try {
      await this.ensureAuthenticated();

      const products = await (this.client as any).request(
        (readItems as any)("products", {
          fields: [
            "id",
            "name",
            "slug",
            "price",
            "description",
            "stock_quantity",
            "image_url",
            "created_at",
            "updated_at",
          ],
          limit: -1, // Get all products
        })
      );

      return products;
    } catch (error) {
      logger.error("Failed to fetch products:", error);
      throw new Error("Failed to fetch products from Directus");
    }
  }

  async getProductById(id: string): Promise<any> {
    try {
      await this.ensureAuthenticated();

      const product = await (this.client as any).request(
        (readItems as any)("products", {
          fields: [
            "id",
            "name",
            "slug",
            "price",
            "description",
            "stock_quantity",
            "image_url",
            "created_at",
            "updated_at",
          ],
          filter: {
            id: {
              _eq: id,
            },
          },
          limit: 1,
        })
      );

      return product[0] || null;
    } catch (error) {
      logger.error("Failed to fetch product by ID:", error);
      throw new Error("Failed to fetch product from Directus");
    }
  }

  async getUserInfo(accessToken: string): Promise<any> {
    try {
      // Create a new client instance with the user's access token
      const userClient = createDirectus(
        process.env.DIRECTUS_URL || "http://localhost:8055"
      )
        .with(rest())
        .with(authentication());

      // Set the user's access token
      await userClient.setToken(accessToken);

      // Get current user information using readMe
      const userInfo = await userClient.request(readMe());

      return userInfo;
    } catch (error) {
      logger.error("Failed to get user info:", error);
      throw new Error("Failed to get user information from Directus");
    }
  }

  async checkStockAvailability(productIds: string[]): Promise<any[]> {
    try {
      await this.ensureAuthenticated();

      const products = await (this.client as any).request(
        (readItems as any)("products", {
          fields: ["id", "name", "stock_quantity"],
          filter: {
            id: {
              _in: productIds,
            },
          },
          limit: -1,
        })
      );

      return products;
    } catch (error) {
      logger.error("Failed to check stock availability:", error);
      throw new Error("Failed to check stock availability from Directus");
    }
  }

  async getBlogPosts(): Promise<any[]> {
    try {
      await this.ensureAuthenticated();

      const blogPosts = await (this.client as any).request(
        (readItems as any)("blog_posts", {
          fields: [
            "id",
            "title",
            "slug",
            "content",
            "author",
            "published_date",
          ],
          sort: ["-published_date"],
          limit: -1,
        })
      );

      return blogPosts;
    } catch (error) {
      logger.error("Failed to fetch blog posts:", error);
      throw new Error("Failed to fetch blog posts from Directus");
    }
  }

  async getBlogPostBySlug(slug: string): Promise<any> {
    try {
      await this.ensureAuthenticated();

      const blogPost = await (this.client as any).request(
        (readItems as any)("blog_posts", {
          fields: [
            "id",
            "title",
            "slug",
            "content",
            "author",
            "published_date",
          ],
          filter: {
            slug: {
              _eq: slug,
            },
          },
          limit: 1,
        })
      );

      return blogPost[0] || null;
    } catch (error) {
      logger.error("Failed to fetch blog post by slug:", error);
      throw new Error("Failed to fetch blog post from Directus");
    }
  }
}

export const directusService = new DirectusService();
