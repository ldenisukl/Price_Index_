import puppeteer from "puppeteer";

async function testTableExtraction() {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  console.log("\n=== Testing MAIB Table Extraction ===");
  {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
    await page.goto("https://www.maib.md/", { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2500));

    const rates = await page.evaluate(() => {
      const result: Record<string, number> = {};
      const tables = document.querySelectorAll("table, [role='table']");

      for (const table of tables) {
        const text = (table as any).innerText || "";
        const lines = text.split("\n").map((l: string) => l.trim()).filter(Boolean);

        for (const line of lines) {
          const eurmatch = line.match(/^EUR\s+([0-9,]+\.?[0-9]*)/);
          const usdmatch = line.match(/^USD\s+([0-9,]+\.?[0-9]*)/);

          if (eurmatch && !result.EUR) {
            const val = parseFloat(eurmatch[1].replace(",", "."));
            if (val && val > 5 && val < 50) {
              result.EUR = val;
            }
          }

          if (usdmatch && !result.USD) {
            const val = parseFloat(usdmatch[1].replace(",", "."));
            if (val && val > 5 && val < 50) {
              result.USD = val;
            }
          }
        }
      }

      return result;
    });

    console.log("MAIB Rates:", rates);
    await page.close();
  }

  console.log("\n=== Testing MICB Table Extraction ===");
  {
    const page = await browser.newPage();
    await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
    await page.goto("https://micb.md/", { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2500));

    const rates = await page.evaluate(() => {
      const result: Record<string, number> = {};
      const bodyText = document.body.innerText || "";
      const lines = bodyText.split("\n").map((l: string) => l.trim()).filter(Boolean);

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line === "EUR" && i + 1 < lines.length) {
          const next = lines[i + 1];
          const numMatch = next.match(/^([0-9,]+\.?[0-9]*)/);
          if (numMatch && !result.EUR) {
            const val = parseFloat(numMatch[1].replace(",", "."));
            if (val && val > 5 && val < 50) {
              result.EUR = val;
            }
          }
        }
        
        if (line === "USD" && i + 1 < lines.length) {
          const next = lines[i + 1];
          const numMatch = next.match(/^([0-9,]+\.?[0-9]*)/);
          if (numMatch && !result.USD) {
            const val = parseFloat(numMatch[1].replace(",", "."));
            if (val && val > 5 && val < 50) {
              result.USD = val;
            }
          }
        }
      }

      return result;
    });

    console.log("MICB Rates:", rates);
    await page.close();
  }

  await browser.close();
}

testTableExtraction().catch(console.error);
