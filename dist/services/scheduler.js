"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isCrawlerRunning = exports.runScheduledCrawlers = void 0;
const crawler_dao_1 = require("../database/crawler-dao");
const crawler_controller_1 = require("../controllers/crawler-controller");
let runningCrawlers = new Set();
const runScheduledCrawlers = async () => {
    const crawlers = await (0, crawler_dao_1.getCrawlers)();
    console.log(`Running ${crawlers === null || crawlers === void 0 ? void 0 : crawlers.length} scheduled crawlers...`);
    for (const crawler of crawlers) {
        if (!(0, exports.isCrawlerRunning)(crawler) && shouldRunCrawler(crawler)) {
            runningCrawlers.add(crawler.crawlerId);
            try {
                const crawlerResult = await (0, crawler_controller_1.runCrawler)(crawler);
                if (crawlerResult) {
                    console.log(`Crawler ${crawler.crawlerId} finished`);
                }
                else {
                    console.log(`Crawler ${crawler.crawlerId} didn't run`);
                }
            }
            catch (error) {
                console.error(`Error running crawler ${crawler.crawlerId}:`, error);
            }
            finally {
                runningCrawlers.delete(crawler.crawlerId);
            }
        }
    }
};
exports.runScheduledCrawlers = runScheduledCrawlers;
const shouldRunCrawler = (crawler) => {
    const currentTime = new Date();
    if (crawler.delayHours === 24) {
        const CRAWLER_DEFAULT_TIME = parseInt(process.env.CRAWLER_DEFAULT_TIME || "0", 10);
        const currentHour = currentTime.getHours();
        const allowedExecutionStart = CRAWLER_DEFAULT_TIME;
        const allowedExecutionEnd = (CRAWLER_DEFAULT_TIME + 2) % 24;
        if (allowedExecutionStart <= allowedExecutionEnd) {
            return currentHour >= allowedExecutionStart && currentHour <= allowedExecutionEnd;
        }
        else {
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
const isCrawlerRunning = (crawler) => {
    const result = runningCrawlers.has(crawler.crawlerId);
    if (result)
        console.log(`Crawler ${crawler.crawlerId} is already running`);
    return result;
};
exports.isCrawlerRunning = isCrawlerRunning;
