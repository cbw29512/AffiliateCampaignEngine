const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { isPublicReady } = require("./affiliate-helpers.cjs");
const { PAGES_DIR } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

function assertValidUrl(campaign) {
  const url = String(campaign.affiliateUrl || "").trim();

  if (!url) {
    throw new Error(`Missing affiliateUrl for public campaign ${campaign.id}`);
  }

  if (!/^https?:\/\//i.test(url)) {
    throw new Error(`Invalid affiliateUrl for ${campaign.id}: ${url}`);
  }

  return url;
}

function buildRedirectMap(campaigns) {
  const map = {};

  for (const campaign of campaigns) {
    if (!isPublicReady(campaign)) {
      continue;
    }

    map[campaign.id] = assertValidUrl(campaign);
  }

  return map;
}

function renderRedirectPage(redirects) {
  const json = JSON.stringify(redirects, null, 2).replace(/</g, "\\u003c");

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Affiliate Redirect</title>
  <meta name="robots" content="noindex,nofollow">
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <main>
    <h1>Opening recommendation...</h1>
    <p>If you are not redirected, the campaign link may be unavailable.</p>
    <p><a class="cta" id="fallback-link" href="/">Return to campaign pages</a></p>
  </main>

  <script>
    const REDIRECTS = ${json};

    function showError(message) {
      const main = document.querySelector("main");
      main.innerHTML = [
        "<h1>Link unavailable</h1>",
        "<p>" + message + "</p>",
        '<p><a class="cta" href="/">Return to campaign pages</a></p>'
      ].join("");
    }

    const params = new URLSearchParams(window.location.search);
    const cid = params.get("cid");
    const target = REDIRECTS[cid];

    if (!cid) {
      showError("No campaign id was provided.");
    } else if (!target) {
      showError("This campaign is not public-ready or has no verified link.");
    } else {
      const fallback = document.getElementById("fallback-link");
      fallback.href = target;
      fallback.textContent = "Continue to recommendation";
      window.location.replace(target);
    }
  </script>
</body>
</html>`;
}

function generateRedirect() {
  const campaigns = validateCampaigns(loadCampaigns());
  const redirects = buildRedirectMap(campaigns);
  const outPath = path.join(PAGES_DIR, "redirect.html");

  fs.mkdirSync(PAGES_DIR, { recursive: true });
  fs.writeFileSync(outPath, renderRedirectPage(redirects), "utf8");

  logInfo(`Generated ${outPath}`);
  logInfo(`PASS redirect map generated for ${Object.keys(redirects).length} public campaigns`);
}

function main() {
  try {
    generateRedirect();
  } catch (error) {
    logError("Redirect generation failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
