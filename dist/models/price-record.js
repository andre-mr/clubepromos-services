"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../database/sequelize"));
class PriceRecord extends sequelize_1.Model {
}
PriceRecord.init({
    priceId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "price_id",
    },
    productId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "product_id",
        references: {
            model: "products",
            key: "product_id",
        },
    },
    priceTimestamp: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
        field: "price_timestamp",
    },
    price: {
        type: sequelize_1.DataTypes.DECIMAL(10, 2),
        allowNull: false,
        field: "price",
    },
}, {
    sequelize: sequelize_2.default,
    tableName: "price_records",
    timestamps: false,
    indexes: [
        {
            name: "idx_product_timestamp",
            fields: ["product_id", "price_timestamp"],
        },
    ],
});
exports.default = PriceRecord;
