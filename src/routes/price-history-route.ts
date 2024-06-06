import express from "express";
import { handleGetPriceHistory } from "../controllers/price-history-controller";

const router = express.Router();

router.get("/", handleGetPriceHistory);

export default router;
