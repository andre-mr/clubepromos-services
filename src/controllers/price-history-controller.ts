import { getPriceRecords } from "../database/price-record-dao";
import { Request, Response } from "express";

export const handleGetPriceHistory = async (req: Request, res: Response) => {
  const productIdParam = req.query.productId;
  const daysParam = req.query.days;

  const productId =
    typeof productIdParam === "string" && !isNaN(Number(productIdParam)) && Number(productIdParam) % 1 === 0
      ? Number(productIdParam)
      : null;

  const days =
    typeof daysParam === "string" && !isNaN(Number(daysParam)) && Number(daysParam) % 1 === 0
      ? Number(daysParam)
      : undefined;

  if (!productId) {
    return res.status(400).json({ message: "Invalid or missing product ID" });
  }

  try {
    const history = await getPriceRecords(productId, days);
    res.json(history);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
