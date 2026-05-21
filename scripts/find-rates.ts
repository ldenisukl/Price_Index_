import puppeteer from "puppeteer";

async function findRates() {
  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36");
  await page.goto("https://micb.md/", { waitUntil: "networkidle2", timeout: 45000 });
  await new Promise((r) => setTimeout(r, 2500));

  const rates = await page.evaluate(() => {
    // Look for text that matches numbers like 16.xx or 17.xx
    const bodyText = document.body.innerText;
    const lines = bodyText.split("\n");
    
    const result: any = {
      fullSearch: [],
      byRegex: {},
    };

    // Search for EUR and USD with following numbers
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      if (line.includes("EUR") || line.includes("USD")) {
        result.fullSearch.push({
          lineNum: i,
          line: line,
          nextLine: lines[i + 1]?.trim() || "",
          nextNextLine: lines[i + 2]?.trim() || "",
        });
      }

      // Look for lines with just numbers 15-25 or 16-20
      const numMatch = line.match(/^([0-9]{1,2}[.,][0-9]+)(\s|$)/);
      if (numMatch) {
        result.fullSearch.push({
          number: numMatch[1],
          context: `${lines[i - 1]?.trim() || ""} -> ${line} -> ${lines[i + 1]?.trim() || ""}`,
        });
      }
    }

    return result;
  });

  console.log("Rate Search Results:");
  console.log(JSON.stringify(rates, null, 2));

  await page.close();
  await browser.close();
}

findRates().catch(console.error);
