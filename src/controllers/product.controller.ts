import { Request, Response } from "express";
import { directusService } from "../config/directus";
import { AppError } from "../middleware/error.middleware";
import { ApiResponse, Product } from "../types";
import { logger } from "../utils/logger";

class ProductController {
  async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      logger.info("Fetching all products from Directus");

      const products = await directusService.getProducts();

      // Transform the data if needed (add business logic here)
      const transformedProducts = products.map((product: any) => ({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        description: product.description,
        stock_quantity: Number(product.stock_quantity),
        image_url: product.image_url,
        created_at: product.created_at,
        updated_at: product.updated_at,
      }));

      const response: ApiResponse<Product[]> = {
        success: true,
        data: transformedProducts,
        message: `Retrieved ${transformedProducts.length} products`,
      };

      logger.info(
        `Successfully retrieved ${transformedProducts.length} products`
      );
      res.status(200).json(response);
    } catch (error) {
      logger.error("Failed to fetch products:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to fetch products", 500);
    }
  }

  async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      if (!id) {
        throw new AppError("Product ID is required", 400);
      }

      logger.info(`Fetching product ${id} from Directus`);

      const product = await directusService.getProductById(id);

      if (!product) {
        throw new AppError("Product not found", 404);
      }

      // Transform the data if needed (add business logic here)
      const transformedProduct: Product = {
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: Number(product.price),
        description: product.description,
        stock_quantity: Number(product.stock_quantity),
        image_url: product.image_url,
        created_at: product.created_at,
        updated_at: product.updated_at,
      };

      const response: ApiResponse<Product> = {
        success: true,
        data: transformedProduct,
        message: "Product retrieved successfully",
      };

      logger.info(`Successfully retrieved product ${id}`);
      res.status(200).json(response);
    } catch (error) {
      logger.error(`Failed to fetch product ${req.params.id}:`, error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Failed to fetch product", 500);
    }
  }
}

export const productController = new ProductController();
