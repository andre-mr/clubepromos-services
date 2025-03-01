import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
// import fs from "fs";

const temuScraper = async (url: string) => {
  const PROXY_URL = process.env.PROXY_URL || "";
  const PROXY_USERNAME = process.env.PROXY_USERNAME || "";
  const PROXY_PASSWORD = process.env.PROXY_PASSWORD || "";

  puppeteer.use(StealthPlugin());
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      "--start-maximized", // Iniciar o navegador maximizado
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-infobars",
      "--disable-blink-features=AutomationControlled",
      `--proxy-server=${PROXY_URL}`, // Configurar o proxy
    ],
  });
  const [page] = await browser.pages();
  // page.on("console", (message) => {
  //   console.log(`Browser console log: ${message.text()}`);
  // });
  await page.authenticate({
    username: PROXY_USERNAME,
    password: PROXY_PASSWORD,
  });
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
  );
  await page.setRequestInterception(true);
  page.on("request", (req) => {
    const resourceType = req.resourceType();
    if (
      resourceType === "image" ||
      resourceType === "font" ||
      resourceType === "stylesheet" ||
      resourceType === "script"
    ) {
      req.abort();
    } else {
      req.continue();
    }
  });

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10000 });
    await page.evaluate(() => {
      return new Promise((resolve) => setTimeout(resolve, 5000)); // Aguarda mais 5 segundos
    });

    // Salvar HTML da página para inspeção manual
    const htmlContent = await page.content();
    // fs.writeFileSync(`dev/page-${Date.now().toString()}.html`, htmlContent);

    const result = await page.evaluate(() => {
      let title = "";
      let price = "";
      let image = "";

      const titleElement = document.querySelector('h1[class*="goodsNameText"]') as HTMLHeadingElement;
      const priceElement = document.querySelector(
        'div[class*="salePriceAmount"] span[class*="priceWrap"] > span:last-child'
      ) as HTMLSpanElement;
      const imageElement = document.querySelector('img[src*="imageView2/2/w/800/"]') as HTMLImageElement;
      (document.querySelector('img[src*="https://img.kwcdn.com/product/fancy/"]') as HTMLImageElement) ||
        (document.querySelector('img[src*="https://img.kwcdn.com/product/open/"]') as HTMLImageElement);
      if (!image) {
        const ogImageMeta = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
        if (ogImageMeta) {
          image = ogImageMeta.content;
        }
      }

      title = titleElement ? titleElement.innerText : "";
      price = priceElement ? priceElement.innerText : "";
      image = imageElement ? imageElement.src : image;

      // If fail, try to capture from script JSON-LD with @type "Product"
      if (!title || !price || !image) {
        const jsonLdElements = Array.from(
          document.querySelectorAll('script[type="application/ld+json"]')
        ) as HTMLScriptElement[];
        for (const element of jsonLdElements) {
          try {
            const jsonLd = JSON.parse(element.innerText);
            if (jsonLd["@type"] === "Product") {
              if (!title && jsonLd.name) {
                title = jsonLd.name;
              }
              if (!price && jsonLd.offers && jsonLd.offers.price) {
                price = jsonLd.offers.price;
              }
              if (!image && jsonLd.image && jsonLd.image.length > 0) {
                image = jsonLd.image[0].contentURL;
              }
              break; // Exit loop once the correct script is found and data is extracted
            }
          } catch (e) {
            // Handle JSON parsing error if necessary
            console.error("Error parsing JSON-LD script:", e);
          }
        }
      }

      return `Title:[${title}]\nPrice:[${price}]\nImage:[${image}]`;
    });
    await browser.close();

    return result;
  } catch (error) {
    console.error("Puppeteer error:", error);
    return "";
  }
};

export default temuScraper;
