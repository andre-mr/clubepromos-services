"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const crawler_controller_1 = require("../controllers/crawler-controller");
const router = express_1.default.Router();
router.get("/", crawler_controller_1.handleGetCrawlers);
router.get("/:id", crawler_controller_1.handleGetCrawlerById);
router.put("/:id", crawler_controller_1.handleUpdateCrawler);
router.delete("/:id", crawler_controller_1.handleDeleteCrawler);
router.post("/", crawler_controller_1.handleCreateCrawler);
router.post("/:id/run", crawler_controller_1.handleRunCrawler);
exports.default = router;
