import { PriceHistory } from "../models/price-history";
import { ProductResponse } from "../models/product-response";

// environment variables
const MIN_DISCOUNT_RATE = parseFloat(process.env.MIN_DISCOUNT_RATE || "5");
const MIN_PRICE_CHANGE = parseFloat(process.env.MIN_PRICE_CHANGE || "10");
const OUTLIER_SENSITIVITY = parseFloat(process.env.OUTLIER_SENSITIVITY || "2"); // 2 standard deviations

// Define periods in milliseconds
const ONE_DAY = 24 * 60 * 60 * 1000;
const SHORT_PERIOD_DAYS = 7 * ONE_DAY;
const LONG_PERIOD_DAYS = 30 * ONE_DAY;

// Auxiliary function to calculate average price
const calculateAveragePrice = (prices: number[]): number => {
  const sum = prices.reduce((acc, price) => acc + price, 0);
  return prices.length > 0 ? sum / prices.length : 0;
};

// Function to filter historical prices within a specific period and calculate average
const filterAndAveragePrices = (priceHistory: PriceHistory[], period: number): number => {
  const cutoffDate = new Date(new Date().getTime() - period);
  const filteredPrices = priceHistory
    .filter((entry) => {
      return new Date(entry.timestamp) >= cutoffDate;
    })
    .map((entry) => {
      return entry.price;
    });
  return calculateAveragePrice(filteredPrices);
};

// Auxiliary function to remove outlier prices
const filterOutliers = (prices: number[]): number[] => {
  const mean = prices.reduce((acc, val) => acc + val, 0) / prices.length;
  const deviations = prices.map((price) => Math.pow(price - mean, 2));
  const stddev = Math.sqrt(deviations.reduce((acc, val) => acc + val, 0) / prices.length);

  const lowerBound = mean - OUTLIER_SENSITIVITY * stddev;
  const upperBound = mean + OUTLIER_SENSITIVITY * stddev;

  return prices.filter((price) => price >= lowerBound && price <= upperBound);
};

// Main function
export const analyzePrices = (products: ProductResponse[]): ProductResponse[] => {
  return products.filter((product) => {
    if (!product.priceHistory || (product.createdAt && product.createdAt > new Date(new Date().getTime() - ONE_DAY))) {
      return true; // New product returned for manual review
    }

    const currentPrice = product.priceHistory[0].price;
    const averagePriceShortPeriod = filterAndAveragePrices(product.priceHistory, SHORT_PERIOD_DAYS);
    const averagePriceLongPeriod = filterAndAveragePrices(product.priceHistory, LONG_PERIOD_DAYS);

    // Calculate discount based on average prices
    const discountRateShortPeriod = ((averagePriceShortPeriod - currentPrice) / averagePriceShortPeriod) * 100;
    const discountRateLongPeriod = ((averagePriceLongPeriod - currentPrice) / averagePriceLongPeriod) * 100;

    if (
      (discountRateShortPeriod >= MIN_DISCOUNT_RATE || discountRateLongPeriod >= MIN_DISCOUNT_RATE) &&
      (Math.abs(averagePriceShortPeriod - currentPrice) >= MIN_PRICE_CHANGE ||
        Math.abs(averagePriceLongPeriod - currentPrice) >= MIN_PRICE_CHANGE)
    ) {
      product.discountRate = parseFloat(Math.max(discountRateShortPeriod, discountRateLongPeriod).toFixed(2)); // Use the highest discount rate
      return true;
    }

    return false; // Older product discarded
  });
};
