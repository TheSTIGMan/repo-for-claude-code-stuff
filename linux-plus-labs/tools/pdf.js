// Render an HTML file to PDF with headless Chromium (Playwright).
// Usage: node tools/pdf.js input.html output.pdf
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const [input, output] = process.argv.slice(2).map(p => path.resolve(p));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + input, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: output,
    format: "Letter",
    printBackground: true,
    preferCSSPageSize: true,
    outline: true,
    tagged: true,
  });
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
