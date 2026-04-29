const fs = require("fs");
const path = require("path");
const { PAGES_DIR } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const DASHBOARD_PATH = path.join(PAGES_DIR, "operator-intake.html");

function requireIncludes(content, expected) {
  if (!content.includes(expected)) {
    throw new Error(`Dashboard missing: ${expected}`);
  }
}

function requireExcludes(content, forbidden) {
  if (content.includes(forbidden)) {
    throw new Error(`Dashboard contains forbidden text: ${forbidden}`);
  }
}

function qaDashboard() {
  if (!fs.existsSync(DASHBOARD_PATH)) {
    throw new Error(`Missing dashboard: ${DASHBOARD_PATH}`);
  }

  const html = fs.readFileSync(DASHBOARD_PATH, "utf8");

  requireIncludes(html, "Affiliate Link Intake");
  requireIncludes(html, "Generate safe command");
  requireIncludes(html, "Current intake queue");
  requireIncludes(html, "blocked_until_verified");
  requireIncludes(html, "nimo-ai-mini-pc-amd-ryzen-ai-max-395-128gb-ram");
  requireIncludes(html, "noindex,nofollow");
  requireExcludes(html, "Status: PUBLIC-READY");

  logInfo("PASS operator intake dashboard QA");
}

function main() {
  try {
    qaDashboard();
  } catch (error) {
    logError("Operator intake dashboard QA failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
