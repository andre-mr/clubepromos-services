"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listCategories = exports.deleteCategory = exports.updateCategory = exports.createCategory = exports.findCategoryByName = void 0;
const category_1 = __importDefault(require("../models/category"));
const findCategoryByName = async (categoryName) => {
    return await category_1.default.findOne({ where: { categoryName } });
};
exports.findCategoryByName = findCategoryByName;
const createCategory = async ({ categoryName }) => {
    try {
        const [category, created] = await category_1.default.findOrCreate({
            where: { categoryName },
            defaults: { categoryName },
        });
        if (!created) {
            console.error("Category with this name already exists");
        }
        return category;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error adding category: ${error.message}`);
        }
        return null;
    }
};
exports.createCategory = createCategory;
const updateCategory = async (categoryId, updateValues) => {
    try {
        const [updatedRows] = await category_1.default.update(updateValues, {
            where: { categoryId },
        });
        if (updatedRows === 0) {
            console.error("Category not found or identical data provided");
        }
        return updatedRows;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error updating category: ${error.message}`);
        }
    }
};
exports.updateCategory = updateCategory;
const deleteCategory = async (categoryId) => {
    try {
        const deletedRows = await category_1.default.destroy({
            where: { categoryId },
        });
        if (deletedRows === 0) {
            console.error("Category not found");
        }
        return deletedRows;
    }
    catch (error) {
        if (error instanceof Error) {
            console.error(`Error deleting category: ${error.message}`);
        }
    }
};
exports.deleteCategory = deleteCategory;
const listCategories = async () => {
    return await category_1.default.findAll();
};
exports.listCategories = listCategories;
