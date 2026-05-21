import puppeteer from "puppeteer";

async function inspectMICB() {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
  await page.goto("https://micb.md/", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 2500));

  const tableStructure = await page.evaluate(() => {
    const result: any[] = [];

    // Try different selectors
    const selectors = ["table", "[role='table']", ".rates", ".courses", ".currency", ".exchange"];

    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) continue;

      for (const el of elements) {
        const html = (el as any).outerHTML?.slice(0, 200) || "";
        const text = (el as any).innerText?.slice(0, 200) || "";
        result.push({
          selector,
          tagName: (el as any).tagName,
          textPreview: text,
          htmlPreview: html,
        });
      }
    }

    return result;
  });

  console.log("MICB Table Structures:");
  console.log(JSON.stringify(tableStructure, null, 2));

  await page.close();
  await browser.close();
}

inspectMICB().catch(console.error);
