import puppeteer from "puppeteer";

async function test() {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );
    await page.goto("https://www.maib.md/", { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2500));

    const rates = await page.evaluate(() => {
      const result: Record<string, number> = {};

      // Target the specific exchange rate table
      const table = document.querySelector("table.exchange__table");
      if (!table) {
        console.log("Table not found!");
        return result;
      }

      const rows = table.querySelectorAll("tbody tr");
      console.log(`Found ${rows.length} rows`);

      rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 2) return;

        const currencyCode = cells[0]?.innerText?.trim() || "";
        const buyValue = cells[1]?.innerText?.trim() || "";

        if ((currencyCode === "EUR" || currencyCode === "USD") && buyValue) {
          const val = parseFloat(buyValue.replace(",", "."));
          if (val && val > 5 && val < 50) {
            result[currencyCode] = val;
          }
        }
      });

      return result;
    });

    console.log("MAIB Result:", JSON.stringify(rates, null, 2));
  } catch (err) {
    console.error("Error:", err);
  } finally {
    await browser.close();
  }
  
  process.exit(0);
}

test();
