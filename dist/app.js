"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const crawlers_route_1 = __importDefault(require("./routes/crawlers-route"));
const products_route_1 = __importDefault(require("./routes/products-route"));
const price_history_route_1 = __importDefault(require("./routes/price-history-route"));
const auth_middleware_1 = require("./middlewares/auth-middleware");
const node_cron_1 = __importDefault(require("node-cron"));
const scheduler_1 = require("./services/scheduler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.API_PORT || 3000;
app.use(express_1.default.json());
app.use(auth_middleware_1.authMiddleware);
app.use("/crawlers", crawlers_route_1.default);
app.use("/products", products_route_1.default);
app.use("/pricehistory", price_history_route_1.default);
app.use((req, res, next) => {
    res.status(404).json({ message: "Route not found" });
});
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: "Internal Server Error" });
});
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
// Schedule the crawlers to run at the specified time
// cron.schedule(`0 * * * *`, () => {
// runScheduledCrawlers();
node_cron_1.default.schedule(`0 * * * *`, () => {
    (0, scheduler_1.runScheduledCrawlers)();
});
