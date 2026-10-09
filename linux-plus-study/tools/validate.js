#!/usr/bin/env node
// Checks that the study content covers every XK0-006 objective.
// Usage: node tools/validate.js          (all domains)
//        node tools/validate.js 3        (only domain 3)
const fs = require("fs");
const path = require("path");
const vm = require("vm");
const OBJECTIVES = require("./objectives");

const onlyDomain = process.argv[2];
const dataDir = path.join(__dirname, "..", "data");
const sandbox = { window: {} };
vm.createContext(sandbox);

const files = fs.readdirSync(dataDir).filter(f => f.endsWith(".js")).sort();
for (const f of files) {
  vm.runInContext(fs.readFileSync(path.join(dataDir, f), "utf8"), sandbox, { filename: f });
}

const data = sandbox.window.LINUX_PLUS_DATA || { domains: [], objectives: [] };
const byId = {};
for (const o of data.objectives || []) byId[o.id] = o;

let errors = 0;
let cardTotal = 0, topicTotal = 0, exampleTotal = 0;
const fail = msg => { errors++; console.log("  ✗ " + msg); };

for (const [id, spec] of Object.entries(OBJECTIVES)) {
  if (onlyDomain && !id.startsWith(onlyDomain + ".")) continue;
  const o = byId[id];
  if (!o) { console.log(id); fail("objective missing"); continue; }
  const problems = [];
  if (!o.title || !o.summary) problems.push("missing title or summary");
  if (!Array.isArray(o.topics) || o.topics.length === 0) problems.push("no topics");
  if (!Array.isArray(o.cards) || o.cards.length < 2) problems.push(`only ${(o.cards || []).length} cards (need 2+)`);
  for (const t of o.topics || []) {
    if (!t.name || !t.explain) problems.push(`topic without name/explain: ${t.name}`);
    for (const e of t.examples || []) if (!e.cmd || !e.what) problems.push(`bad example in ${t.name}`);
    exampleTotal += (t.examples || []).length;
  }
  for (const c of o.cards || []) if (!c.q || !c.a) problems.push("card without q/a");
  const text = JSON.stringify(o).toLowerCase();
  const missing = spec.keywords.filter(k => !text.includes(k.toLowerCase()));
  if (missing.length) problems.push("missing keywords: " + missing.join(", "));
  cardTotal += (o.cards || []).length;
  topicTotal += (o.topics || []).length;
  console.log(`${id}  ${problems.length ? "FAIL" : "ok  "}  ${(o.topics || []).length} topics, ${(o.cards || []).length} cards`);
  problems.forEach(fail);
}

if (!onlyDomain) {
  const domIds = (data.domains || []).map(d => d.id);
  for (const n of [1, 2, 3, 4, 5]) if (!domIds.includes(n)) fail(`domain ${n} metadata missing`);
  const acr = data.acronyms || [];
  console.log(`Acronyms: ${acr.length}`);
}

console.log(`\nTotals: ${topicTotal} topics, ${exampleTotal} examples, ${cardTotal} cards`);
if (errors) { console.log(`\n${errors} problem(s) found.`); process.exit(1); }
console.log("All objectives covered.");
