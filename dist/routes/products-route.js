"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const product_controller_1 = require("../controllers/product-controller");
const router = express_1.default.Router();
router.get("/", product_controller_1.handleGetProducts);
router.get("/:id", product_controller_1.handleGetProductsById);
exports.default = router;
