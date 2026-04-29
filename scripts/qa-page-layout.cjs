const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { isPublicReady } = require("./affiliate-helpers.cjs");
const { PAGES_DIR } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function htmlContainsUrl(html, url) {
  const raw = String(url || "");
  const escaped = escapeHtml(raw);

  return html.includes(raw) || html.includes(escaped);
}

function countMatches(text, pattern) {
  return (text.match(pattern) || []).length;
}

function validateReviews(campaign) {
  const reviews = Array.isArray(campaign.reviewHighlights)
    ? campaign.reviewHighlights
    : [];

  if (reviews.length < 3) {
    throw new Error(`${campaign.id} needs at least 3 review highlights`);
  }

  for (const review of reviews) {
    if (Number(review.rating) < 4.5) {
      throw new Error(`${campaign.id} has review below 4.5 rating`);
    }

    if (!review.sourceUrl || !/^https?:\/\//i.test(review.sourceUrl)) {
      throw new Error(`${campaign.id} review missing sourceUrl`);
    }
  }
}

function qaPageLayout() {
  const campaigns = validateCampaigns(loadCampaigns());

  for (const campaign of campaigns.filter(isPublicReady)) {
    validateReviews(campaign);

    const pagePath = path.join(PAGES_DIR, `${campaign.slug}.html`);

    if (!fs.existsSync(pagePath)) {
      throw new Error(`Missing public page: ${pagePath}`);
    }

    const html = fs.readFileSync(pagePath, "utf8");
    const reviewIndex = html.indexOf("REVIEW_EVIDENCE_START");
    const disclosureIndex = html.indexOf("BOTTOM_DISCLOSURE_START");
    const firstCtaIndex = html.indexOf(`redirect.html?cid=${campaign.id}`);
    const lastCtaIndex = html.lastIndexOf(`redirect.html?cid=${campaign.id}`);

    if (reviewIndex < 0) {
      throw new Error(`${campaign.id} missing review section`);
    }

    if (disclosureIndex < 0) {
      throw new Error(`${campaign.id} missing bottom disclosure`);
    }

    if (firstCtaIndex < 0) {
      throw new Error(`${campaign.id} missing CTA`);
    }

    if (reviewIndex > firstCtaIndex) {
      throw new Error(`${campaign.id} review section must appear before CTA`);
    }

    if (disclosureIndex < lastCtaIndex) {
      throw new Error(`${campaign.id} disclosure must appear after CTA`);
    }

    if (countMatches(html, /review-evidence-card/g) < 3) {
      throw new Error(`${campaign.id} must render at least 3 review cards`);
    }

    for (const review of campaign.reviewHighlights) {
      if (!htmlContainsUrl(html, review.sourceUrl)) {
        throw new Error(`${campaign.id} missing review source URL`);
      }
    }
  }

  logInfo("PASS page layout QA: reviews near top, disclosure at bottom");
}

function main() {
  try {
    qaPageLayout();
  } catch (error) {
    logError("Page layout QA failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

