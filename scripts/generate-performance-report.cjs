const fs = require("fs");
const path = require("path");
const { logError, logInfo } = require("./logger.cjs");
const { ROOT } = require("./paths.cjs");

const LEDGER_PATH = path.join(ROOT, "data", "performance-ledger.json");
const REPORT_DIR = path.join(ROOT, "reports", "performance");

function stripBom(text) {
  return String(text || "").replace(/^\uFEFF/, "");
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(stripBom(raw));
}

function safeValue(value) {
  return value === null || value === undefined || value === ""
    ? "Not recorded"
    : String(value);
}

function renderEntry(entry) {
  return `# Performance Report: ${entry.campaignId}

## Current Status

Decision: ${safeValue(entry.decision)}

Landing page:
${safeValue(entry.landingPageUrl)}

Launch batch:
${safeValue(entry.launchBatch)}

Platform:
${safeValue(entry.platform)}

Post URL:
${safeValue(entry.postUrl)}

Posted at:
${safeValue(entry.postedAt)}

## Metrics

| Metric | Value |
|---|---:|
| Views | ${safeValue(entry.views)} |
| Clicks | ${safeValue(entry.clicks)} |
| Signups | ${safeValue(entry.signups)} |
| Revenue | ${safeValue(entry.revenue)} |

## Notes

${safeValue(entry.notes)}

## Decision Rules

- If there is no post URL, status stays not_started.
- If views exist but clicks are zero, revise hook/caption/link placement.
- If clicks exist but signups are zero, review landing page trust and offer fit.
- If signups exist, keep testing and create a second launch batch.
- Do not scale based on guesses.
`;
}

function generateReports() {
  if (!fs.existsSync(LEDGER_PATH)) {
    throw new Error(`Missing performance ledger: ${LEDGER_PATH}`);
  }

  const ledger = readJson(LEDGER_PATH);

  if (!Array.isArray(ledger.entries)) {
    throw new Error("performance-ledger.json must contain entries array");
  }

  fs.mkdirSync(REPORT_DIR, { recursive: true });

  for (const entry of ledger.entries) {
    if (!entry.campaignId) {
      throw new Error("Performance ledger entry missing campaignId");
    }

    const outPath = path.join(REPORT_DIR, `${entry.campaignId}.md`);
    fs.writeFileSync(outPath, renderEntry(entry), "utf8");
    logInfo(`Generated performance report for ${entry.campaignId}`);
  }

  logInfo(`PASS performance reports generated: ${ledger.entries.length}`);
}

function main() {
  try {
    generateReports();
  } catch (error) {
    logError("Performance report generation failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
