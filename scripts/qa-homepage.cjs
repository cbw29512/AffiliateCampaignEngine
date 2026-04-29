const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { isPublicReady } = require("./affiliate-helpers.cjs");
const { PAGES_DIR } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }
}

function requireIncludes(text, expected) {
  if (!text.includes(expected)) {
    throw new Error(`Homepage missing expected text: ${expected}`);
  }
}

function requireExcludes(text, forbidden) {
  if (text.includes(forbidden)) {
    throw new Error(`Blocked campaign leaked onto homepage: ${forbidden}`);
  }
}

function qaHomepage() {
  const campaigns = validateCampaigns(loadCampaigns());
  const homepagePath = path.join(PAGES_DIR, "index.html");

  requireFile(homepagePath);

  const html = fs.readFileSync(homepagePath, "utf8");

  requireIncludes(html, "No-nonsense product reviews");
  requireIncludes(html, "Disclosure");

  for (const campaign of campaigns) {
    if (isPublicReady(campaign)) {
      requireIncludes(html, `${campaign.slug}.html`);
      requireIncludes(html, campaign.productName);
    } else {
      requireExcludes(html, `${campaign.slug}.html`);
      requireExcludes(html, campaign.productName);
    }
  }

  logInfo("PASS homepage QA");
}

function main() {
  try {
    qaHomepage();
  } catch (error) {
    logError("Homepage QA failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
