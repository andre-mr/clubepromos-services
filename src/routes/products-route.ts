import express from "express";
import { handleGetProductById, handleGetProducts } from "../controllers/product-controller";

const router = express.Router();

router.get("/", handleGetProducts);
router.get("/:id", handleGetProductById);

export default router;
