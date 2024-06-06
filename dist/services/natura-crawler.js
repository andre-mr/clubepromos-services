"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sanitizer_1 = require("../utils/sanitizer");
const X_API_KEY = "fTo8UT5bjg9C6EIidaTEG7Zs3Syz6CzR7ADI4sL7";
const CONSULTORIA = "pechincheiro";
const PRODUCT_BASE_URL = "https://www.natura.com.br/p";
const PAUSE_MIN = 1000;
const PAUSE_MAX = 3000;
const CATEGORIES = ["perfumaria", "presentes", "corpo-e-banho", "cabelos", "rosto", "maquiagem", "infantil"];
function pause(milliseconds) {
    return new Promise((resolve) => setTimeout(resolve, milliseconds));
}
function mapProductAttributes(product, category) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    return {
        Brand: "Natura",
        CategoryName: category,
        ImageUrl: (_c = (_b = (_a = product.images) === null || _a === void 0 ? void 0 : _a.medium[0]) === null || _b === void 0 ? void 0 : _b.absURL) !== null && _c !== void 0 ? _c : "",
        Name: (_d = product.name) !== null && _d !== void 0 ? _d : "",
        Price: Number.parseFloat(((_f = (_e = product.price) === null || _e === void 0 ? void 0 : _e.sales) === null || _f === void 0 ? void 0 : _f.value) || "0"),
        Sku: (_g = product.productId) !== null && _g !== void 0 ? _g : "",
        StoreId: 1, // Assuming '1' is the store ID for Natura
        Url: `${PRODUCT_BASE_URL}/${(0, sanitizer_1.URLSanitizer)((_h = product.name) !== null && _h !== void 0 ? _h : "p")}/${(_j = product.productId) !== null && _j !== void 0 ? _j : "NATURA"}${CONSULTORIA ? "?consultoria=" + CONSULTORIA : ""}`,
    };
}
const naturaCrawler = async () => {
    let allProducts = [];
    for (const category of CATEGORIES) {
        let start = 0;
        let fetchMore = true;
        let categoryProducts = [];
        while (fetchMore) {
            const response = await fetch(`https://ncf-apigw.prd.naturacloud.com/bff-app-natura-brazil/products-search?count=48&q=&expand=prices,availability,images,variations&sort=product-name-ascending&start=${start}&refine_1=cgid=${category}`, {
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
            });
            const responseData = await response.json();
            if (responseData.products && responseData.products.length > 0) {
                const currentProductItems = responseData.products.map((product) => mapProductAttributes(product, category));
                categoryProducts.push(...currentProductItems);
                start += 48;
                const randomPause = Math.floor(Math.random() * (PAUSE_MAX - PAUSE_MIN + 1)) + PAUSE_MIN;
                await pause(randomPause);
            }
            else {
                fetchMore = false;
            }
        }
        allProducts.push(...categoryProducts);
    }
    return allProducts;
};
exports.default = naturaCrawler;
