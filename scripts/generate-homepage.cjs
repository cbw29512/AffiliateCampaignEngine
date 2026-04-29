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

function shortDescription(campaign) {
  return (
    campaign.summary ||
    campaign.description ||
    campaign.headline ||
    `A no-nonsense review of ${campaign.productName}.`
  );
}

function renderCard(campaign) {
  return `<article class="homepage-campaign-card">
  <p class="eyebrow">Public-ready review</p>
  <h2>${escapeHtml(campaign.productName)}</h2>
  <p>${escapeHtml(shortDescription(campaign))}</p>
  <a class="cta" href="${escapeHtml(campaign.slug)}.html">Read the no-nonsense review</a>
</article>`;
}

function renderHomepage(publicCampaigns) {
  const cards = publicCampaigns.map(renderCard).join("\n");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>No-Nonsense Product Reviews</title>
  <meta name="description" content="Plain-English product reviews with source-backed notes, visible disclosures, and no fake guarantees.">
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">Affiliate Campaign Engine</p>
      <h1>No-nonsense product reviews before you click</h1>
      <p>These pages are built to be clear, source-backed, and honest about referral or affiliate relationships.</p>
    </header>

    <section class="homepage-campaign-grid" aria-label="Public-ready reviews">
${cards}
    </section>

    <section class="bottom-disclosure-section" aria-labelledby="homepage-disclosure-heading">
      <h2 id="homepage-disclosure-heading">Disclosure</h2>
      <p>Some pages may contain referral or affiliate links. We may receive compensation if you click or sign up through those links. Individual results vary.</p>
    </section>
  </main>
</body>
</html>`;
}

function generateHomepage() {
  const campaigns = validateCampaigns(loadCampaigns());
  const publicCampaigns = campaigns.filter(isPublicReady);
  const outPath = path.join(PAGES_DIR, "index.html");

  fs.mkdirSync(PAGES_DIR, { recursive: true });
  fs.writeFileSync(outPath, renderHomepage(publicCampaigns), "utf8");

  logInfo(`Generated ${outPath}`);
  logInfo(`PASS homepage generated with ${publicCampaigns.length} public campaigns`);
}

function main() {
  try {
    generateHomepage();
  } catch (error) {
    logError("Homepage generation failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
