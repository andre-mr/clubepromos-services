import CrawlerProduct from "../models/crawler-product";

export const createCrawlerProduct = async ({ crawlerId, productId }: { crawlerId: number; productId: number }) => {
  try {
    const [crawlerProduct, wasCreated] = await CrawlerProduct.findOrCreate({
      where: { crawlerId, productId },
    });

    return crawlerProduct;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error adding Crawler Product: ${error.message}`);
    }
    return null;
  }
};
