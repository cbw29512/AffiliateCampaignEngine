function hasAmazonTag(url) {
  return url.includes("tag=");
}

function addAmazonTag(baseProductUrl, trackingTag) {
  if (!baseProductUrl) {
    throw new Error("Missing Amazon baseProductUrl.");
  }

  if (!trackingTag) {
    throw new Error("Missing Amazon trackingTag.");
  }

  if (hasAmazonTag(baseProductUrl)) {
    return baseProductUrl;
  }

  const joiner = baseProductUrl.includes("?") ? "&" : "?";
  return `${baseProductUrl}${joiner}tag=${encodeURIComponent(trackingTag)}`;
}

function resolveAffiliateUrl(campaign) {
  if (campaign.affiliateStatus !== "verified" && campaign.affiliateStatus !== "needs_dashboard_confirmation") {
    return "";
  }

  if (campaign.affiliateNetwork === "amazon") {
    return addAmazonTag(campaign.baseProductUrl, campaign.trackingTag);
  }

  return campaign.affiliateUrl;
}

module.exports = {
  addAmazonTag,
  resolveAffiliateUrl
};