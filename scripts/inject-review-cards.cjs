const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { isPublicReady } = require("./affiliate-helpers.cjs");
const { PAGES_DIR } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const START = "<!-- REVIEW_EVIDENCE_START -->";
const END = "<!-- REVIEW_EVIDENCE_END -->";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripExisting(html) {
  const pattern = new RegExp(`${START}[\\s\\S]*?${END}\\n*`, "g");
  return html.replace(pattern, "");
}

function renderReviewSection(campaign) {
  const reviews = Array.isArray(campaign.reviewHighlights)
    ? campaign.reviewHighlights
    : [];

  if (reviews.length === 0) {
    return "";
  }

  const cards = reviews.map((review) => {
    return `<article class="review-evidence-card">
  <div class="review-rating">${Number(review.rating).toFixed(1)} / 5.0</div>
  <h3>${escapeHtml(review.reviewerLabel)}</h3>
  <p><strong>How it helped:</strong> ${escapeHtml(review.helpedWith)}</p>
  <p><strong>No-nonsense take:</strong> ${escapeHtml(review.noNonsenseTake)}</p>
  <p class="review-source">Source: <a href="${escapeHtml(review.sourceUrl)}" rel="nofollow noopener" target="_blank">${escapeHtml(review.sourceName)}</a></p>
</article>`;
  }).join("\n");

  return `${START}
<section class="review-evidence-section" aria-labelledby="review-evidence-heading">
  <p class="eyebrow">No-nonsense review evidence</p>
  <h2 id="review-evidence-heading">How real reviewers say this helped</h2>
  <p>These are public review summaries. They are not guarantees. Individual credit results vary.</p>
  <div class="review-evidence-grid">
${cards}
  </div>
</section>
${END}
`;
}

function insertNearTop(html, section) {
  if (!section) {
    return html;
  }

  const clean = stripExisting(html);
  const headerIndex = clean.indexOf("</header>");

  if (headerIndex >= 0) {
    const insertAt = headerIndex + "</header>".length;
    return clean.slice(0, insertAt) + "\n" + section + clean.slice(insertAt);
  }

  const h1Index = clean.indexOf("</h1>");

  if (h1Index >= 0) {
    const insertAt = h1Index + "</h1>".length;
    return clean.slice(0, insertAt) + "\n" + section + clean.slice(insertAt);
  }

  throw new Error("Could not find header or h1 for top review injection.");
}

function injectReviewCards() {
  const campaigns = validateCampaigns(loadCampaigns());

  for (const campaign of campaigns.filter(isPublicReady)) {
    const pagePath = path.join(PAGES_DIR, `${campaign.slug}.html`);

    if (!fs.existsSync(pagePath)) {
      throw new Error(`Missing public page: ${pagePath}`);
    }

    const html = fs.readFileSync(pagePath, "utf8");
    const section = renderReviewSection(campaign);
    fs.writeFileSync(pagePath, insertNearTop(html, section), "utf8");

    logInfo(`Injected top review evidence into ${campaign.slug}.html`);
  }
}

function main() {
  try {
    injectReviewCards();
  } catch (error) {
    logError("Review card injection failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
