import { URLSanitizer } from "../utils/sanitizer";
import CrawledProduct from "../models/crawled-product";
import { fetchJSON } from "./fetch-custom";

const X_API_KEY = "fTo8UT5bjg9C6EIidaTEG7Zs3Syz6CzR7ADI4sL7";
const PRODUCT_BASE_URL = "https://www.natura.com.br/p";
const PAUSE_MIN = 1000;
const PAUSE_MAX = 3000;

const CATEGORIES = ["perfumaria", "presentes", "corpo-e-banho", "cabelos", "rosto", "maquiagem", "infantil"];

function pause(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function mapProductAttributes(storeId: number, product: any, category: string): CrawledProduct {
  return {
    Brand: "Natura",
    CategoryName: category,
    ImageUrl: product.images?.medium[0]?.absURL ?? "",
    Name: product.name ?? "",
    Price: Number.parseFloat(product.price?.sales?.value || "0"),
    Sku: product.productId ?? "",
    StoreId: storeId,
    Url: `${PRODUCT_BASE_URL}/${URLSanitizer(product.name ?? "p")}/${product.productId ?? "NATURA"}`,
  } as CrawledProduct;
}

const naturaCrawler = async (storeId: number, proxyEndpoint?: string): Promise<CrawledProduct[]> => {
  let allProducts: CrawledProduct[] = [];
  for (const category of CATEGORIES) {
    let start = 0;
    let fetchMore = true;
    let categoryProducts: CrawledProduct[] = [];

    while (fetchMore) {
      const response = await fetchJSON({
        proxyEndpoint,
        url: `https://ncf-apigw.prd.naturacloud.com/bff-app-natura-brazil/products-search?count=48&q=&expand=prices,availability,images,variations&sort=product-name-ascending&start=${start}&refine_1=cgid=${category}`,
        headers: {
          accept: "*/*",
          "Accept-Language": "pt-BR,pt;q=0.8,en-US;q=0.5,en;q=0.3",
          Connection: "keep-alive",
          tenant_id: "brazil-natura-web",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:126.0) Gecko/20100101 Firefox/126.0",
          "x-api-key": X_API_KEY,
        },
        body: null,
        method: "GET",
      });

      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
        fetchMore = false;
        continue;
      }

      const responseData = await response.json();

      if (responseData.products && responseData.products.length > 0) {
        const currentProductItems = responseData.products.map((product: any) =>
          mapProductAttributes(storeId, product, category)
        );
        categoryProducts.push(...currentProductItems);

        start += 48;
        const randomPause = Math.floor(Math.random() * (PAUSE_MAX - PAUSE_MIN + 1)) + PAUSE_MIN;
        await pause(randomPause);
      } else {
        fetchMore = false;
      }
    }
    allProducts.push(...categoryProducts);
    console.log("Category fetched: ", category, categoryProducts.length);
  }

  return allProducts;
};

export default naturaCrawler;
