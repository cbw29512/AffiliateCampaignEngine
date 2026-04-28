const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { renderAffiliatePage } = require("./page-renderer.cjs");
const { PAGES_DIR } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const GENERATABLE_STATUSES = [
  "review_needed",
  "approved",
  "published",
  "testing"
];

function generatePages() {
  const campaigns = validateCampaigns(loadCampaigns());

  if (!fs.existsSync(PAGES_DIR)) {
    fs.mkdirSync(PAGES_DIR, { recursive: true });
  }

  let generatedCount = 0;

  for (const campaign of campaigns) {
    if (!GENERATABLE_STATUSES.includes(campaign.status)) {
      logInfo(`Skipped ${campaign.id} because status is ${campaign.status}`);
      continue;
    }

    const outputPath = path.join(PAGES_DIR, `${campaign.slug}.html`);
    const html = renderAffiliatePage(campaign);

    fs.writeFileSync(outputPath, html, "utf8");
    generatedCount += 1;

    logInfo(`Generated ${outputPath}`);
  }

  return generatedCount;
}

function main() {
  try {
    const generatedCount = generatePages();
    logInfo(`PASS pages generated: ${generatedCount}`);
  } catch (error) {
    logError("Page generation failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  generatePages
};