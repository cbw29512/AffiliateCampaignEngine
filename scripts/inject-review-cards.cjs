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

function renderStars(rating) {
  return `${Number(rating).toFixed(1)} / 5.0`;
}

function renderReviews(campaign) {
  const reviews = Array.isArray(campaign.reviewHighlights)
    ? campaign.reviewHighlights
    : [];

  if (reviews.length === 0) {
    return "";
  }

  const cards = reviews
    .map((review) => {
      return `<article class="review-evidence-card">
  <div class="review-rating">${escapeHtml(renderStars(review.rating))}</div>
  <h3>${escapeHtml(review.reviewerLabel)}</h3>
  <p><strong>How it helped:</strong> ${escapeHtml(review.helpedWith)}</p>
  <p><strong>No-nonsense take:</strong> ${escapeHtml(review.noNonsenseTake)}</p>
  <p class="review-source">
    Source: <a href="${escapeHtml(review.sourceUrl)}" rel="nofollow noopener" target="_blank">${escapeHtml(review.sourceName)}</a>
  </p>
</article>`;
    })
    .join("\n");

  return `${START}
<section class="review-evidence-section" aria-labelledby="review-evidence-heading">
  <p class="eyebrow">No-nonsense review evidence</p>
  <h2 id="review-evidence-heading">How real reviewers say this helped</h2>
  <p>These are public review summaries. They are not guarantees, and individual results can vary.</p>
  <div class="review-evidence-grid">
${cards}
  </div>
</section>
${END}`;
}

function stripExistingReviewSection(html) {
  const pattern = new RegExp(`${START}[\\s\\S]*?${END}`, "g");
  return html.replace(pattern, "");
}

function injectIntoHtml(html, section) {
  const clean = stripExistingReviewSection(html);

  if (!section) {
    return clean;
  }

  if (clean.includes("</main>")) {
    return clean.replace("</main>", `${section}\n</main>`);
  }

  if (clean.includes("</body>")) {
    return clean.replace("</body>", `${section}\n</body>`);
  }

  throw new Error("Could not find </main> or </body> injection point.");
}

function injectReviewCards() {
  const campaigns = validateCampaigns(loadCampaigns());

  for (const campaign of campaigns.filter(isPublicReady)) {
    const pagePath = path.join(PAGES_DIR, `${campaign.slug}.html`);

    if (!fs.existsSync(pagePath)) {
      throw new Error(`Missing public page for review injection: ${pagePath}`);
    }

    const html = fs.readFileSync(pagePath, "utf8");
    const section = renderReviews(campaign);
    const nextHtml = injectIntoHtml(html, section);

    fs.writeFileSync(pagePath, nextHtml, "utf8");
    logInfo(`Injected review evidence cards into ${campaign.slug}.html`);
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
