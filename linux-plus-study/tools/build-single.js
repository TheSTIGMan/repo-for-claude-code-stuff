#!/usr/bin/env node
// Inlines styles.css, data/*.js and app.js into one self-contained HTML file.
// Usage: node tools/build-single.js [output.html]   (default: dist/linux-plus-study.html)
//        add --fragment to drop <!doctype>/<html>/<head>/<body> wrappers (for hosts that add their own).
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const args = process.argv.slice(2);
const fragment = args.includes("--fragment");
const out = args.find(a => !a.startsWith("--")) || path.join(root, "dist", "linux-plus-study.html");

let html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const safe = s => s.replace(/<\/script/gi, "<\\/script");
html = html.replace('<link rel="stylesheet" href="styles.css">',
  () => "<style>\n" + fs.readFileSync(path.join(root, "styles.css"), "utf8") + "</style>");
html = html.replace(/<script src="([^"]+)"><\/script>/g,
  (_, src) => "<script>\n" + safe(fs.readFileSync(path.join(root, src), "utf8")) + "\n</script>");

if (fragment) {
  const head = html.match(/<head>([\s\S]*?)<\/head>/)[1]
    .replace(/<meta charset[^>]*>\s*/, "").replace(/<meta name="viewport"[^>]*>\s*/, "");
  const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
  html = head.trim() + "\n" + body.trim() + "\n";
}
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, html);
console.log(`Wrote ${out} (${(fs.statSync(out).size / 1024).toFixed(0)} KB)`);
