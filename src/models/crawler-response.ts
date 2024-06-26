export interface CrawlerResponse {
  crawlerId: number;
  storeName: string | null;
  createdAt: Date | null;
  description: string | null;
  delayHours: number;
  lastExecution: Date | null;
  lastPrices: number | null;
  lastProducts: number | null;
  lastStatus: boolean | null;
  productCount: number | null;
  url: string | null;
}
