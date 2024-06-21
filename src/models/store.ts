import { DataTypes, Model } from "sequelize";
import sequelize from "../database/sequelize";

interface StoreAttributes {
  storeId?: number;

  storeName: string;
  proxyUse: boolean;
}

class Store extends Model<StoreAttributes> implements StoreAttributes {
  public storeId?: number;

  public storeName!: string;
  proxyUse!: boolean;
}

Store.init(
  {
    storeId: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      field: "store_id",
    },
    storeName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      field: "store_name",
    },
    proxyUse: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      field: "proxy_use",
    },
  },
  {
    sequelize,
    tableName: "stores",
    timestamps: false,
  }
);

export default Store;
