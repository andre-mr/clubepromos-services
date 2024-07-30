import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
dotenv.config();

import crawlersRoute from "./routes/crawlers-route";
import productsRoute from "./routes/products-route";
import storesRoute from "./routes/stores-route";
import { authMiddleware } from "./middlewares/auth-middleware";
import cron from "node-cron";
import { runScheduledCrawlers } from "./services/scheduler";
import scrapersRoute from "./routes/scrapers-route";

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(express.json());
app.use(authMiddleware);

app.use("/crawlers", crawlersRoute);
app.use("/products", productsRoute);
app.use("/stores", storesRoute);
app.use("/scrapers", scrapersRoute);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// trying to run crawlers at startup
runScheduledCrawlers();

// Schedule the crawlers to run at the start of every hour
cron.schedule(`0 * * * *`, () => {
  runScheduledCrawlers();
});

// Signal processing to finish the application correctly
const gracefulShutdown = () => {
  console.log("Received kill signal, shutting down gracefully...");
  server.close(() => {
    console.log("Closed out remaining connections.");
    process.exit(0);
  });

  setTimeout(() => {
    console.error("Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", gracefulShutdown);
process.on("SIGINT", gracefulShutdown);
