import { Request, Response } from "express";
import temuScraper from "../services/temu-scraper";
import centauroScraper from "../services/centauro-scraper";
import { fetchHtml } from "../services/fetch-custom";
import { ProxyHeaders } from "../models/proxy-headers";

export const handleScrapStore = async (req: Request, res: Response) => {
  const { storename: storeName } = req.params;
  const { url, headers } = req.body;

  if (!url || !storeName) {
    return res.status(400).json({ message: "Invalid or missing url or store name" });
  }

  const scrapedPage = await runScraper(storeName, url, headers);

  res.status(200).send(scrapedPage);
};

export const runScraper = async (storeName: string, url: string, headers?: ProxyHeaders) => {
  switch (storeName) {
    case "proxy":
      console.log("proxyFetch:", url);
      const PROXY_ENDPOINT = process.env.PROXY_ENDPOINT;
      const proxyResponse = await fetchHtml({ url, proxyEndpoint: PROXY_ENDPOINT, headers });
      if (proxyResponse.ok) {
        return await proxyResponse.text();
      }
      return "";

    case "temu":
      console.log("temuScraper");
      const temuPage = await temuScraper(url);
      return temuPage;

    case "centauro":
      console.log("centauroScraper");
      const centauroPage = await centauroScraper(url);
      return centauroPage;

    default:
      return "";
  }
};
