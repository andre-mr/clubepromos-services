import { getCrawlers, updateCrawler } from "../database/crawler-dao";
import { runCrawler } from "../controllers/crawler-controller";
import Crawler from "../models/crawler";

let runningCrawlers: Set<number> = new Set();

export const runScheduledCrawlers = async () => {
  const crawlers = await getCrawlers();
  const runnableCrawlers = crawlers.filter((crawler) => !isCrawlerRunning(crawler) && shouldRunCrawler(crawler));
  if (runnableCrawlers.length > 0) {
    console.log(`Running ${runnableCrawlers.length} of ${crawlers.length} crawlers...`);
  } else {
    console.log(`No crawler scheduled to run at this time from ${crawlers.length} crawlers...`);
  }

  for (const crawler of runnableCrawlers) {
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
            lastStatus: true,
          },
        });
      } else {
        updateCrawler({
          crawlerId: crawler.crawlerId,
          updateValues: {
            lastExecution: new Date(),
            lastPrices: 0,
            lastProducts: 0,
            lastStatus: false,
          },
        });
        console.log(`Crawler ${crawler.crawlerId} didn't run`);
      }
    } catch (error) {
      console.error(`Error running crawler ${crawler.crawlerId}:`, error);
    } finally {
      runningCrawlers.delete(crawler.crawlerId);
    }
  }

  console.log(`Scheduled crawlers routine finished at ${new Date().toLocaleString("pt-BR")}`);
};

const shouldRunCrawler = (crawler: Crawler): boolean => {
  const currentTime = new Date();

  if (crawler.delayHours <= 0) {
    return false;
  } else if (crawler.delayHours >= 24) {
    const CRAWLER_DEFAULT_TIME = parseInt(process.env.CRAWLER_DEFAULT_TIME || "0", 10);

    const currentHour = currentTime.getHours();
    const defaultExecutionStartHour = CRAWLER_DEFAULT_TIME;

    // Calculate the number of days for the delay
    const delayDays = Math.ceil(crawler.delayHours / 24);

    let lastExecution = crawler.lastExecution ? new Date(crawler.lastExecution) : null;
    if (!lastExecution) {
      // If lastExecution is null, allow the crawler to run the first time
      lastExecution = new Date();
      lastExecution.setDate(lastExecution.getDate() - delayDays);
      lastExecution.setHours(defaultExecutionStartHour, 0, 0, 0);
    }

    // Calculate the next valid execution date
    const nextExecutionDate = new Date(lastExecution);
    nextExecutionDate.setDate(lastExecution.getDate() + delayDays);
    nextExecutionDate.setHours(defaultExecutionStartHour, 0, 0, 0); // Set to CRAWLER_DEFAULT_TIME with zero minutes and seconds

    // Check if current time is within the valid execution window of one hour after CRAWLER_DEFAULT_TIME
    if (
      currentHour === defaultExecutionStartHour &&
      currentTime >= nextExecutionDate &&
      currentTime < new Date(nextExecutionDate.getTime() + 60 * 60 * 1000) // within one hour window
    ) {
      return true;
    }

    return false;
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
