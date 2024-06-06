"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../database/sequelize"));
class Product extends sequelize_1.Model {
}
Product.init({
    productId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "product_id",
    },
    categoryId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "category_id",
    },
    productBrand: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: true,
        field: "product_brand",
    },
    productImage: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        field: "product_image",
    },
    productName: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
        field: "product_name",
    },
    productSku: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        field: "product_sku",
    },
    productUrl: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: true,
        field: "product_url",
    },
    storeId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "store_id",
    },
}, {
    sequelize: sequelize_2.default,
    tableName: "products",
    timestamps: false,
});
exports.default = Product;
