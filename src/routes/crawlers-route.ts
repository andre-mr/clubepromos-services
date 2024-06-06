import express from "express";
import {
  handleCreateCrawler,
  handleDeleteCrawler,
  handleRunCrawler,
  handleGetCrawlers,
  handleGetCrawlerById,
  handleUpdateCrawler,
} from "../controllers/crawler-controller";

const router = express.Router();

router.get("/", handleGetCrawlers);
router.get("/:id", handleGetCrawlerById);

router.put("/:id", handleUpdateCrawler);

router.delete("/:id", handleDeleteCrawler);

router.post("/", handleCreateCrawler);
router.post("/:id/run", handleRunCrawler);

export default router;
