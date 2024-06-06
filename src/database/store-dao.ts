import Store from "../models/store";

export const findStoreByID = async (storeId: number) => {
  return await Store.findOne({ where: { storeId } });
};

export const findStoreByName = async (storeName: string) => {
  return await Store.findOne({ where: { storeName } });
};

export const listStores = async () => {
  return await Store.findAll();
};
