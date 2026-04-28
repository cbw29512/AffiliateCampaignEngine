const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { ROOT, PAGES_DIR } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }
}

function requireIncludes(filePath, text) {
  const content = fs.readFileSync(filePath, "utf8");

  if (!content.includes(text)) {
    throw new Error(`Missing "${text}" inside ${filePath}`);
  }
}

function runQa() {
  const campaigns = validateCampaigns(loadCampaigns());

  requireFile(path.join(PAGES_DIR, "index.html"));
  requireFile(path.join(PAGES_DIR, "redirect.html"));
  requireFile(path.join(ROOT, "assets", "style.css"));

  for (const campaign of campaigns) {
    const pagePath = path.join(PAGES_DIR, `${campaign.slug}.html`);
    const promptPath = path.join(ROOT, "content", "shorts-prompts", `${campaign.id}.txt`);

    requireFile(pagePath);
    requireFile(promptPath);

    requireIncludes(pagePath, campaign.headline);
    requireIncludes(pagePath, `redirect.html?cid=${campaign.id}`);
    requireIncludes(pagePath, "Disclosure:");
    requireIncludes(promptPath, campaign.productName);
  }

  logInfo(`PASS QA checked ${campaigns.length} campaigns`);
}

function main() {
  try {
    runQa();
  } catch (error) {
    logError("QA failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}