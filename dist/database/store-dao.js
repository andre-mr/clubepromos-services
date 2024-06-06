"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listStores = exports.findStoreByName = exports.findStoreByID = void 0;
const store_1 = __importDefault(require("../models/store"));
const findStoreByID = async (storeId) => {
    return await store_1.default.findOne({ where: { storeId } });
};
exports.findStoreByID = findStoreByID;
const findStoreByName = async (storeName) => {
    return await store_1.default.findOne({ where: { storeName } });
};
exports.findStoreByName = findStoreByName;
const listStores = async () => {
    return await store_1.default.findAll();
};
exports.listStores = listStores;
