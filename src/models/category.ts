import { DataTypes, Model } from "sequelize";
import sequelize from "../database/sequelize";

interface CategoryAttributes {
  categoryId?: number;

  categoryName: string;
}

class Category extends Model<CategoryAttributes> implements CategoryAttributes {
  public categoryId?: number;

  public categoryName!: string;
}

Category.init(
  {
    categoryId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "category_id",
    },
    categoryName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: "category_name",
    },
  },
  {
    sequelize,
    tableName: "categories",
    timestamps: false,
  }
);

export default Category;
