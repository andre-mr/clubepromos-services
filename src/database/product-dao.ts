import Category from "../models/category";
import PriceRecord from "../models/price-record";
import Product from "../models/product";
import { ProductResponse } from "../models/product-response";
import Store from "../models/store";
import { literal } from "sequelize";
import defineModelAssociations from "./associations";
import Crawler from "../models/crawler";

defineModelAssociations();

const transformProductToResponse = (product: Product): ProductResponse => {
  const priceHistory = (product as any).PriceRecords.map((priceRecord: PriceRecord) => ({
    timestamp: priceRecord.priceTimestamp,
    price: priceRecord.price,
  }));

  return {
    productId: product.productId!,

    categoryName: (product as any).Category ? (product as any).Category.categoryName : null,
    productBrand: product.productBrand,
    productImage: product.productImage,
    productName: product.productName,
    productSku: product.productSku,
    productUrl: product.productUrl,
    storeName: (product as any).Store ? (product as any).Store.storeName : null,
    lastPrice: product.get("lastPrice") as number,
    priceHistory: priceHistory,
  };
};

export const getProductById = async (productId: number) => {
  return await Product.findOne({ where: { productId } });
};

export const getProductByIdWithNames = async (productId: number) => {
  const product = await Product.findOne({
    where: { productId },
    include: [
      {
        model: Store,
        attributes: ["storeName"],
      },
      {
        model: Category,
        attributes: ["categoryName"],
      },
    ],
    attributes: {
      include: [
        // Subquery to get the latest price
        [
          literal(`(
            SELECT price 
            FROM price_records 
            WHERE price_records.product_id = Product.product_id
            ORDER BY price_records.price_timestamp DESC 
            LIMIT 1
          )`),
          "lastPrice",
        ],
      ],
    },
  });

  if (!product) {
    return null;
  }

  return transformProductToResponse(product);
};

export const getProductBySKUAndStore = async (productSku: string, storeId: number) => {
  return await Product.findOne({ where: { productSku, storeId } });
};

export const getProducts = async (storeId?: number, categoryId?: number) => {
  const whereClause: { storeId?: number; categoryId?: number } = {};

  if (storeId !== undefined) {
    whereClause.storeId = storeId;
  }
  if (categoryId !== undefined) {
    whereClause.categoryId = categoryId;
  }

  return await Product.findAll({
    where: whereClause,
  });
};

export const getProductsWithNames = async (
  storeId?: number,
  crawlerId?: number,
  categoryId?: number
): Promise<ProductResponse[]> => {
  if (storeId === undefined && crawlerId === undefined) {
    console.error("At least one of storeId or crawlerId must be provided.");
    return [];
  }

  const whereClause: { storeId?: number; categoryId?: number; [key: string]: any } = {};
  if (storeId !== undefined) {
    whereClause.storeId = storeId;
  }
  if (categoryId !== undefined) {
    whereClause.categoryId = categoryId;
  }
  if (crawlerId !== undefined) {
    whereClause["$crawlers.crawler_id$"] = crawlerId;
  }

  const products = await Product.findAll({
    where: whereClause,
    include: [
      {
        model: Store,
        attributes: ["storeName"],
      },
      {
        model: Category,
        attributes: ["categoryName"],
      },
      {
        model: PriceRecord,
        attributes: ["price", "priceTimestamp"],
        order: [["priceTimestamp", "DESC"]],
        limit: 10,
      },
      {
        model: Crawler,
        attributes: [],
        through: {
          attributes: [],
          where: {
            crawlerId: crawlerId,
          },
        },
        required: crawlerId !== undefined, // Ensures inner join if crawlerId is provided
      },
    ],
    attributes: {
      include: [
        [
          literal(`(
            SELECT price
            FROM price_records
            WHERE price_records.product_id = Product.product_id
            ORDER BY price_timestamp DESC
            LIMIT 1
          )`),
          "lastPrice",
        ],
      ],
    },
  });

  return products.map(transformProductToResponse);
};

export const createProduct = async ({
  categoryId,
  productBrand,
  productImage,
  productName,
  productSku,
  productUrl,
  storeId,
}: Product) => {
  try {
    const [product, created] = await Product.findOrCreate({
      where: { productSku },
      defaults: {
        categoryId,
        productBrand,
        productImage,
        productName,
        productSku,
        productUrl,
        storeId,
      },
    });

    if (!created) {
      console.error("Cannot create product, try again");
      return null;
    }

    return product;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error adding product: ${error.message}`);
    }
    return null;
  }
};

export const updateProduct = async (
  productId: number,
  updateValues: {
    categoryId?: number;
    productName?: string;
    productSku?: string;
    storeId?: number;
  }
) => {
  try {
    const [updatedRows] = await Product.update(updateValues, {
      where: { productId },
    });
    if (updatedRows === 0) {
      console.error("Product not found or identical data provided");
    }
    return updatedRows;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error updating product: ${error.message}`);
    }
  }
};

export const deleteProduct = async (productId: number) => {
  try {
    const deletedRows = await Product.destroy({
      where: { productId },
    });
    if (deletedRows === 0) {
      console.error("Product not found");
    }
    return deletedRows;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error deleting product: ${error.message}`);
    }
  }
};
