function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderAffiliatePage(campaign) {
  const disclosure =
    "Disclosure: This page may contain an affiliate or referral link. If you use the link, we may receive a benefit at no extra cost to you.";

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${escapeHtml(campaign.headline)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(campaign.headline)}">
  <link rel="stylesheet" href="../assets/style.css">
</head>
<body>
  <main class="page-shell">
    <section class="hero-card">
      <p class="disclosure"><strong>${escapeHtml(disclosure)}</strong></p>
      <p class="eyebrow">Affiliate Review</p>
      <h1>${escapeHtml(campaign.headline)}</h1>
      <p class="lead">
        ${escapeHtml(campaign.productName)} is being reviewed as part of an affiliate campaign.
        This page explains what to check before signing up, what the product appears to offer,
        and why terms should be verified directly on the official website.
      </p>
      <a class="cta" href="${escapeHtml(campaign.affiliateUrl)}" rel="sponsored nofollow">
        ${escapeHtml(campaign.primaryCta)}
      </a>
    </section>

    <section class="content-card">
      <h2>What to verify first</h2>
      <ul>
        <li>Confirm current pricing on the official product website.</li>
        <li>Confirm fees, limits, eligibility rules, and cancellation terms.</li>
        <li>Do not rely on this page as financial, legal, or credit advice.</li>
      </ul>
    </section>

    <section class="content-card">
      <h2>Plain-English takeaway</h2>
      <p>
        This page is designed to help visitors make a careful decision.
        Any personal results, credit impact, savings, or earnings claims must be verified
        before this page is approved for public promotion.
      </p>
    </section>

    <p class="source">
      Official source:
      <a href="${escapeHtml(campaign.sourceUrl)}" rel="nofollow">
        ${escapeHtml(campaign.sourceUrl)}
      </a>
    </p>
  </main>
</body>
</html>`;
}

module.exports = {
  escapeHtml,
  renderAffiliatePage
};