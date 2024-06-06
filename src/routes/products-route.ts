import express from "express";
import { handleGetProductsById, handleGetProducts } from "../controllers/product-controller";

const router = express.Router();

router.get("/", handleGetProducts);
router.get("/:id", handleGetProductsById);

export default router;
