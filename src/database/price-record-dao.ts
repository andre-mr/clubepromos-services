import { Op } from "sequelize";
import defineModelAssociations from "./associations";
import Store from "../models/store";
import Product from "../models/product";
import Category from "../models/category";
import PriceRecord, { PriceRecordAttributes } from "../models/price-record";

defineModelAssociations();

export const getLatestPriceRecord = async (storeName: string, productId: number) => {
  const store = await Store.findOne({ where: { storeName: storeName } });
  if (!store) {
    console.error("Store not found");
    return null;
  }

  const latestRecord = await PriceRecord.findOne({
    include: [
      {
        model: Product,
        required: true,
        include: [
          {
            model: Category,
            required: true,
          },
        ],
        where: { storeId: store.storeId, productId: productId },
      },
    ],
    order: [["priceTimestamp", "DESC"]],
  });

  if (!latestRecord) {
    console.error("No price record found for the specified product and store");
    return null;
  }

  return {
    productId: latestRecord.getDataValue("productId"),
    priceTimestamp: latestRecord.getDataValue("priceTimestamp"),
    price: latestRecord.getDataValue("price"),
    productName: (latestRecord.get("Product") as Product).productName,
    categoryName: (latestRecord.get("Product") as Product).category?.categoryName,
    storeName: store.getDataValue("storeName"),
  };
};

export const createPriceRecord = async ({ productId, price, priceTimestamp = new Date() }: PriceRecordAttributes) => {
  try {
    const newRecord = await PriceRecord.create({
      productId,
      price,
      priceTimestamp,
    });
    return newRecord;
  } catch (error) {
    console.error(`Error adding price record: ${error}`);
    return null;
  }
};
