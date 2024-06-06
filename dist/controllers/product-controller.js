"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetProducts = exports.handleGetProductsById = void 0;
const product_dao_1 = require("../database/product-dao");
const handleGetProductsById = async (req, res) => {
    const productIdParam = req.params.id;
    const productId = productIdParam && !isNaN(parseInt(productIdParam, 10)) && parseInt(productIdParam, 10).toString() === productIdParam
        ? parseInt(productIdParam, 10)
        : null;
    if (!productId) {
        return res.status(400).json({ message: "Invalid or missing crawler Id" });
    }
    try {
        const productResponse = await (0, product_dao_1.getProductByIdWithNames)(productId);
        res.status(200).json(productResponse);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
};
exports.handleGetProductsById = handleGetProductsById;
const handleGetProducts = async (req, res) => {
    const storeIdParam = req.query.storeId;
    const storeId = typeof storeIdParam === "string" && !isNaN(Number(storeIdParam)) && Number(storeIdParam) % 1 === 0
        ? Number(storeIdParam)
        : null;
    if (!storeId) {
        return res.status(400).json({ message: "Invalid or missing store ID" });
    }
    try {
        const productsResponse = await (0, product_dao_1.getProductsWithNames)(storeId);
        res.status(200).json(productsResponse);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ error: error.message });
        }
        else {
            res.status(500).json({ error: "An unknown error occurred" });
        }
    }
};
exports.handleGetProducts = handleGetProducts;
