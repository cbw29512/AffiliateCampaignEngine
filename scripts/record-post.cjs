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

function requireUrl(value, label) {
  const clean = requireText(value, label);

  if (!/^https?:\/\//i.test(clean)) {
    throw new Error(`${label} must start with http:// or https://`);
  }

  return clean;
}

function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

function recordPost() {
  const campaignId = requireText(process.argv[2], "campaignId");
  const platform = requireText(process.argv[3], "platform");
  const postUrl = requireUrl(process.argv[4], "postUrl");
  const postedAt = process.argv[5] ? requireText(process.argv[5], "postedAt") : todayIsoDate();

  const ledger = readLedger();

  if (!Array.isArray(ledger.entries)) {
    throw new Error("performance-ledger.json must contain entries array");
  }

  const entry = ledger.entries.find((item) => item.campaignId === campaignId);

  if (!entry) {
    throw new Error(`No performance ledger entry found for ${campaignId}`);
  }

  entry.platform = platform;
  entry.postUrl = postUrl;
  entry.postedAt = postedAt;
  entry.decision = "posted_monitoring";
  entry.notes = [
    entry.notes || "",
    `Posted to ${platform} on ${postedAt}. Waiting for real metrics.`
  ]
    .filter(Boolean)
    .join("\n");

  // Do not invent metrics.
  entry.views = entry.views ?? null;
  entry.clicks = entry.clicks ?? null;
  entry.signups = entry.signups ?? null;
  entry.revenue = entry.revenue ?? null;

  writeLedger(ledger);

  console.log(`[INFO] Recorded post for ${campaignId}`);
  console.log(`[INFO] Platform: ${platform}`);
  console.log(`[INFO] Post URL: ${postUrl}`);
  console.log(`[INFO] Posted at: ${postedAt}`);
  console.log("[INFO] Metrics remain unchanged unless manually recorded.");
}

try {
  recordPost();
} catch (error) {
  console.error(`[ERROR] ${error.message}`);
  console.error("");
  console.error("Usage:");
  console.error('node scripts/record-post.cjs kikoff-credit-builder youtube-shorts "https://example.com/post-url"');
  process.exit(1);
}
