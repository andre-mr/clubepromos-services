"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPriceRecord = exports.getLatestPriceRecord = exports.getPriceRecords = void 0;
const sequelize_1 = require("sequelize");
const associations_1 = __importDefault(require("./associations"));
const store_1 = __importDefault(require("../models/store"));
const product_1 = __importDefault(require("../models/product"));
const category_1 = __importDefault(require("../models/category"));
const price_record_1 = __importDefault(require("../models/price-record"));
(0, associations_1.default)();
const getPriceRecords = async (productId, days = 7) => {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - days);
    const whereClause = {
        productId,
        priceTimestamp: {
            [sequelize_1.Op.gte]: targetDate,
        },
    };
    const history = await price_record_1.default.findAll({
        where: whereClause,
        order: [["priceTimestamp", "DESC"]],
    });
    return history.map((record) => ({
        productId: record.getDataValue("productId"),
        priceTimestamp: record.getDataValue("priceTimestamp"),
        price: record.getDataValue("price"),
    }));
};
exports.getPriceRecords = getPriceRecords;
const getLatestPriceRecord = async (storeName, productId) => {
    var _a;
    const store = await store_1.default.findOne({ where: { storeName: storeName } });
    if (!store) {
        console.error("Store not found");
        return null;
    }
    const latestRecord = await price_record_1.default.findOne({
        include: [
            {
                model: product_1.default,
                required: true,
                include: [
                    {
                        model: category_1.default,
                        required: true,
                    },
                ],
                where: { storeId: store.storeId, productId: productId },
            },
        ],
        order: [["priceTimestamp", "DESC"]],
    });
    if (!latestRecord) {
        console.error("No price record found for the specified product and store");
        return null;
    }
    return {
        productId: latestRecord.getDataValue("productId"),
        priceTimestamp: latestRecord.getDataValue("priceTimestamp"),
        price: latestRecord.getDataValue("price"),
        productName: latestRecord.get("Product").productName,
        categoryName: (_a = latestRecord.get("Product").category) === null || _a === void 0 ? void 0 : _a.categoryName,
        storeName: store.getDataValue("storeName"),
    };
};
exports.getLatestPriceRecord = getLatestPriceRecord;
const createPriceRecord = async ({ productId, price, priceTimestamp = new Date() }) => {
    try {
        const newRecord = await price_record_1.default.create({
            productId,
            price,
            priceTimestamp,
        });
        return newRecord;
    }
    catch (error) {
        console.error(`Erro ao adicionar registro de preço: ${error}`);
        return null;
    }
};
exports.createPriceRecord = createPriceRecord;
