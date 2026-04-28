const { loadCampaigns } = require("./campaign-loader.cjs");
const { logError, logInfo } = require("./logger.cjs");

const VALID_STATUSES = [
  "draft",
  "review_needed",
  "approved",
  "published",
  "testing",
  "winner",
  "paused"
];

function requireField(campaign, field, prefix) {
  if (!campaign[field]) {
    throw new Error(`${prefix} missing ${field}.`);
  }
}

function validateCampaign(campaign, index) {
  const prefix = `Campaign ${index + 1}`;

  requireField(campaign, "id", prefix);
  requireField(campaign, "status", prefix);
  requireField(campaign, "category", prefix);
  requireField(campaign, "productName", prefix);
  requireField(campaign, "affiliateUrl", prefix);
  requireField(campaign, "sourceUrl", prefix);
  requireField(campaign, "slug", prefix);
  requireField(campaign, "headline", prefix);
  requireField(campaign, "primaryCta", prefix);

  if (!VALID_STATUSES.includes(campaign.status)) {
    throw new Error(`${prefix} has invalid status: ${campaign.status}`);
  }

  if (campaign.disclosureRequired !== true) {
    throw new Error(`${prefix} must require affiliate disclosure.`);
  }
}

function validateCampaigns(campaigns) {
  campaigns.forEach(validateCampaign);
  return campaigns;
}

function main() {
  try {
    const campaigns = loadCampaigns();
    validateCampaigns(campaigns);
    logInfo(`PASS schema valid: ${campaigns.length}`);
  } catch (error) {
    logError("Schema validation failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  validateCampaigns
};