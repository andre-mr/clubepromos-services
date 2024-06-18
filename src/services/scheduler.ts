import { getCrawlers, updateCrawler } from "../database/crawler-dao";
import { runCrawler } from "../controllers/crawler-controller";
import Crawler from "../models/crawler";

let runningCrawlers: Set<number> = new Set();

export const runScheduledCrawlers = async () => {
  const crawlers = await getCrawlers();
  console.log(`Running ${crawlers?.length} scheduled crawlers...`);

  for (const crawler of crawlers) {
    if (!isCrawlerRunning(crawler) && shouldRunCrawler(crawler)) {
      runningCrawlers.add(crawler.crawlerId);
      try {
        const crawlerResult = await runCrawler(crawler);
        if (crawlerResult) {
          updateCrawler({
            crawlerId: crawlerResult.crawlerId,
            updateValues: {
              lastExecution: crawlerResult.lastExecution,
              lastPrices: crawlerResult.lastPrices,
              lastProducts: crawlerResult.lastProducts,
            },
          });
          console.log(`Crawler ${crawler.crawlerId} finished`);
        } else {
          console.log(`Crawler ${crawler.crawlerId} didn't run`);
        }
      } catch (error) {
        console.error(`Error running crawler ${crawler.crawlerId}:`, error);
      } finally {
        runningCrawlers.delete(crawler.crawlerId);
      }
    }
  }

  console.log(`Scheduled crawlers routine finished`);
};

const shouldRunCrawler = (crawler: Crawler): boolean => {
  const currentTime = new Date();

  if (crawler.delayHours <= 0) {
    return false;
  } else if (crawler.delayHours >= 24) {
    const CRAWLER_DEFAULT_TIME = parseInt(process.env.CRAWLER_DEFAULT_TIME || "0", 10);

    const currentHour = currentTime.getHours();
    const allowedExecutionStart = CRAWLER_DEFAULT_TIME;
    const allowedExecutionEnd = (CRAWLER_DEFAULT_TIME + 2) % 24;

    if (allowedExecutionStart <= allowedExecutionEnd) {
      return currentHour >= allowedExecutionStart && currentHour <= allowedExecutionEnd;
    } else {
      return currentHour >= allowedExecutionStart || currentHour <= allowedExecutionEnd;
    }
  }
  if (!crawler.lastExecution) {
    return true;
  }

  const nextExecutionTime = new Date(crawler.lastExecution);
  nextExecutionTime.setHours(nextExecutionTime.getHours() + crawler.delayHours);
  return currentTime >= nextExecutionTime;
};

export const isCrawlerRunning = (crawler: Crawler): boolean => {
  const result = runningCrawlers.has(crawler.crawlerId);
  if (result) console.log(`Crawler ${crawler.crawlerId} is already running`);
  return result;
};
