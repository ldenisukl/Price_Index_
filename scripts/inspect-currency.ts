import puppeteer from "puppeteer";

async function inspectMICBCurrency() {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
  await page.goto("https://micb.md/", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 2500));

  // Get full innerText around currency lines
  const fullText = await page.evaluate(() => {
    return document.body.innerText;
  });

  const lines = fullText.split("\n");
  
  console.log("\n=== ALL lines containing numbers and EUR/USD ===");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if ((line.includes("EUR") || line.includes("USD")) && /[0-9]+[.,][0-9]/.test(line)) {
      console.log(`Line ${i}: "${line}"`);
    }
  }

  console.log("\n=== First 400 lines (full page start) ===");
  for (let i = 0; i < Math.min(400, lines.length); i++) {
    console.log(`Line ${i}: "${lines[i]}"`);
  }

  // Also test table row extraction
  console.log("\n=== All table rows with EUR or USD ===");
  const tableData = await page.evaluate(() => {
    const tables = document.querySelectorAll("table");
    const results: any[] = [];
    
    tables.forEach((table, tableIdx) => {
      const rows = table.querySelectorAll("tr");
      rows.forEach((row, rowIdx) => {
        const text = row.innerText;
        if (text.includes("EUR") || text.includes("USD")) {
          results.push({
            tableIdx,
            rowIdx,
            text: text.substring(0, 200),
          });
        }
      });
    });

    return results;
  });

  console.log(JSON.stringify(tableData, null, 2));

  await page.close();
  await browser.close();
}

inspectMICBCurrency().catch(console.error);
