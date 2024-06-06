"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../database/sequelize"));
class Store extends sequelize_1.Model {
}
Store.init({
    storeId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "store_id",
    },
    storeName: {
        type: sequelize_1.DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        field: "store_name",
    },
}, {
    sequelize: sequelize_2.default,
    tableName: "stores",
    timestamps: false,
});
exports.default = Store;
