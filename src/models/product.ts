import { DataTypes, Model } from "sequelize";
import sequelize from "../database/sequelize";
import Category from "./category";

interface ProductAttributes {
  productId?: number;

  categoryId: number;
  productBrand: string;
  productImage: string;
  productName: string;
  productSku: string;
  productUrl: string;
  storeId: number;
}

interface ProductInstance extends ProductAttributes {
  category?: Category;
}

class Product extends Model<ProductInstance> implements ProductInstance {
  public productId?: number;

  public categoryId!: number;
  public productBrand!: string;
  public productImage!: string;
  public productUrl!: string;
  public productName!: string;
  public productSku!: string;
  public storeId!: number;

  public category?: Category;
}

Product.init(
  {
    productId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "product_id",
    },
    categoryId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "category_id",
    },
    productBrand: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: "product_brand",
    },
    productImage: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "product_image",
    },
    productName: {
      type: DataTypes.TEXT,
      allowNull: false,
      field: "product_name",
    },
    productSku: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: "product_sku",
    },
    productUrl: {
      type: DataTypes.TEXT,
      allowNull: true,
      field: "product_url",
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "store_id",
    },
  },
  {
    sequelize,
    tableName: "products",
    timestamps: false,
  }
);

export default Product;
export { ProductAttributes };
