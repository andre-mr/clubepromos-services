import Category from "../models/category";

export const findCategoryByName = async (categoryName: string) => {
  return await Category.findOne({ where: { categoryName } });
};

export const createCategory = async ({ categoryName }: { categoryName: string }) => {
  try {
    const [category, wasCreated] = await Category.findOrCreate({
      where: { categoryName },
      defaults: { categoryName },
    });

    return category;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error adding category: ${error.message}`);
    }
    return null;
  }
};

export const updateCategory = async (categoryId: number, updateValues: { categoryName?: string }) => {
  try {
    const [updatedRows] = await Category.update(updateValues, {
      where: { categoryId },
    });
    if (updatedRows === 0) {
      console.error("Category not found or identical data provided");
    }
    return updatedRows;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error updating category: ${error.message}`);
    }
  }
};

export const deleteCategory = async (categoryId: number) => {
  try {
    const deletedRows = await Category.destroy({
      where: { categoryId },
    });
    if (deletedRows === 0) {
      console.error("Category not found");
    }
    return deletedRows;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error deleting category: ${error.message}`);
    }
  }
};

export const listCategories = async () => {
  return await Category.findAll();
};
