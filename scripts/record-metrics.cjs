const fs = require("fs");
const path = require("path");
const { ROOT } = require("./paths.cjs");

const LEDGER_PATH = path.join(ROOT, "data", "performance-ledger.json");

function stripBom(text) {
  return String(text || "").replace(/^\uFEFF/, "");
}

function readLedger() {
  const raw = fs.readFileSync(LEDGER_PATH, "utf8");
  return JSON.parse(stripBom(raw));
}

function writeLedger(ledger) {
  ledger.updatedAt = new Date().toISOString();
  fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2) + "\n", "utf8");
}

function requireText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing ${label}`);
  }

  return value.trim();
}

function parseMetric(value, label) {
  if (value === undefined || value === null || value === "") {
    throw new Error(`Missing ${label}`);
  }

  const numberValue = Number(value);

  if (!Number.isFinite(numberValue)) {
    throw new Error(`${label} must be a number`);
  }

  if (numberValue < 0) {
    throw new Error(`${label} cannot be negative`);
  }

  return numberValue;
}

function decide(entry) {
  if (!entry.postUrl) {
    return "not_started";
  }

  if ((entry.views || 0) > 0 && (entry.clicks || 0) === 0) {
    return "revise_hook_or_link";
  }

  if ((entry.clicks || 0) > 0 && (entry.signups || 0) === 0) {
    return "review_landing_page_or_offer_fit";
  }

  if ((entry.signups || 0) > 0 || (entry.revenue || 0) > 0) {
    return "keep_testing";
  }

  return "monitoring";
}

function recordMetrics() {
  const campaignId = requireText(process.argv[2], "campaignId");
  const views = parseMetric(process.argv[3], "views");
  const clicks = parseMetric(process.argv[4], "clicks");
  const signups = parseMetric(process.argv[5], "signups");
  const revenue = parseMetric(process.argv[6], "revenue");
  const note = process.argv[7] ? requireText(process.argv[7], "note") : null;

  const ledger = readLedger();

  if (!Array.isArray(ledger.entries)) {
    throw new Error("performance-ledger.json must contain entries array");
  }

  const entry = ledger.entries.find((item) => item.campaignId === campaignId);

  if (!entry) {
    throw new Error(`No performance ledger entry found for ${campaignId}`);
  }

  entry.views = views;
  entry.clicks = clicks;
  entry.signups = signups;
  entry.revenue = revenue;
  entry.decision = decide(entry);

  if (note) {
    entry.notes = [entry.notes || "", note].filter(Boolean).join("\n");
  }

  writeLedger(ledger);

  console.log(`[INFO] Recorded metrics for ${campaignId}`);
  console.log(`[INFO] Views: ${views}`);
  console.log(`[INFO] Clicks: ${clicks}`);
  console.log(`[INFO] Signups: ${signups}`);
  console.log(`[INFO] Revenue: ${revenue}`);
  console.log(`[INFO] Decision: ${entry.decision}`);
}

try {
  recordMetrics();
} catch (error) {
  console.error(`[ERROR] ${error.message}`);
  console.error("");
  console.error("Usage:");
  console.error('node scripts/record-metrics.cjs kikoff-credit-builder 100 5 0 0 "24 hour check"');
  process.exit(1);
}
