import CrawledProduct from "../models/crawled-product";
import Crawler from "../models/crawler";
import * as cheerio from "cheerio";
import { fetchHtml } from "./fetch-custom";

// import fs from "fs";

interface AmazonProduct {
  asin: string;
  name: string;
  brand: string;
  categoryName: string;
  imageUrl: string;
  price: number;
}

function mapProductAttributes(storeId: number, product: AmazonProduct): CrawledProduct {
  return {
    Brand: product.brand,
    CategoryName: product.categoryName,
    ImageUrl: product.imageUrl,
    Name: product.name,
    Price: product.price,
    Sku: product.asin,
    StoreId: storeId,
    Url: `https://amazon.com.br/dp/${product.asin}`,
  } as CrawledProduct;
}

const amazonCrawler = async (storeId: number, crawler: Crawler, proxyEndpoint?: string) => {
  let crawledProducts: CrawledProduct[] = [];

  if (crawler.url.match(/\/([A-Z0-9]{10})/)?.[1]) {
    const resultProduct = await getSingleProduct(crawler.url, proxyEndpoint);
    if (resultProduct) {
      crawledProducts.push(mapProductAttributes(storeId, resultProduct));
    }
  } else {
    const resultProducts = await getAllProducts(crawler.url, proxyEndpoint);
    const resultCrawledProducts = resultProducts.map((product) => mapProductAttributes(storeId, product));
    crawledProducts = [...resultCrawledProducts];
  }

  return crawledProducts;
};

const getAllProducts = async (productUrl: string, proxyEndpoint?: string): Promise<AmazonProduct[]> => {
  const getAmazonPage = async (url: string) => {
    const response = await fetchHtml({ url, proxyEndpoint });

    if (!response.ok) {
      console.log(response.status, response.statusText);
    }
    return response.text();
  };

  const extractProducts = (htmlContent: string) => {
    const $ = cheerio.load(htmlContent);
    const products: AmazonProduct[] = [];

    $("div[data-asin][data-index]").each((index, element) => {
      const asin = $(element).attr("data-asin");
      if (!asin) return;

      // fs.writeFileSync("dev/element.html", $.html(element));

      const name = $(element).find("span.a-size-base-plus.a-color-base.a-text-normal").text().trim();
      const imageUrl =
        $(element)
          .find("img.s-image")
          .attr("srcset")
          ?.split(", ")
          .find((src) => src.includes("2x"))
          ?.split(" ")[0] || "";

      const priceText = $(element).find("span.a-offscreen").first().text().replace("R$", "").trim();
      const formattedPriceText = priceText.replace(/\./g, "").replace(",", ".");
      const price = parseFloat(formattedPriceText || "0");

      let priceDiscount = price;
      const discountPriceFullText = $(element).text();
      const discountPriceRegex = /R\$(\s|&nbsp;)(\d{1,3}(\.\d{3}|\d{3})*,\d{1,2}) com desconto Programe e Poupe/;
      const discountPriceMatch = discountPriceFullText.match(discountPriceRegex);
      if (discountPriceMatch && discountPriceMatch[2]) {
        const formattedDiscountPriceText = discountPriceMatch[2].replace(/[^\d,]/g, "").replace(",", ".");
        priceDiscount = parseFloat(formattedDiscountPriceText) || price;
      }

      if (name && (price || priceDiscount)) {
        const product: AmazonProduct = {
          asin,
          name,
          brand: "",
          categoryName: "",
          imageUrl,
          price: priceDiscount,
        };

        products.push(product);
      }
    });

    return products;
  };

  let allProducts: AmazonProduct[] = [];
  let totalResultCount = 0;
  let asinOnPageCount = 0;

  const initialHtmlContent = await getAmazonPage(productUrl);

  const totalResultCountMatch = initialHtmlContent.match(/"totalResultCount":(\d+)/);
  const asinOnPageCountMatch = initialHtmlContent.match(/"asinOnPageCount":(\d+)/);
  if (totalResultCountMatch) totalResultCount = parseInt(totalResultCountMatch[1], 10);
  if (asinOnPageCountMatch) asinOnPageCount = parseInt(asinOnPageCountMatch[1], 10);

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

const getSingleProduct = async (productUrl: string, proxyEndpoint?: string): Promise<AmazonProduct | null> => {
  const getAmazonPage = async (url: string) => {
    const response = await fetchHtml({ url, proxyEndpoint });

    if (!response.ok) {
      console.log(response.status, response.statusText);
    }
    return response.text();
  };

  const htmlContent = await getAmazonPage(productUrl);
  // fs.writeFileSync(`dev/amazon-page-single.html`, htmlContent);
  const $ = cheerio.load(htmlContent);

  const asin = productUrl.match(/\/([A-Z0-9]{10})/)?.[1] || "";
  const name = $("#productTitle").text().trim() || "";
  const brand =
    $("#bylineInfo").text().trim().replace("Visite a loja ", "") ||
    $("#productOverview_feature_div .a-size-base").first().text().trim().replace("Visite a loja ", "") ||
    "";
  const categoryName = $("a.a-link-normal.a-color-tertiary").last().text().trim() || "";

  const priceData = $(".a-section.aok-hidden.twister-plus-buying-options-price-data")?.text();

  let price = 0;
  let priceDiscount = 0;
  if (priceData) {
    const parsedPriceData = JSON.parse(priceData);
    const newPriceItem = parsedPriceData.desktop_buybox_group_1.find((item: any) => item.buyingOptionType === "NEW");
    const snsPriceItem = parsedPriceData.desktop_buybox_group_1.find((item: any) => item.buyingOptionType === "SNS");

    price = newPriceItem ? Number(newPriceItem.priceAmount || "0") : 0;
    priceDiscount = snsPriceItem ? Number(snsPriceItem.priceAmount || "0") : 0;
  } else {
    const priceInputValue = $("#twister-plus-price-data-price").val();
    price = priceInputValue ? parseFloat(priceInputValue?.toString()) : 0;
  }

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
  } as AmazonProduct;
};

export default amazonCrawler;
