const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { renderAffiliatePage } = require("./page-renderer.cjs");
const { isPublicReady } = require("./affiliate-helpers.cjs");
const { PAGES_DIR } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

function cleanOldCampaignPages(campaigns) {
  for (const campaign of campaigns) {
    const outputPath = path.join(PAGES_DIR, `${campaign.slug}.html`);

    if (fs.existsSync(outputPath)) {
      fs.unlinkSync(outputPath);
      logInfo(`Removed stale page ${outputPath}`);
    }
  }
}

function generatePages() {
  const campaigns = validateCampaigns(loadCampaigns());

  if (!fs.existsSync(PAGES_DIR)) {
    fs.mkdirSync(PAGES_DIR, { recursive: true });
  }

  cleanOldCampaignPages(campaigns);

  let generatedCount = 0;

  for (const campaign of campaigns) {
    if (!isPublicReady(campaign)) {
      logInfo(`Skipped ${campaign.id} because it is not public-ready`);
      continue;
    }

    const outputPath = path.join(PAGES_DIR, `${campaign.slug}.html`);
    const html = renderAffiliatePage(campaign);

    fs.writeFileSync(outputPath, html, "utf8");
    generatedCount += 1;

    logInfo(`Generated ${outputPath}`);
  }

  logInfo(`PASS pages generated: ${generatedCount}`);
  return generatedCount;
}

function main() {
  try {
    generatePages();
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