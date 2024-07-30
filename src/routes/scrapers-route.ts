import express from "express";
import { handleScrapStore } from "../controllers/scraper-controller";
// import { gzipMiddleware } from "../middlewares/gzip.middleware";

const router = express.Router();

// router.use(gzipMiddleware);
router.post("/:storename", handleScrapStore);

export default router;
