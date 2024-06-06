import { getProductByIdWithNames, getProductsWithNames } from "../database/product-dao";
import { Request, Response } from "express";

export const handleGetProductsById = async (req: Request, res: Response) => {
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

  const storeId =
    typeof storeIdParam === "string" && !isNaN(Number(storeIdParam)) && Number(storeIdParam) % 1 === 0
      ? Number(storeIdParam)
      : null;

  if (!storeId) {
    return res.status(400).json({ message: "Invalid or missing store ID" });
  }

  try {
    const productsResponse = await getProductsWithNames(storeId);
    res.status(200).json(productsResponse);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
