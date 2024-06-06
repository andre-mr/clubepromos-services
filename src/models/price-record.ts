import { DataTypes, Model } from "sequelize";
import sequelize from "../database/sequelize";

export interface PriceRecordAttributes {
  priceId?: number;

  productId: number;
  priceTimestamp: Date;
  price: number;
}

class PriceRecord extends Model<PriceRecordAttributes> implements PriceRecordAttributes {
  public priceId!: number;

  public productId!: number;
  public priceTimestamp!: Date;
  public price!: number;
}

PriceRecord.init(
  {
    priceId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "price_id",
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: "product_id",
      references: {
        model: "products",
        key: "product_id",
      },
    },
    priceTimestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      field: "price_timestamp",
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: "price",
    },
  },
  {
    sequelize,
    tableName: "price_records",
    timestamps: false,
    indexes: [
      {
        name: "idx_product_timestamp",
        fields: ["product_id", "price_timestamp"],
      },
    ],
  }
);

export default PriceRecord;
