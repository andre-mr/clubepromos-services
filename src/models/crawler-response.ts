export interface CrawlerResponse {
  crawlerId: number;
  storeName: string | null;
  url: string | null;
  delayHours: number;
  lastExecution: Date | null;
}
