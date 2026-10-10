// Render an HTML file to PDF with headless Chromium (Playwright).
// Usage: node tools/pdf.js input.html output.pdf [--untagged]
// Chromium only writes bookmarks into tagged PDFs; tagging roughly doubles the file size.
const path = require("path");
const { chromium } = require("playwright");

(async () => {
  const args = process.argv.slice(2);
  const untagged = args.includes("--untagged");
  const [input, output] = args.filter(a => !a.startsWith("--")).map(p => path.resolve(p));
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + input, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.pdf({
    path: output,
    format: "Letter",
    printBackground: true,
    preferCSSPageSize: true,
    outline: !untagged,
    tagged: !untagged,
  });
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
