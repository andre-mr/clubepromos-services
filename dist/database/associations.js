"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const category_1 = __importDefault(require("../models/category"));
const crawler_1 = __importDefault(require("../models/crawler"));
const price_record_1 = __importDefault(require("../models/price-record"));
const product_1 = __importDefault(require("../models/product"));
const store_1 = __importDefault(require("../models/store"));
function defineModelAssociations() {
    store_1.default.hasMany(product_1.default, { foreignKey: "storeId" });
    product_1.default.belongsTo(store_1.default, { foreignKey: "storeId" });
    category_1.default.hasMany(product_1.default, { foreignKey: "categoryId" });
    product_1.default.belongsTo(category_1.default, { foreignKey: "categoryId" });
    product_1.default.hasMany(price_record_1.default, { foreignKey: "productId" });
    price_record_1.default.belongsTo(product_1.default, { foreignKey: "productId" });
    store_1.default.hasMany(crawler_1.default, { foreignKey: "storeId" });
    crawler_1.default.belongsTo(store_1.default, { foreignKey: "storeId" });
}
exports.default = defineModelAssociations;
