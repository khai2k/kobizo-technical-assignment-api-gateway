import { Request, Response } from "express";
import { directusService } from "../config/directus";
import { AppError } from "../middleware/error.middleware";
import {
  ApiResponse,
  CheckoutRequest,
  CheckoutResponse,
  CheckoutItem,
  StockCheckResult,
} from "../types";
import { logger } from "../utils/logger";

class CheckoutController {
  async checkout(req: Request, res: Response): Promise<void> {
    try {
      const { items }: CheckoutRequest = req.body;

      // Validate request
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw new AppError("Items array is required and cannot be empty", 400);
      }

      // Validate each item
      for (const item of items) {
        if (!item.productId || !item.quantity) {
          throw new AppError("Each item must have productId and quantity", 400);
        }
        if (item.quantity <= 0) {
          throw new AppError("Quantity must be greater than 0", 400);
        }
      }

      logger.info(`Processing checkout for ${items.length} items`);

      // Extract product IDs
      const productIds = items.map((item) => item.productId);

      // Check stock availability
      const availableProducts = await directusService.checkStockAvailability(
        productIds
      );

      // Create a map of available products for quick lookup
      const productMap = new Map();
      availableProducts.forEach((product) => {
        productMap.set(product.id, product);
      });

      // Perform stock validation
      const stockCheckResults: StockCheckResult[] = [];
      let canProceed = true;
      const outOfStockItems: string[] = [];

      for (const item of items) {
        const product = productMap.get(item.productId);

        if (!product) {
          // Product not found
          stockCheckResults.push({
            productId: item.productId,
            productName: "Product not found",
            requestedQuantity: item.quantity,
            availableStock: 0,
            isAvailable: false,
          });
          canProceed = false;
          outOfStockItems.push(item.productId);
          continue;
        }

        const availableStock = product.stock_quantity || 0;
        const isAvailable = availableStock >= item.quantity;

        stockCheckResults.push({
          productId: item.productId,
          productName: product.name,
          requestedQuantity: item.quantity,
          availableStock,
          isAvailable,
        });

        if (!isAvailable) {
          canProceed = false;
          outOfStockItems.push(item.productId);
        }
      }

      // If any items are out of stock, return 400 error
      if (!canProceed) {
        const outOfStockNames = stockCheckResults
          .filter((result) => !result.isAvailable)
          .map((result) => result.productName)
          .join(", ");

        const response: ApiResponse<CheckoutResponse> = {
          success: false,
          error: "Insufficient stock",
          data: {
            success: false,
            message: `The following items are out of stock or insufficient quantity: ${outOfStockNames}`,
            stockCheck: stockCheckResults,
            totalItems: items.length,
            canProceed: false,
          },
        };

        logger.warn(
          `Checkout failed due to insufficient stock: ${outOfStockNames}`
        );
        res.status(400).json(response);
        return;
      }

      // All items are available, proceed with checkout
      const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

      const response: ApiResponse<CheckoutResponse> = {
        success: true,
        data: {
          success: true,
          message: "All items are available. Checkout can proceed.",
          stockCheck: stockCheckResults,
          totalItems,
          canProceed: true,
        },
        message: "Stock validation successful",
      };

      logger.info(
        `Checkout validation successful for ${items.length} items (${totalItems} total quantity)`
      );
      res.status(200).json(response);
    } catch (error) {
      logger.error("Checkout failed:", error);
      if (error instanceof AppError) {
        throw error;
      }
      throw new AppError("Checkout processing failed", 500);
    }
  }
}

export const checkoutController = new CheckoutController();
