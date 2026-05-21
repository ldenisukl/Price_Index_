import puppeteer from "puppeteer";

async function testScrape() {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  
  console.log("\n=== Testing MAIB ===");
  {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );
    await page.goto("https://www.maib.md/", { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2500));

    const innerText = await page.evaluate(() => document.body.innerText);
    console.log("\n=== MAIB document.body.innerText ===");
    const lines = innerText.split("\n");
    lines.forEach((line, idx) => {
      if (line.includes("EUR") || line.includes("USD") || line.includes("MDL")) {
        console.log(`Line ${idx}: ${line}`);
      }
    });

    await page.close();
  }

  console.log("\n\n=== Testing MICB ===");
  {
    const page = await browser.newPage();
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    );
    await page.goto("https://micb.md/", { waitUntil: "networkidle2", timeout: 45000 });
    await new Promise((r) => setTimeout(r, 2500));

    const innerText = await page.evaluate(() => document.body.innerText);
    console.log("\n=== MICB document.body.innerText ===");
    const lines = innerText.split("\n");
    lines.forEach((line, idx) => {
      if (line.includes("EUR") || line.includes("USD") || line.includes("MDL")) {
        console.log(`Line ${idx}: ${line}`);
      }
    });

    await page.close();
  }

  await browser.close();
}

testScrape().catch(console.error);
