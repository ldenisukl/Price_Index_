import puppeteer from 'puppeteer';

async function main() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.goto('https://www.maib.md/', { waitUntil: 'networkidle2', timeout: 45000 });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  console.log('URL:', page.url());
  const tableHtml = await page.evaluate(() => document.querySelector('table.exchange__table')?.innerHTML || 'NO_TABLE');
  console.log(tableHtml.slice(0, 12000));
  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
