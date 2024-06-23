import Store from "../models/store";

export const getStoreByID = async (storeId: number) => {
  return await Store.findOne({ where: { storeId } });
};

export const getStoreByName = async (storeName: string) => {
  return await Store.findOne({ where: { storeName } });
};

export const getStores = async () => {
  return await Store.findAll();
};
