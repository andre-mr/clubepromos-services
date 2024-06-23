import { DataTypes, Model } from "sequelize";
import sequelize from "../database/sequelize";

export interface CrawlerAttributes {
  crawlerId?: number;

  storeId: number;
  url: string;
  description: string;
  delayHours: number;
  lastExecution: Date | null;
  lastPrices: number | null;
  lastProducts: number | null;
  lastStatus: boolean | null;
}

class Crawler extends Model<CrawlerAttributes> implements CrawlerAttributes {
  public crawlerId!: number;

  public storeId!: number;
  public url!: string;
  public description!: string;
  public delayHours!: number;
  public lastExecution!: Date | null;
  public lastPrices!: number | null;
  public lastProducts!: number | null;
  public lastStatus!: boolean | null;
}

Crawler.init(
  {
    crawlerId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "crawler_id",
    },
    storeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "store_id",
      references: {
        model: "stores",
        key: "store_id",
      },
    },
    url: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "url",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      field: "description",
    },
    delayHours: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 24,
      field: "delay_hours",
    },
    lastExecution: {
      type: DataTypes.DATE,
      allowNull: true,
      field: "last_execution",
    },
    lastPrices: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "last_prices",
    },
    lastProducts: {
      type: DataTypes.INTEGER,
      allowNull: true,
      field: "last_products",
    },
    lastStatus: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      field: "last_status",
    },
  },
  {
    sequelize,
    tableName: "crawlers",
    timestamps: false,
  }
);

export default Crawler;
