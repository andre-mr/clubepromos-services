import { DataTypes, Model } from "sequelize";
import sequelize from "../database/sequelize";

class CrawlerProduct extends Model {
  public crawlerId!: number;
  public productId!: number;
}

CrawlerProduct.init(
  {
    crawlerId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "crawlers",
        key: "crawler_id",
      },
    },
    productId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      references: {
        model: "products",
        key: "product_id",
      },
    },
  },
  {
    sequelize,
    tableName: "crawler_product",
    timestamps: false,
  }
);

export default CrawlerProduct;
