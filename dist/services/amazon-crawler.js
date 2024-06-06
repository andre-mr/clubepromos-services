"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const cheerio = __importStar(require("cheerio"));
function mapProductAttributes(product) {
    return {
        Brand: product.brand,
        CategoryName: product.categoryName,
        ImageUrl: product.imageUrl,
        Name: product.name,
        Price: product.priceDiscount <= product.price ? product.priceDiscount : product.price,
        Sku: product.asin,
        StoreId: 2, // Assuming '2' is the store ID for Amazon
        Url: `https://amazon.com.br/dp/${product.asin}`,
    };
}
const amazonCrawler = async (crawler) => {
    var _a;
    let crawledProducts = [];
    if ((_a = crawler.url.match(/\/([A-Z0-9]{10})/)) === null || _a === void 0 ? void 0 : _a[1]) {
        const resultProduct = await getSingleProduct(crawler.url);
        if (resultProduct) {
            crawledProducts.push(mapProductAttributes(resultProduct));
        }
    }
    else {
        const resultProducts = await getAllProducts(crawler.url);
        const resultCrawledProducts = resultProducts.map((product) => mapProductAttributes(product));
        crawledProducts = [...resultCrawledProducts];
    }
    return crawledProducts;
};
const getAllProducts = async (productUrl) => {
    const getAmazonPage = async (url) => {
        const response = await fetch(url, {
            headers: {
                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6,pt-PT;q=0.5",
                "cache-control": "no-cache",
                "device-memory": "8",
                downlink: "10",
                dpr: "1",
                ect: "4g",
                pragma: "no-cache",
                priority: "u=0, i",
                rtt: "0",
                "sec-ch-device-memory": "8",
                "sec-ch-dpr": "1",
                "sec-ch-ua": '"Microsoft Edge";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-ch-ua-platform-version": '"10.0.0"',
                "sec-ch-viewport-width": "1872",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "viewport-width": "1872",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            },
            referrerPolicy: "strict-origin-when-cross-origin",
            body: null,
            method: "GET",
        });
        return response.text();
    };
    const extractProducts = (htmlContent) => {
        const $ = cheerio.load(htmlContent);
        const products = [];
        $("div[data-asin][data-index]").each((index, element) => {
            var _a, _b;
            const asin = $(element).attr("data-asin");
            if (!asin)
                return;
            const name = $(element).find("span.a-size-base-plus.a-color-base.a-text-normal").text().trim();
            const imageUrl = ((_b = (_a = $(element)
                .find("img.s-image")
                .attr("srcset")) === null || _a === void 0 ? void 0 : _a.split(", ").find((src) => src.includes("2x"))) === null || _b === void 0 ? void 0 : _b.split(" ")[0]) || "";
            const priceText = $(element).find("span.a-offscreen").first().text().replace("R$", "").trim().replace(",", ".");
            const discountPriceFullText = $(element).text();
            const price = parseFloat(priceText || "0");
            let priceDiscount = price;
            const discountPriceRegex = /(\d+,\d+) com desconto Programe e Poupe/;
            const discountPriceMatch = discountPriceFullText.match(discountPriceRegex);
            if (discountPriceMatch) {
                priceDiscount = parseFloat(discountPriceMatch[1].replace(",", "."));
            }
            if (name && (price || priceDiscount)) {
                const product = {
                    asin,
                    name,
                    brand: "",
                    categoryName: "",
                    imageUrl,
                    price,
                    priceDiscount,
                };
                products.push(product);
            }
        });
        return products;
    };
    let allProducts = [];
    let totalResultCount = 0;
    let asinOnPageCount = 0;
    const initialHtmlContent = await getAmazonPage(productUrl);
    const totalResultCountMatch = initialHtmlContent.match(/"totalResultCount":(\d+)/);
    const asinOnPageCountMatch = initialHtmlContent.match(/"asinOnPageCount":(\d+)/);
    if (totalResultCountMatch)
        totalResultCount = parseInt(totalResultCountMatch[1], 10);
    if (asinOnPageCountMatch)
        asinOnPageCount = parseInt(asinOnPageCountMatch[1], 10);
    const totalPages = Math.ceil(totalResultCount / asinOnPageCount);
    for (let i = 1; i <= totalPages; i++) {
        const url = `${productUrl}&page=${i}`;
        const htmlContent = await getAmazonPage(url);
        // fs.writeFileSync(`dev/amazon-page-${i}.html`, htmlContent);
        const products = extractProducts(htmlContent);
        allProducts = allProducts.concat(products);
        await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 2000) + 1000));
    }
    // fs.writeFileSync("dev/amazon-products.json", JSON.stringify(allProducts));
    return allProducts;
};
const getSingleProduct = async (productUrl) => {
    var _a;
    try {
        const response = await fetch(productUrl, {
            headers: {
                accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
                "accept-language": "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7,es;q=0.6,pt-PT;q=0.5",
                "cache-control": "no-cache",
                "device-memory": "8",
                downlink: "10",
                dpr: "1",
                ect: "4g",
                pragma: "no-cache",
                priority: "u=0, i",
                rtt: "0",
                "sec-ch-device-memory": "8",
                "sec-ch-dpr": "1",
                "sec-ch-ua": '"Microsoft Edge";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
                "sec-ch-ua-mobile": "?0",
                "sec-ch-ua-platform": '"Windows"',
                "sec-ch-ua-platform-version": '"10.0.0"',
                "sec-ch-viewport-width": "1872",
                "sec-fetch-dest": "document",
                "sec-fetch-mode": "navigate",
                "sec-fetch-site": "same-origin",
                "sec-fetch-user": "?1",
                "upgrade-insecure-requests": "1",
                "viewport-width": "1872",
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
            },
            referrerPolicy: "strict-origin-when-cross-origin",
            body: null,
            method: "GET",
        });
        const htmlContent = await response.text();
        // fs.writeFileSync(`dev/amazon-page-single.html`, htmlContent); //
        const $ = cheerio.load(htmlContent);
        const asin = ((_a = productUrl.match(/\/([A-Z0-9]{10})/)) === null || _a === void 0 ? void 0 : _a[1]) || "";
        const name = $("#productTitle").text().trim() || "";
        const brand = $("#bylineInfo").text().trim().replace("Visite a loja ", "") ||
            $("#productOverview_feature_div .a-size-base").first().text().trim().replace("Visite a loja ", "") ||
            "";
        const categoryName = $("a.a-link-normal.a-color-tertiary").last().text().trim() || "";
        const priceData = $(".a-section.aok-hidden.twister-plus-buying-options-price-data").text();
        const parsedPriceData = JSON.parse(priceData);
        const newPriceItem = parsedPriceData.desktop_buybox_group_1.find((item) => item.buyingOptionType === "NEW");
        const snsPriceItem = parsedPriceData.desktop_buybox_group_1.find((item) => item.buyingOptionType === "SNS");
        const price = newPriceItem ? Number(newPriceItem.priceAmount || "0") : 0;
        const priceDiscount = snsPriceItem ? Number(snsPriceItem.priceAmount || "0") : 0;
        const imageUrl = $("#landingImage").attr("data-old-hires") || "";
        if (!name || !brand || !categoryName || !price || !imageUrl) {
            console.error("Some product details are missing");
        }
        return {
            asin,
            name,
            brand,
            categoryName,
            imageUrl,
            price,
            priceDiscount,
        };
    }
    catch (error) {
        console.error("Error fetching product details:", error);
        return null;
    }
};
exports.default = amazonCrawler;
