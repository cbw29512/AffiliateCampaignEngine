function hasRequiredText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function hasValidUrl(value) {
  return /^https?:\/\//i.test(String(value || "").trim());
}

function isAmazonCampaign(campaign) {
  const joined = [
    campaign.id,
    campaign.category,
    campaign.productName,
    campaign.sourceUrl,
    campaign.affiliateUrl
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return joined.includes("amazon") || joined.includes("amzn.to");
}

function hasVerifiedAmazonProductLink(campaign) {
  if (!isAmazonCampaign(campaign)) {
    return true;
  }

  if (!hasRequiredText(campaign.expectedAsin)) {
    return false;
  }

  if (!hasValidUrl(campaign.affiliateUrl)) {
    return false;
  }

  const url = String(campaign.affiliateUrl).toUpperCase();
  const asin = String(campaign.expectedAsin).toUpperCase();

  if (url.includes(asin)) {
    return true;
  }

  if (String(campaign.affiliateUrl).includes("amzn.to")) {
    return campaign.amazonLinkVerified === true;
  }

  return campaign.amazonLinkVerified === true;
}

function isPublicReady(campaign) {
  const allowedStatuses = new Set(["approved", "published", "testing", "winner"]);

  if (!allowedStatuses.has(campaign.status)) {
    return false;
  }

  if (!hasRequiredText(campaign.id)) {
    return false;
  }

  if (!hasRequiredText(campaign.slug)) {
    return false;
  }

  if (!hasRequiredText(campaign.headline)) {
    return false;
  }

  if (!hasRequiredText(campaign.productName)) {
    return false;
  }

  if (!hasValidUrl(campaign.affiliateUrl)) {
    return false;
  }

  if (!hasVerifiedAmazonProductLink(campaign)) {
    return false;
  }

  return true;
}

module.exports = {
  hasValidUrl,
  hasVerifiedAmazonProductLink,
  isAmazonCampaign,
  isPublicReady
};
