"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleCreateCrawler = exports.handleDeleteCrawler = exports.handleUpdateCrawler = exports.handleGetCrawlerById = exports.handleGetCrawlers = exports.runCrawler = exports.handleRunCrawler = void 0;
const amazon_crawler_1 = __importDefault(require("../services/amazon-crawler"));
const natura_crawler_1 = __importDefault(require("../services/natura-crawler"));
const product_dao_1 = require("../database/product-dao");
const price_record_dao_1 = require("../database/price-record-dao");
const category_dao_1 = require("../database/category-dao");
const product_1 = __importDefault(require("../models/product"));
const store_dao_1 = require("../database/store-dao");
const capitalize_1 = require("../utils/capitalize");
const crawler_dao_1 = require("../database/crawler-dao");
const scheduler_1 = require("../services/scheduler");
// import fs from "fs";
const handleRunCrawler = async (req, res) => {
    const { id } = req.params;
    if (!id || isNaN(Number(id))) {
        return res.status(400).json({ message: "Invalid or missing crawler Id" });
    }
    const crawlerDetected = await (0, crawler_dao_1.getCrawlerById)(Number.parseInt(id));
    if (!crawlerDetected) {
        return res.status(404).json({ message: "Crawler not found" });
    }
    const storeDetected = await (0, store_dao_1.findStoreByID)(crawlerDetected.storeId);
    if (!storeDetected) {
        return res.status(404).json({ message: "Store not found for the given crawler" });
    }
    const isCrawlerAlreadyRunning = (0, scheduler_1.isCrawlerRunning)(crawlerDetected);
    if (isCrawlerAlreadyRunning) {
        return res.status(400).json({ message: "Crawler is not ready to run" });
    }
    (0, exports.runCrawler)(crawlerDetected, storeDetected).then(() => {
        (0, crawler_dao_1.updateCrawler)(crawlerDetected.crawlerId, { lastExecution: new Date() });
    });
    return res
        .status(200)
        .json({ message: `Crawler ${crawlerDetected.crawlerId} for store ${storeDetected.storeName} started` });
};
exports.handleRunCrawler = handleRunCrawler;
const runCrawler = async (crawlerDetected, storeDetected) => {
    try {
        if (!storeDetected) {
            const foundStore = await (0, store_dao_1.findStoreByID)(crawlerDetected.storeId);
            if (!foundStore) {
                return false;
            }
            storeDetected = foundStore;
        }
        let crawledProducts;
        let recordsCreated = 0;
        switch (storeDetected.storeName) {
            case "Natura":
                crawledProducts = await (0, natura_crawler_1.default)();
                break;
            case "Amazon":
                crawledProducts = await (0, amazon_crawler_1.default)(crawlerDetected);
                break;
            default:
                console.error("Store not supported");
                return null;
        }
        const nowDate = new Date();
        let newProducts = 0;
        for (const product of crawledProducts) {
            const existingProduct = await (0, product_dao_1.getProductBySKUAndStore)(product.Sku, storeDetected.storeId);
            if (existingProduct) {
                const latestRecord = await (0, price_record_dao_1.getLatestPriceRecord)(storeDetected.storeName, existingProduct.productId);
                if (!latestRecord || latestRecord.price != product.Price) {
                    await (0, price_record_dao_1.createPriceRecord)({
                        productId: existingProduct.productId,
                        price: product.Price,
                        priceTimestamp: nowDate,
                    });
                    console.log("new price record for product Id:", existingProduct.productId);
                    recordsCreated++;
                }
            }
            else {
                const newProduct = new product_1.default();
                let category = await (0, category_dao_1.findCategoryByName)(product.CategoryName);
                if (!category) {
                    category = await (0, category_dao_1.createCategory)({ categoryName: (0, capitalize_1.capitalizeTitle)(product.CategoryName) });
                }
                newProduct.categoryId = (category === null || category === void 0 ? void 0 : category.categoryId) || 1;
                newProduct.productBrand = product.Brand;
                newProduct.productImage = product.ImageUrl;
                newProduct.productName = product.Name;
                newProduct.productSku = product.Sku;
                newProduct.productUrl = product.Url;
                newProduct.storeId = storeDetected.storeId;
                const newProductCreated = await (0, product_dao_1.createProduct)(newProduct);
                newProducts++;
                if (!newProductCreated) {
                    console.error("Error creating product");
                    continue;
                }
                await (0, price_record_dao_1.createPriceRecord)({
                    productId: newProductCreated.productId,
                    price: product.Price,
                    priceTimestamp: nowDate,
                });
                console.log("new product Id:", newProductCreated.productId);
                recordsCreated++;
            }
        }
        console.log(`Crawler [${storeDetected.storeName}][${crawlerDetected.crawlerId}] finished successfully!`);
        console.log(`${recordsCreated} price records created!`);
        console.log(`${newProducts} new products created!`);
        return true;
    }
    catch (error) {
        return false;
    }
};
exports.runCrawler = runCrawler;
const handleGetCrawlers = async (req, res) => {
    const storeIdParam = req.query.storeId;
    const storeId = storeIdParam && !isNaN(parseInt(storeIdParam, 10)) && parseInt(storeIdParam, 10).toString() === storeIdParam
        ? parseInt(storeIdParam, 10)
        : undefined;
    try {
        const crawlersResponse = await (0, crawler_dao_1.getCrawlersWithStoreName)(storeId);
        if (!crawlersResponse) {
            return res.status(404).json({ message: "Crawler not found" });
        }
        res.status(200).json(crawlersResponse);
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
exports.handleGetCrawlers = handleGetCrawlers;
const handleGetCrawlerById = async (req, res) => {
    const crawlerIdParam = req.params.id;
    const crawlerId = crawlerIdParam && !isNaN(parseInt(crawlerIdParam, 10)) && parseInt(crawlerIdParam, 10).toString() === crawlerIdParam
        ? parseInt(crawlerIdParam, 10)
        : null;
    if (!crawlerId) {
        return res.status(400).json({ message: "Invalid or missing crawler Id" });
    }
    try {
        const crawlerResponse = await (0, crawler_dao_1.getCrawlerByIdWithStoreName)(crawlerId);
        if (!crawlerResponse) {
            return res.status(404).json({ message: "Crawler not found" });
        }
        res.status(200).json(crawlerResponse);
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
exports.handleGetCrawlerById = handleGetCrawlerById;
const handleUpdateCrawler = async (req, res) => {
    const crawlerIdParam = req.params.id;
    const crawlerId = crawlerIdParam && !isNaN(parseInt(crawlerIdParam, 10)) && parseInt(crawlerIdParam, 10).toString() === crawlerIdParam
        ? parseInt(crawlerIdParam, 10)
        : null;
    if (!crawlerId) {
        return res.status(400).json({ message: "Invalid or missing crawler Id" });
    }
    const updateValues = req.body;
    try {
        const updatedRows = await (0, crawler_dao_1.updateCrawler)(crawlerId, updateValues);
        if (updatedRows === 0) {
            return res.status(404).json({ message: "Crawler not found or no changes made" });
        }
        res.status(200).json({ message: "Crawler updated successfully" });
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
exports.handleUpdateCrawler = handleUpdateCrawler;
const handleDeleteCrawler = async (req, res) => {
    const crawlerIdParam = req.params.id;
    const crawlerId = crawlerIdParam && !isNaN(parseInt(crawlerIdParam, 10)) && parseInt(crawlerIdParam, 10).toString() === crawlerIdParam
        ? parseInt(crawlerIdParam, 10)
        : null;
    if (!crawlerId) {
        return res.status(400).json({ message: "Invalid or missing crawler Id" });
    }
    try {
        const deletedRows = await (0, crawler_dao_1.deleteCrawler)(crawlerId);
        if (deletedRows === 0) {
            return res.status(404).json({ message: "Crawler not found" });
        }
        res.status(200).json({ message: "Crawler deleted successfully" });
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
exports.handleDeleteCrawler = handleDeleteCrawler;
const handleCreateCrawler = async (req, res) => {
    const crawlerData = req.body;
    try {
        const crawler = await (0, crawler_dao_1.createCrawler)(crawlerData);
        if (!crawler) {
            return res.status(409).json({ message: "Crawler with this SKU already exists" });
        }
        res.status(201).json({ message: "Crawler created successfully", crawler });
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
exports.handleCreateCrawler = handleCreateCrawler;
