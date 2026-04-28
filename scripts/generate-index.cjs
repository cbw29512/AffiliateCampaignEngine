const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { PAGES_DIR } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderCampaignCard(campaign) {
  return `
    <section class="content-card">
      <p class="eyebrow">${escapeHtml(campaign.category)}</p>
      <h2>${escapeHtml(campaign.productName)}</h2>
      <p>${escapeHtml(campaign.headline)}</p>
      <p>Status: <strong>${escapeHtml(campaign.status)}</strong></p>
      <a class="cta" href="${escapeHtml(campaign.slug)}.html">Open Campaign Page</a>
    </section>`;
}

function renderIndexPage(campaigns) {
  const cards = campaigns.map(renderCampaignCard).join("");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Affiliate Campaign Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link rel="stylesheet" href="../assets/style.css">
</head>
<body>
  <main class="page-shell">
    <section class="hero-card">
      <p class="eyebrow">Campaign Dashboard</p>
      <h1>Affiliate Campaign Engine</h1>
      <p class="lead">
        Master index of generated affiliate campaign pages.
      </p>
    </section>

    ${cards}
  </main>
</body>
</html>`;
}

function main() {
  try {
    const campaigns = validateCampaigns(loadCampaigns());

    if (!fs.existsSync(PAGES_DIR)) {
      fs.mkdirSync(PAGES_DIR, { recursive: true });
    }

    const outputPath = path.join(PAGES_DIR, "index.html");
    fs.writeFileSync(outputPath, renderIndexPage(campaigns), "utf8");

    logInfo(`Generated ${outputPath}`);
  } catch (error) {
    logError("Index generation failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}