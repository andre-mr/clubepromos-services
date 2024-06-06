"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const sequelize_1 = require("sequelize");
const sequelize_2 = __importDefault(require("../database/sequelize"));
class Crawler extends sequelize_1.Model {
}
Crawler.init({
    crawlerId: {
        type: sequelize_1.DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "crawler_id",
    },
    storeId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        field: "store_id",
        references: {
            model: "stores",
            key: "store_id",
        },
    },
    url: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
        field: "url",
    },
    delayHours: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 24,
        field: "delay_hours",
    },
    lastExecution: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
        field: "last_execution",
    },
}, {
    sequelize: sequelize_2.default,
    tableName: "crawlers",
    timestamps: false,
});
exports.default = Crawler;
