import amazonCrawler from "../services/amazon-crawler";
import naturaCrawler from "../services/natura-crawler";
import { Request, Response } from "express";
import { createProduct, getProductBySKUAndStore } from "../database/product-dao";
import { createPriceRecord, getLatestPriceRecord } from "../database/price-record-dao";
import { findCategoryByName, createCategory } from "../database/category-dao";
import CrawledProduct from "../models/crawled-product";
import Category from "../models/category";
import Product from "../models/product";
import { getStoreByID, getStoreByName } from "../database/store-dao";
import { capitalizeTitle } from "../utils/capitalize";
import {
  getCrawlerById,
  getCrawlersWithStoreName,
  deleteCrawler,
  updateCrawler,
  createCrawler,
  getCrawlerByIdWithStoreName,
} from "../database/crawler-dao";
import Crawler from "../models/crawler";
import Store from "../models/store";
import { isCrawlerRunning } from "../services/scheduler";
import { createCrawlerProduct } from "../database/crawler-product-dao";

// import fs from "fs";

export const handleRunCrawler = async (req: Request, res: Response) => {
  const { id } = req.params;
  if (!id || isNaN(Number(id))) {
    return res.status(400).json({ message: "Invalid or missing crawler Id" });
  }

  const crawlerDetected = await getCrawlerById(Number.parseInt(id));
  if (!crawlerDetected) {
    return res.status(404).json({ message: "Crawler not found" });
  }

  const storeDetected = await getStoreByID(crawlerDetected.storeId);
  if (!storeDetected) {
    return res.status(404).json({ message: "Store not found for the given crawler" });
  }

  const isCrawlerAlreadyRunning = isCrawlerRunning(crawlerDetected);
  if (isCrawlerAlreadyRunning) {
    return res.status(400).json({ message: "Crawler is not ready to run" });
  }
  runCrawler(crawlerDetected, storeDetected).then((response) => {
    if (response) {
      updateCrawler({
        crawlerId: crawlerDetected.crawlerId,
        updateValues: {
          lastExecution: new Date(),
          lastPrices: crawlerDetected.lastPrices,
          lastProducts: crawlerDetected.lastProducts,
        },
      });
    }
  });

  return res
    .status(200)
    .json({ message: `Crawler ${crawlerDetected.crawlerId} for store ${storeDetected.storeName} started` });
};

export const runCrawler = async (crawlerDetected: Crawler, storeDetected?: Store) => {
  try {
    if (!storeDetected) {
      const foundStore = await getStoreByID(crawlerDetected.storeId);
      if (!foundStore) {
        return false;
      }
      storeDetected = foundStore;
    }
    let crawledProducts: CrawledProduct[];
    let recordsCreated = 0;
    const PROXY_ENDPOINT = process.env.PROXY_ENDPOINT;

    switch (storeDetected.storeName) {
      case "Natura":
        console.log(`Starting crawler [Natura][${crawlerDetected.description}]...`);
        crawledProducts = await naturaCrawler(storeDetected.proxyUse ? PROXY_ENDPOINT : undefined);
        break;
      case "Amazon":
        console.log(`Starting crawler [Amazon][${crawlerDetected.description}]...`);
        crawledProducts = await amazonCrawler(crawlerDetected, storeDetected.proxyUse ? PROXY_ENDPOINT : undefined);
        break;
      default:
        console.error("Store not supported");
        return false;
    }

    const nowDate = new Date();
    let newProducts = 0;
    const newlyCreatedSKUs = new Set<string>();

    for (const product of crawledProducts) {
      const existingProduct = await getProductBySKUAndStore(product.Sku, storeDetected.storeId!);
      if (existingProduct && !newlyCreatedSKUs.has(product.Sku)) {
        const latestRecord = await getLatestPriceRecord(storeDetected.storeName, existingProduct.productId!);
        if (!latestRecord || latestRecord.price != product.Price) {
          await createPriceRecord({
            productId: existingProduct.productId!,
            price: product.Price,
            priceTimestamp: nowDate,
          });
          recordsCreated++;
        }
      } else {
        const newProduct = new Product();
        let category: Category | null = await findCategoryByName(product.CategoryName);
        if (!category) {
          category = await createCategory({ categoryName: capitalizeTitle(product.CategoryName) });
        }
        newProduct.categoryId = category?.categoryId || 1;
        newProduct.productBrand = product.Brand;
        newProduct.productImage = product.ImageUrl;
        newProduct.productName = product.Name;
        newProduct.productSku = product.Sku;
        newProduct.productUrl = product.Url;
        newProduct.storeId = storeDetected.storeId!;

        const newProductCreated = await createProduct(newProduct);
        if (newProductCreated && newProductCreated.productId) {
          newlyCreatedSKUs.add(product.Sku);
          newProducts++;

          await createCrawlerProduct({
            crawlerId: crawlerDetected.crawlerId,
            productId: newProductCreated.productId,
          });

          await createPriceRecord({
            productId: newProductCreated.productId,
            price: product.Price,
            priceTimestamp: nowDate,
          }).then((createdPriceRecord) => {
            if (createdPriceRecord) recordsCreated++;
          });
        } else {
          console.error("Error creating product");
          continue;
        }
      }
    }

    console.log(`Crawler [${storeDetected.storeName}][${crawlerDetected.description}] finished successfully!`);
    console.log(`${recordsCreated} price records created!`);
    console.log(`${newProducts} new products created!`);

    crawlerDetected.lastExecution = new Date();
    crawlerDetected.lastProducts = newProducts;
    crawlerDetected.lastPrices = recordsCreated;

    return crawlerDetected;
  } catch (error: unknown) {
    console.log("Error running crawler!");
    return false;
  }
};

