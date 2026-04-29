const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { isPublicReady, hasValidUrl } = require("./affiliate-helpers.cjs");
const { PAGES_DIR } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

function requireText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing review field: ${label}`);
  }
}

function validateReview(review, index, campaign) {
  const rating = Number(review.rating);

  if (!Number.isFinite(rating) || rating < 4.5) {
    throw new Error(`${campaign.id} review ${index + 1} rating must be 4.5+`);
  }

  requireText(review.reviewerLabel, "reviewerLabel");
  requireText(review.helpedWith, "helpedWith");
  requireText(review.noNonsenseTake, "noNonsenseTake");
  requireText(review.sourceName, "sourceName");

  if (!hasValidUrl(review.sourceUrl)) {
    throw new Error(`${campaign.id} review ${index + 1} sourceUrl is invalid`);
  }
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function qaReviewCards() {
  const campaigns = validateCampaigns(loadCampaigns());

  for (const campaign of campaigns.filter(isPublicReady)) {
    const reviews = Array.isArray(campaign.reviewHighlights)
      ? campaign.reviewHighlights
      : [];

    if (reviews.length < 3) {
      throw new Error(`${campaign.id} must have at least 3 review highlights`);
    }

    reviews.forEach((review, index) => validateReview(review, index, campaign));

    const pagePath = path.join(PAGES_DIR, `${campaign.slug}.html`);

    if (!fs.existsSync(pagePath)) {
      throw new Error(`Missing public page: ${pagePath}`);
    }

    const html = fs.readFileSync(pagePath, "utf8");

    if (!html.includes("No-nonsense review evidence")) {
      throw new Error(`${campaign.id} page missing review evidence heading`);
    }

    if (countMatches(html, /review-evidence-card/g) < 3) {
      throw new Error(`${campaign.id} page must render at least 3 review cards`);
    }

    for (const review of reviews) {
      if (!html.includes(review.sourceUrl)) {
        throw new Error(`${campaign.id} page missing review source URL`);
      }
    }
  }

  logInfo("PASS review evidence cards QA");
}

function main() {
  try {
    qaReviewCards();
  } catch (error) {
    logError("Review card QA failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
