import express from "express";
import { handleGetStores } from "../controllers/store-controller";

const router = express.Router();

router.get("/", handleGetStores);
// router.get("/:id", handleGetStoreById);

export default router;
