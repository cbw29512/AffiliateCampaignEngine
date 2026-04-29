function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function renderList(items) {
  return items.map(item => `<li>${escapeHtml(item)}</li>`).join("");
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
  <link rel="stylesheet" href="/AffiliateCampaignEngine/assets/style.css">
</head>
<body>
  <main class="page-shell">
    <section class="hero-card">
      <p class="eyebrow">Affiliate Review</p>
      <h1>${escapeHtml(campaign.headline)}</h1>
      <p class="lead">${escapeHtml(campaign.subheadline || "")}</p>

      <a class="cta" href="redirect.html?cid=${escapeHtml(campaign.id)}" rel="sponsored nofollow">
        ${escapeHtml(campaign.primaryCta)}
      </a>
    </section>

    <section class="content-card">
      <h2>The Problem</h2>
      <p>${escapeHtml(campaign.problem || "")}</p>
    </section>

    <section class="content-card">
      <h2>Who This Might Help</h2>
      <ul>${renderList(campaign.whoItHelps || [])}</ul>
    </section>

    <section class="content-card">
      <h2>Why Someone Might Consider This</h2>
      <ul>${renderList(campaign.whyConsiderIt || [])}</ul>
    </section>

    <section class="content-card">
      <h2>Things You Should Verify First</h2>
      <ul>${renderList(campaign.whatToVerify || [])}</ul>
    </section>

    <section class="content-card">
      <h2>Pros</h2>
      <ul>${renderList(campaign.pros || [])}</ul>
    </section>

    <section class="content-card">
      <h2>Cautions</h2>
      <ul>${renderList(campaign.cautions || [])}</ul>
    </section>

    <footer class="footer-disclosure">
      <p><strong>${escapeHtml(disclosure)}</strong></p>
      <p>
        Official source:
        <a href="${escapeHtml(campaign.sourceUrl)}" rel="nofollow">
          ${escapeHtml(campaign.sourceUrl)}
        </a>
      </p>
    </footer>
  </main>
</body>
</html>`;
}

module.exports = {
  escapeHtml,
  renderAffiliatePage
};