export const handleGetCrawlers = async (req: Request, res: Response) => {
  const storeIdParam = req.query.storeId as string;

  const storeId =
    storeIdParam && !isNaN(parseInt(storeIdParam, 10)) && parseInt(storeIdParam, 10).toString() === storeIdParam
      ? parseInt(storeIdParam, 10)
      : undefined;

  try {
    const crawlersResponse = await getCrawlersWithStoreName(storeId);
    if (!crawlersResponse) {
      return res.status(404).json({ message: "Crawler not found" });
    }
    res.status(200).json(crawlersResponse);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const handleGetCrawlerById = async (req: Request, res: Response) => {
  const crawlerIdParam = req.params.id as string;

  const crawlerId =
    crawlerIdParam && !isNaN(parseInt(crawlerIdParam, 10)) && parseInt(crawlerIdParam, 10).toString() === crawlerIdParam
      ? parseInt(crawlerIdParam, 10)
      : null;

  if (!crawlerId) {
    return res.status(400).json({ message: "Invalid or missing crawler Id" });
  }

  try {
    const crawlerResponse = await getCrawlerByIdWithStoreName(crawlerId);
    if (!crawlerResponse) {
      return res.status(404).json({ message: "Crawler not found" });
    }
    res.status(200).json(crawlerResponse);
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const handleUpdateCrawler = async (req: Request, res: Response) => {
  const crawlerIdParam = req.params.id as string;

  const crawlerId =
    crawlerIdParam && !isNaN(parseInt(crawlerIdParam, 10)) && parseInt(crawlerIdParam, 10).toString() === crawlerIdParam
      ? parseInt(crawlerIdParam, 10)
      : null;

  if (!crawlerId) {
    return res.status(400).json({ message: "Invalid or missing crawler Id" });
  }

  const updateValues = req.body?.updateValues;

  try {
    const updatedRows = await updateCrawler({ crawlerId, updateValues });
    if (updatedRows === 0) {
      return res.status(404).json({ message: "Crawler not found or no changes made" });
    }
    res.status(200).json({ message: "Crawler updated successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const handleDeleteCrawler = async (req: Request, res: Response) => {
  const crawlerIdParam = req.params.id as string;

  const crawlerId =
    crawlerIdParam && !isNaN(parseInt(crawlerIdParam, 10)) && parseInt(crawlerIdParam, 10).toString() === crawlerIdParam
      ? parseInt(crawlerIdParam, 10)
      : null;

  if (!crawlerId) {
    return res.status(400).json({ message: "Invalid or missing crawler Id" });
  }

  try {
    const deletedRows = await deleteCrawler(crawlerId);
    if (deletedRows === 0) {
      return res.status(404).json({ message: "Crawler not found" });
    }
    res.status(200).json({ message: "Crawler deleted successfully" });
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};

export const handleCreateCrawler = async (req: Request, res: Response) => {
  try {
    if (req.body.StoreName) {
      const foundStore = await getStoreByName(req.body.StoreName);
      if (foundStore) {
        const crawlerData = {
          storeId: foundStore.storeId,
          url: req.body.Url,
          description: req.body.Description,
          delayHours: req.body.DelayHours,
          lastExecution: null,
          lastPrices: null,
          lastProducts: null,
          lastStatus: null,
        };
        const crawler = await createCrawler(crawlerData as Crawler);
        if (!crawler) {
          return res.status(409).json({ message: "Crawler with this id already exists" });
        }
        res.status(201).json({ message: "Crawler created successfully", crawler });
      }
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
};
