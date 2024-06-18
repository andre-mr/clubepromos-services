import { URLSanitizer } from "../utils/sanitizer";
import CrawledProduct from "../models/crawled-product";

const X_API_KEY = "fTo8UT5bjg9C6EIidaTEG7Zs3Syz6CzR7ADI4sL7";
const CONSULTORIA = "pechincheiro";
const PRODUCT_BASE_URL = "https://www.natura.com.br/p";
const PAUSE_MIN = 1000;
const PAUSE_MAX = 3000;

const CATEGORIES = ["perfumaria", "presentes", "corpo-e-banho", "cabelos", "rosto", "maquiagem", "infantil"];

function pause(milliseconds: number) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function mapProductAttributes(product: any, category: string): CrawledProduct {
  return {
    Brand: "Natura",
    CategoryName: category,
    ImageUrl: product.images?.medium[0]?.absURL ?? "",
    Name: product.name ?? "",
    Price: Number.parseFloat(product.price?.sales?.value || "0"),
    Sku: product.productId ?? "",
    StoreId: 1, // Assuming '1' is the store ID for Natura
    Url: `${PRODUCT_BASE_URL}/${URLSanitizer(product.name ?? "p")}/${product.productId ?? "NATURA"}${
      CONSULTORIA ? "?consultoria=" + CONSULTORIA : ""
    }`,
  } as CrawledProduct;
}

const naturaCrawler = async (): Promise<CrawledProduct[]> => {
  let allProducts: CrawledProduct[] = [];
  for (const category of CATEGORIES) {
    let start = 0;
    let fetchMore = true;
    let categoryProducts: CrawledProduct[] = [];

    while (fetchMore) {
      const response = await fetch(
        `https://ncf-apigw.prd.naturacloud.com/bff-app-natura-brazil/products-search?count=48&q=&expand=prices,availability,images,variations&sort=product-name-ascending&start=${start}&refine_1=cgid=${category}`,
        {
          headers: {
            accept: "*/*",
            "accept-language": "pt-BR,pt;q=0.9",
            "content-type": "application/json",
            "sec-ch-ua": '"Chromium";v="122", "Not(A:Brand";v="24", "Google Chrome";v="122"',
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": '"Windows"',
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "cross-site",
            tenant_id: "brazil-natura-web",
            "x-api-key": X_API_KEY,
            Referer: "https://www.natura.com.br/",
            "Referrer-Policy": "strict-origin-when-cross-origin",
          },
          body: null,
          method: "GET",
        }
      );

      if (!response.ok) {
        console.error(`Error: ${response.status} - ${response.statusText}`);
        fetchMore = false;
        continue;
      }

      const responseData = await response.json();

      if (responseData.products && responseData.products.length > 0) {
        const currentProductItems = responseData.products.map((product: any) =>
          mapProductAttributes(product, category)
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
  }

  return allProducts;
};

export default naturaCrawler;
