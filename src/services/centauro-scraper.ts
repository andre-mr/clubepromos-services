import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";
// import fs from "fs";

const centauroScraper = async (url: string) => {
  const PROXY_URL = process.env.PROXY_URL;
  const PROXY_USERNAME = process.env.PROXY_USERNAME;
  const PROXY_PASSWORD = process.env.PROXY_PASSWORD;

  if (!PROXY_URL || !PROXY_USERNAME || !PROXY_PASSWORD) {
    console.error("❌ Define PROXY_URL, PROXY_USERNAME and PROXY_PASSWORD in .env");
    process.exit(1);
  }

  puppeteer.use(StealthPlugin());

  const browser = await puppeteer.launch({
    headless: true,
    args: [`--proxy-server=${PROXY_URL}`, "--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.authenticate({
    username: PROXY_USERNAME,
    password: PROXY_PASSWORD,
  });

  try {
    await page.goto(url, { waitUntil: "domcontentloaded", timeout: 15000 });

    // const htmlContent = await page.content();
    // fs.writeFileSync(`dev/page-centauro.html`, htmlContent);

    const result = await page.evaluate(() => {
      const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
      let title = "";
      let price = "";
      let image = "";

      for (const script of scripts) {
        try {
          const json = JSON.parse(script.textContent || "");
          if (json["@type"] === "Product") {
            if (json.name) title = json.name;
            if (json.offers) {
              if (json.offers.highPrice) price = json.offers.highPrice.toString();
              else if (json.offers.price) price = json.offers.price.toString();
            }
            if (json.image && Array.isArray(json.image) && json.image.length > 0) {
              image = json.image[0];
            }
            break;
          }
        } catch (e) {
          // ignore parse errors
        }
      }

      if (!image) {
        const ogImage = document.querySelector('meta[property="og:image"]') as HTMLMetaElement;
        if (ogImage) image = ogImage.content;
      }

      return `Title:[${title}]\nPrice:[${price}]\nImage:[${image}]`;
    });

    await browser.close();
    return result;
  } catch (error) {
    await browser.close();
    console.error("Puppeteer error:", error);
    return { title: "", price: "", image: "" };
  }
};

export default centauroScraper;
