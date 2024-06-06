"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCrawler = exports.updateCrawler = exports.createCrawler = exports.getCrawlerByIdWithStoreName = exports.getCrawlerById = exports.getCrawlersWithStoreName = exports.getCrawlers = void 0;
const crawler_1 = __importDefault(require("../models/crawler"));
const store_1 = __importDefault(require("../models/store"));
const transformCrawlerToResponse = (crawler) => {
    return {
        crawlerId: crawler.crawlerId,
        storeName: crawler.Store ? crawler.Store.storeName : null,
        url: crawler.url,
        delayHours: crawler.delayHours,
        lastExecution: crawler.lastExecution,
    };
};
const getCrawlers = async (storeId) => {
    const whereClause = {};
    if (storeId !== undefined) {
        whereClause.storeId = storeId;
    }
    return await crawler_1.default.findAll({ where: whereClause });
};
exports.getCrawlers = getCrawlers;
const getCrawlersWithStoreName = async (storeId) => {
    const whereClause = {};
    if (storeId !== undefined) {
        whereClause.storeId = storeId;
    }
    const crawlers = await crawler_1.default.findAll({
        where: whereClause,
        include: {
            model: store_1.default,
            attributes: ["storeName"],
        },
    });
    return crawlers.map(transformCrawlerToResponse);
};
exports.getCrawlersWithStoreName = getCrawlersWithStoreName;
const getCrawlerById = async (crawlerId) => {
    return await crawler_1.default.findOne({ where: { crawlerId } });
};
exports.getCrawlerById = getCrawlerById;
const getCrawlerByIdWithStoreName = async (crawlerId) => {
    const crawler = await crawler_1.default.findOne({
        where: { crawlerId },
        include: {
            model: store_1.default,
            attributes: ["storeName"],
        },
    });
    if (!crawler) {
        return null;
    }
    return transformCrawlerToResponse(crawler);
};
exports.getCrawlerByIdWithStoreName = getCrawlerByIdWithStoreName;
const createCrawler = async ({ storeId, url, delayHours, lastExecution }) => {
    try {
        const [crawler, created] = await crawler_1.default.findOrCreate({
            where: { url },
            defaults: {
                storeId,
                url,
                delayHours,
                lastExecution,
            },
        });
        if (!created) {
            console.error("Crawler with this URL already exists");
            return null;
        }
        return crawler;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error adding crawler: ${error.message}`);
        }
        return null;
    }
};
exports.createCrawler = createCrawler;
const updateCrawler = async (crawlerId, updateValues) => {
    try {
        const [updatedRows] = await crawler_1.default.update(updateValues, {
            where: { crawlerId },
        });
        if (updatedRows === 0) {
            console.error("Crawler not found or identical data provided");
        }
        return updatedRows;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error updating crawler: ${error.message}`);
        }
    }
};
exports.updateCrawler = updateCrawler;
const deleteCrawler = async (crawlerId) => {
    try {
        const deletedRows = await crawler_1.default.destroy({
            where: { crawlerId },
        });
        if (deletedRows === 0) {
            console.error("Crawler not found");
        }
        return deletedRows;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error deleting crawler: ${error.message}`);
        }
    }
};
exports.deleteCrawler = deleteCrawler;
