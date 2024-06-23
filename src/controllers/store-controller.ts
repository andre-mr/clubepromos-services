import { Request, Response } from "express";
import { getStores } from "../database/store-dao";

export const handleGetStores = async (req: Request, res: Response) => {
  try {
    const storesResponse = await getStores();
    res.status(200).json(storesResponse);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
