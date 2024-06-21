import Crawler from "../models/crawler";
import { CrawlerResponse } from "../models/crawler-response";
import Store from "../models/store";
import { literal } from "sequelize";

const transformCrawlerToResponse = (crawler: Crawler): CrawlerResponse => {
  return {
    crawlerId: crawler.crawlerId,
    storeName: (crawler as any).Store ? (crawler as any).Store.storeName : null,
    url: crawler.url,
    description: crawler.description,
    delayHours: crawler.delayHours,
    lastExecution: crawler.lastExecution,
    lastPrices: crawler.lastPrices,
    lastProducts: crawler.lastProducts,
    lastStatus: crawler.lastStatus,
    productCount: crawler.get("productCount") as number,
  };
};

export const getCrawlers = async (storeId?: number) => {
  const whereClause: { storeId?: number } = {};
  if (storeId !== undefined) {
    whereClause.storeId = storeId;
  }
  return await Crawler.findAll({ where: whereClause });
};

export const getCrawlersWithStoreName = async (storeId?: number) => {
  const whereClause: { storeId?: number } = {};
  if (storeId !== undefined) {
    whereClause.storeId = storeId;
  }

  const crawlers = await Crawler.findAll({
    where: whereClause,
    include: [
      {
        model: Store,
        attributes: ["storeName"],
      },
    ],
    attributes: {
      include: [
        // Subquery to get the count of products associated with each crawler
        [
          literal(`(
          SELECT COUNT(*)
          FROM crawler_product
          WHERE crawler_product.crawler_id = Crawler.crawler_id
        )`),
          "productCount",
        ],
      ],
    },
  });

  return crawlers.map(transformCrawlerToResponse);
};

export const getCrawlerById = async (crawlerId: number) => {
  return await Crawler.findOne({ where: { crawlerId } });
};

export const getCrawlerByIdWithStoreName = async (crawlerId: number) => {
  const crawler = await Crawler.findOne({
    where: { crawlerId },
    include: {
      model: Store,
      attributes: ["storeName"],
    },
  });

  if (!crawler) {
    return null;
  }

  return transformCrawlerToResponse(crawler);
};

export const createCrawler = async ({
  storeId,
  url,
  description,
  delayHours,
  lastExecution,
  lastPrices,
  lastProducts,
  lastStatus,
}: Crawler) => {
  try {
    const [crawler, created] = await Crawler.findOrCreate({
      where: { url },
      defaults: {
        storeId,
        url,
        description,
        delayHours,
        lastExecution,
        lastPrices,
        lastProducts,
        lastStatus,
      },
    });

    if (!created) {
      console.error("Cannot create crawler, try again");
      return null;
    }

    return crawler;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error adding crawler: ${error.message}`);
    }
    return null;
  }
};

interface UpdateCrawlerValues {
  crawlerId: number;
  updateValues: {
    delayHours?: number;
    description?: string;
    lastExecution?: Date;
    lastPrices?: number;
    lastProducts?: number;
    lastStatus?: boolean;
  };
}

export const updateCrawler = async ({ crawlerId, updateValues }: UpdateCrawlerValues) => {
  try {
    const [updatedRows] = await Crawler.update(updateValues, {
      where: { crawlerId },
    });
    if (updatedRows === 0) {
      console.error("Crawler not found or identical data provided");
    }
    return updatedRows;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error updating crawler: ${error.message}`);
    }
  }
};

export const deleteCrawler = async (crawlerId: number) => {
  try {
    const deletedRows = await Crawler.destroy({
      where: { crawlerId },
    });
    if (deletedRows === 0) {
      console.error("Crawler not found");
    }
    return deletedRows;
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Error deleting crawler: ${error.message}`);
    }
  }
};
