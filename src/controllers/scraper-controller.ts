import { Request, Response } from "express";
import temuScraper from "../services/temu-scraper";

export const handleScrapStore = async (req: Request, res: Response) => {
  const { storename: storeName } = req.params;
  const { url } = req.body;

  if (!url || !storeName) {
    return res.status(400).json({ message: "Invalid or missing url or store name" });
  }

  const scrapedPage = await runScraper(storeName, url);

  res.status(200).send(scrapedPage);
};

export const runScraper = async (storeName: string, url: string) => {
  switch (storeName) {
    case "temu":
      console.log("temuScraper");
      const temuPage = await temuScraper(url);
      return temuPage;
    default:
      return "";
  }
};
