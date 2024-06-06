import Category from "../models/category";
import Crawler from "../models/crawler";
import PriceRecord from "../models/price-record";
import Product from "../models/product";
import Store from "../models/store";

function defineModelAssociations() {
  Store.hasMany(Product, { foreignKey: "storeId" });
  Product.belongsTo(Store, { foreignKey: "storeId" });

  Category.hasMany(Product, { foreignKey: "categoryId" });
  Product.belongsTo(Category, { foreignKey: "categoryId" });

  Product.hasMany(PriceRecord, { foreignKey: "productId" });
  PriceRecord.belongsTo(Product, { foreignKey: "productId" });

  Store.hasMany(Crawler, { foreignKey: "storeId" });
  Crawler.belongsTo(Store, { foreignKey: "storeId" });
}

export default defineModelAssociations;
