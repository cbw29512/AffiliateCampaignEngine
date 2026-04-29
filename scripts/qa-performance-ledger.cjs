const fs = require("fs");
const path = require("path");
const { logError, logInfo } = require("./logger.cjs");
const { ROOT } = require("./paths.cjs");

const LEDGER_PATH = path.join(ROOT, "data", "performance-ledger.json");

function stripBom(text) {
  return String(text || "").replace(/^\uFEFF/, "");
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(stripBom(raw));
}

function assertNumberOrNull(value, label) {
  if (value !== null && typeof value !== "number") {
    throw new Error(`${label} must be number or null`);
  }
}

function assertTextOrNull(value, label) {
  if (value !== null && typeof value !== "string") {
    throw new Error(`${label} must be string or null`);
  }
}

function qaLedger() {
  if (!fs.existsSync(LEDGER_PATH)) {
    throw new Error(`Missing performance ledger: ${LEDGER_PATH}`);
  }

  const ledger = readJson(LEDGER_PATH);

  if (!Array.isArray(ledger.entries)) {
    throw new Error("performance-ledger.json must contain entries array");
  }

  for (const entry of ledger.entries) {
    if (!entry.campaignId) {
      throw new Error("Ledger entry missing campaignId");
    }

    if (!entry.landingPageUrl || !entry.landingPageUrl.startsWith("https://")) {
      throw new Error(`${entry.campaignId} missing valid landingPageUrl`);
    }

    assertTextOrNull(entry.platform, "platform");
    assertTextOrNull(entry.postUrl, "postUrl");
    assertTextOrNull(entry.postedAt, "postedAt");
    assertNumberOrNull(entry.views, "views");
    assertNumberOrNull(entry.clicks, "clicks");
    assertNumberOrNull(entry.signups, "signups");
    assertNumberOrNull(entry.revenue, "revenue");

    if (!entry.decision) {
      throw new Error(`${entry.campaignId} missing decision`);
    }
  }

  logInfo("PASS performance ledger QA");
}

function main() {
  try {
    qaLedger();
  } catch (error) {
    logError("Performance ledger QA failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
