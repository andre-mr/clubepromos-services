import { getProductByIdWithNames, getProductsWithNames } from "../database/product-dao";
import { Request, Response } from "express";

export const handleGetProductById = async (req: Request, res: Response) => {
  const productIdParam = req.params.id as string;

  const productId =
    productIdParam && !isNaN(parseInt(productIdParam, 10)) && parseInt(productIdParam, 10).toString() === productIdParam
      ? parseInt(productIdParam, 10)
      : null;

  if (!productId) {
    return res.status(400).json({ message: "Invalid or missing crawler Id" });
  }

  try {
    const productResponse = await getProductByIdWithNames(productId);
    res.status(200).json(productResponse);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const handleGetProducts = async (req: Request, res: Response) => {
  const storeIdParam = req.query.storeId;
  const crawlerIdParam = req.query.crawlerId;
  const categoryIdParam = req.query.categoryId;

  const storeId =
    typeof storeIdParam === "string" && !isNaN(Number(storeIdParam)) && Number(storeIdParam) % 1 === 0
      ? Number(storeIdParam)
      : undefined;

  const crawlerId =
    typeof crawlerIdParam === "string" && !isNaN(Number(crawlerIdParam)) && Number(crawlerIdParam) % 1 === 0
      ? Number(crawlerIdParam)
      : undefined;

  const categoryId =
    typeof categoryIdParam === "string" && !isNaN(Number(categoryIdParam)) && Number(categoryIdParam) % 1 === 0
      ? Number(categoryIdParam)
      : undefined;

  if (!storeId && !crawlerId) {
    return res.status(400).json({ message: "At least one of storeId or crawlerId must be provided." });
  }

  try {
    const productsResponse = await getProductsWithNames(storeId, crawlerId, categoryId);
    res.status(200).json(productsResponse);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
