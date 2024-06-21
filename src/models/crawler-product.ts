import { DataTypes, Model } from "sequelize";
import sequelize from "../database/sequelize";

interface CrawlerProductAttributes {
  crawlerId?: number;
  productId?: number;
}

class CrawlerProduct extends Model<CrawlerProductAttributes> implements CrawlerProductAttributes {
  public crawlerId?: number;

  public productId?: number;
}

CrawlerProduct.init(
  {
    crawlerId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: "crawler_id",
    },
    productId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      field: "product_id",
    },
  },
  {
    sequelize,
    tableName: "crawler_product",
    timestamps: false,
  }
);

export default CrawlerProduct;
export { CrawlerProductAttributes };
