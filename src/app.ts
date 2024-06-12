import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import crawlersRoute from "./routes/crawlers-route";
import productsRoute from "./routes/products-route";
import priceHistoryRoute from "./routes/price-history-route";
import { authMiddleware } from "./middlewares/auth-middleware";
import cron from "node-cron";
import { runScheduledCrawlers } from "./services/scheduler";

dotenv.config();

const app = express();
const PORT = process.env.API_PORT || 3000;

app.use(express.json());
app.use(authMiddleware);

app.use("/crawlers", crawlersRoute);
app.use("/products", productsRoute);
app.use("/pricehistory", priceHistoryRoute);

app.use((req: Request, res: Response, next: NextFunction) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

runScheduledCrawlers();
// Schedule the crawlers to run at the start of every hour
cron.schedule(`0 * * * *`, () => {
  runScheduledCrawlers();
});
