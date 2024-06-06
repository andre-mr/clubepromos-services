"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteProduct = exports.updateProduct = exports.createProduct = exports.getProductsWithNames = exports.getProducts = exports.getProductBySKUAndStore = exports.getProductByIdWithNames = exports.getProductById = void 0;
const category_1 = __importDefault(require("../models/category"));
const product_1 = __importDefault(require("../models/product"));
const store_1 = __importDefault(require("../models/store"));
const sequelize_1 = require("sequelize");
const transformProductToResponse = (product) => {
    return {
        productId: product.productId,
        categoryName: product.Category ? product.Category.categoryName : null,
        productBrand: product.productBrand,
        productImage: product.productImage,
        productName: product.productName,
        productSku: product.productSku,
        productUrl: product.productUrl,
        storeName: product.Store ? product.Store.storeName : null,
        lastPrice: product.get("lastPrice"),
    };
};
const getProductById = async (productId) => {
    return await product_1.default.findOne({ where: { productId } });
};
exports.getProductById = getProductById;
const getProductByIdWithNames = async (productId) => {
    const product = await product_1.default.findOne({
        where: { productId },
        include: [
            {
                model: store_1.default,
                attributes: ["storeName"],
            },
            {
                model: category_1.default,
                attributes: ["categoryName"],
            },
        ],
        attributes: {
            include: [
                // Subquery to get the latest price
                [
                    (0, sequelize_1.literal)(`(
            SELECT price 
            FROM price_records 
            WHERE price_records.product_id = Product.product_id
            ORDER BY price_records.price_timestamp DESC 
            LIMIT 1
          )`),
                    "lastPrice",
                ],
            ],
        },
    });
    if (!product) {
        return null;
    }
    return transformProductToResponse(product);
};
exports.getProductByIdWithNames = getProductByIdWithNames;
const getProductBySKUAndStore = async (productSku, storeId) => {
    return await product_1.default.findOne({ where: { productSku, storeId } });
};
exports.getProductBySKUAndStore = getProductBySKUAndStore;
const getProducts = async (storeId, categoryId) => {
    const whereClause = {};
    if (storeId !== undefined) {
        whereClause.storeId = storeId;
    }
    if (categoryId !== undefined) {
        whereClause.categoryId = categoryId;
    }
    return await product_1.default.findAll({
        where: whereClause,
    });
};
exports.getProducts = getProducts;
const getProductsWithNames = async (storeId, categoryId) => {
    const whereClause = {};
    if (storeId !== undefined) {
        whereClause.storeId = storeId;
    }
    if (categoryId !== undefined) {
        whereClause.categoryId = categoryId;
    }
    const products = await product_1.default.findAll({
        where: whereClause,
        include: [
            {
                model: store_1.default,
                attributes: ["storeName"],
            },
            {
                model: category_1.default,
                attributes: ["categoryName"],
            },
        ],
    });
    return products.map(transformProductToResponse);
};
exports.getProductsWithNames = getProductsWithNames;
const createProduct = async ({ categoryId, productBrand, productImage, productName, productSku, productUrl, storeId, }) => {
    try {
        const [product, created] = await product_1.default.findOrCreate({
            where: { productSku },
            defaults: {
                categoryId,
                productBrand,
                productImage,
                productName,
                productSku,
                productUrl,
                storeId,
            },
        });
        if (!created) {
            console.error("Product with this SKU already exists");
            return null;
        }
        return product;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error adding product: ${error.message}`);
        }
        return null;
    }
};
exports.createProduct = createProduct;
const updateProduct = async (productId, updateValues) => {
    try {
        const [updatedRows] = await product_1.default.update(updateValues, {
            where: { productId },
        });
        if (updatedRows === 0) {
            console.error("Product not found or identical data provided");
        }
        return updatedRows;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error updating product: ${error.message}`);
        }
    }
};
exports.updateProduct = updateProduct;
const deleteProduct = async (productId) => {
    try {
        const deletedRows = await product_1.default.destroy({
            where: { productId },
        });
        if (deletedRows === 0) {
            console.error("Product not found");
        }
        return deletedRows;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error deleting product: ${error.message}`);
        }
    }
};
exports.deleteProduct = deleteProduct;
