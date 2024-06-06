"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleGetPriceHistory = void 0;
const price_record_dao_1 = require("../database/price-record-dao");
const handleGetPriceHistory = async (req, res) => {
    const productIdParam = req.query.productId;
    const daysParam = req.query.days;
    const productId = typeof productIdParam === "string" && !isNaN(Number(productIdParam)) && Number(productIdParam) % 1 === 0
        ? Number(productIdParam)
        : null;
    const days = typeof daysParam === "string" && !isNaN(Number(daysParam)) && Number(daysParam) % 1 === 0
        ? Number(daysParam)
        : undefined;
    if (!productId) {
        return res.status(400).json({ message: "Invalid or missing product ID" });
    }
    try {
        const history = await (0, price_record_dao_1.getPriceRecords)(productId, days);
        res.json(history);
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
exports.handleGetPriceHistory = handleGetPriceHistory;
