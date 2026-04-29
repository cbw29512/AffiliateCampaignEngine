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

const VALID_AFFILIATE_STATUSES = [
  "verified",
  "needs_dashboard_confirmation",
  "not_verified"
];

function requireField(campaign, field, prefix) {
  if (!campaign[field]) {
    throw new Error(`${prefix} missing ${field}.`);
  }
}

function validateAffiliateLinkFields(campaign, prefix) {
  requireField(campaign, "affiliateStatus", prefix);
  requireField(campaign, "affiliateNetwork", prefix);

  if (!VALID_AFFILIATE_STATUSES.includes(campaign.affiliateStatus)) {
    throw new Error(`${prefix} has invalid affiliateStatus: ${campaign.affiliateStatus}`);
  }

  if (campaign.affiliateNetwork === "amazon") {
    requireField(campaign, "baseProductUrl", prefix);
    requireField(campaign, "trackingTag", prefix);
    return;
  }

  if (campaign.affiliateStatus !== "not_verified") {
    requireField(campaign, "affiliateUrl", prefix);
  }
}

function validateImageFields(campaign, prefix) {
  if (campaign.status === "paused") {
    return;
  }

  requireField(campaign, "imageUrl", prefix);
  requireField(campaign, "imageAlt", prefix);
  requireField(campaign, "imageSource", prefix);
  requireField(campaign, "imageVerifiedAt", prefix);

  if (campaign.imageLicenseStatus !== "verified") {
    throw new Error(`${prefix} imageLicenseStatus must be verified.`);
  }
}

function validateCampaign(campaign, index) {
  const prefix = `Campaign ${index + 1}`;

  requireField(campaign, "id", prefix);
  requireField(campaign, "status", prefix);
  requireField(campaign, "category", prefix);
  requireField(campaign, "productName", prefix);
  requireField(campaign, "sourceUrl", prefix);
  requireField(campaign, "slug", prefix);
  requireField(campaign, "headline", prefix);
  requireField(campaign, "primaryCta", prefix);

  if (!VALID_STATUSES.includes(campaign.status)) {
    throw new Error(`${prefix} has invalid status: ${campaign.status}`);
  }

  validateAffiliateLinkFields(campaign, prefix);
  validateImageFields(campaign, prefix);

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