const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { isPublicReady } = require("./affiliate-helpers.cjs");
const { ROOT, PAGES_DIR } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }
}

function requireMissing(filePath) {
  if (fs.existsSync(filePath)) {
    throw new Error(`File should not be public: ${filePath}`);
  }
}

function read(filePath) {
  return fs.readFileSync(filePath, "utf8");
}

function requireIncludes(filePath, text) {
  if (!read(filePath).includes(text)) {
    throw new Error(`Missing "${text}" inside ${filePath}`);
  }
}

function qaAmazonProductSpecificLink(campaign) {
  const isAmazon = [
    campaign.id,
    campaign.productName,
    campaign.sourceUrl,
    campaign.affiliateUrl
  ].filter(Boolean).join(" ").toLowerCase().includes("amazon") ||
    String(campaign.affiliateUrl || "").includes("amzn.to");

  if (!isAmazon) {
    return;
  }

  if (!campaign.expectedAsin) {
    throw new Error(`Missing expectedAsin for Amazon campaign ${campaign.id}`);
  }

  const affiliateUrl = String(campaign.affiliateUrl || "");
  const asin = String(campaign.expectedAsin || "").toUpperCase();

  if (affiliateUrl.toUpperCase().includes(asin)) {
    return;
  }

  if (affiliateUrl.includes("amzn.to") && campaign.amazonLinkVerified === true) {
    return;
  }

  throw new Error(
    `Amazon campaign ${campaign.id} must link to expected ASIN ${campaign.expectedAsin} or be manually verified`
  );
}

function requireValidUrl(campaign) {
  const url = String(campaign.affiliateUrl || "").trim();

  if (!url) {
    throw new Error(`Missing affiliateUrl for public campaign ${campaign.id}`);
  }

  if (!/^https?:\/\//i.test(url)) {
    throw new Error(`Invalid affiliateUrl for ${campaign.id}: ${url}`);
  }
}

function qaDraftTrafficAsset(campaign) {
  const promptPath = path.join(ROOT, "content", "shorts-prompts", `${campaign.id}.txt`);
  const socialPath = path.join(ROOT, "content", "social-posts", `${campaign.id}.md`);

  requireFile(promptPath);
  requireFile(socialPath);
  requireIncludes(promptPath, campaign.productName);
  requireIncludes(socialPath, campaign.productName);
}

function qaPublicLandingPage(campaign) {
  const pagePath = path.join(PAGES_DIR, `${campaign.slug}.html`);

  requireValidUrl(campaign);
  qaAmazonProductSpecificLink(campaign);
  requireFile(pagePath);
  requireIncludes(pagePath, campaign.headline);
  requireIncludes(pagePath, `redirect.html?cid=${campaign.id}`);
  requireIncludes(pagePath, "Disclosure:");
}

function qaRedirect(campaigns) {
  const redirectPath = path.join(PAGES_DIR, "redirect.html");

  requireFile(redirectPath);

  for (const campaign of campaigns.filter(isPublicReady)) {
    requireIncludes(redirectPath, `"${campaign.id}"`);
    requireIncludes(redirectPath, campaign.affiliateUrl);
  }
}

function qaNonPublicCampaign(campaign) {
  const pagePath = path.join(PAGES_DIR, `${campaign.slug}.html`);

  requireMissing(pagePath);
  logInfo(`SKIP public page QA for ${campaign.id} because it is not public-ready`);
}

function runQa() {
  const campaigns = validateCampaigns(loadCampaigns());
  const publicCampaigns = campaigns.filter(isPublicReady);

  requireMissing(path.join(PAGES_DIR, "index.html"));
  requireFile(path.join(PAGES_DIR, "assets", "style.css"));
  qaRedirect(campaigns);

  for (const campaign of campaigns) {
    qaDraftTrafficAsset(campaign);

    if (isPublicReady(campaign)) {
      qaPublicLandingPage(campaign);
    } else {
      qaNonPublicCampaign(campaign);
    }
  }

  logInfo(
    `PASS QA checked ${publicCampaigns.length} public campaign pages, redirects, and ${campaigns.length} draft campaign assets`
  );
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

