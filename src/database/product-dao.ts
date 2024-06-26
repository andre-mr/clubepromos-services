import Category from "../models/category";
import PriceRecord from "../models/price-record";
import Product from "../models/product";
import { ProductResponse } from "../models/product-response";
import Store from "../models/store";
import { literal, Op } from "sequelize";
import defineModelAssociations from "./associations";
import Crawler from "../models/crawler";
import { PriceHistory } from "../models/price-history";

defineModelAssociations();

const transformProductToResponse = (product: Product): ProductResponse => {
  const priceHistory = (product as any).PriceRecords.map(
    (priceRecord: PriceRecord) =>
      ({
        timestamp: priceRecord.priceTimestamp,
        price: priceRecord.price,
      } as PriceHistory)
  ) as PriceHistory[];

  return {
    productId: product.productId!,

    categoryName: (product as any).Category ? (product as any).Category.categoryName : null,
    createdAt: product.createdAt,
    productBrand: product.productBrand,
    productImage: product.productImage,
    productName: product.productName,
    productSku: product.productSku,
    productUrl: product.productUrl,
    storeName: (product as any).Store ? (product as any).Store.storeName : null,
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
  categoryId?: number,
  searchTerm?: string
): Promise<ProductResponse[]> => {
  const whereClause: { storeId?: number; categoryId?: number; productName?: any; "$crawlers.crawler_id$"?: number } =
    {};
  if (storeId !== undefined) {
    whereClause.storeId = storeId;
  }
  if (crawlerId !== undefined) {
    whereClause["$crawlers.crawler_id$"] = crawlerId;
  }
  if (categoryId !== undefined) {
    whereClause.categoryId = categoryId;
  }
  if (searchTerm !== undefined) {
    whereClause.productName = { [Op.like]: `%${searchTerm}%` };
  }

  const includeClause: any[] = [
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
      limit: 100,
    },
  ];

  if (crawlerId !== undefined) {
    includeClause.push({
      model: Crawler,
      attributes: [],
      through: {
        attributes: [],
        where: {
          crawlerId: crawlerId,
        },
      },
      required: crawlerId !== undefined, // Ensures inner join if crawlerId is provided
    });
  }

  const products = await Product.findAll({
    where: whereClause,
    include: includeClause,
  });

  return products.map(transformProductToResponse);
};

export const getRecentOrDiscountedProducts = async (): Promise<ProductResponse[]> => {
  const currentDate = new Date();
  const yesterday = new Date(currentDate.getTime() - 24 * 60 * 60 * 1000);

  const recentProductsWhereClause = {
    createdAt: {
      [Op.gte]: yesterday,
    },
  };

  const discountedProductsWhereClause = literal(`
    EXISTS (
      SELECT 1
      FROM price_records AS pr1
      JOIN (
        SELECT pr2.product_id, MAX(pr2.price_timestamp) AS max_price_timestamp
        FROM price_records AS pr2
        GROUP BY pr2.product_id
      ) AS latest
      ON pr1.product_id = latest.product_id
      AND pr1.price_timestamp = latest.max_price_timestamp
      WHERE pr1.product_id = Product.product_id
      AND pr1.price < (
        SELECT pr3.price
        FROM price_records AS pr3
        WHERE pr3.product_id = Product.product_id
        AND pr3.price_timestamp < pr1.price_timestamp
        ORDER BY pr3.price_timestamp DESC
        LIMIT 1
      )
    )
  `);

  const products = await Product.findAll({
    where: {
      [Op.or]: [recentProductsWhereClause, discountedProductsWhereClause],
    },
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
        limit: 100,
      },
    ],
  });

  return products.map(transformProductToResponse);
};

export const createProduct = async ({
  categoryId,
  createdAt,
  productBrand,
  productImage,
  productName,
  productSku,
  productUrl,
  storeId,
}: Product) => {
  try {
    const [product, wasCreated] = await Product.findOrCreate({
      where: { productSku },
      defaults: {
        categoryId,
        createdAt,
        productBrand,
        productImage,
        productName,
        productSku,
        productUrl,
        storeId,
      },
    });

    if (!wasCreated) {
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
