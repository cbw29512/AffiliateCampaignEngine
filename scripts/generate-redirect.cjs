const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { PAGES_DIR } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

function renderRedirectPage(campaigns) {
  const redirectMap = {};

  for (const campaign of campaigns) {
    redirectMap[campaign.id] = campaign.affiliateUrl;
  }

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Redirecting...</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
</head>
<body>
  <p>Redirecting...</p>

  <script>
    const links = ${JSON.stringify(redirectMap, null, 2)};
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("cid");

    if (!cid || !links[cid]) {
      document.body.innerHTML = "<p>Invalid or missing campaign link.</p>";
    } else {
      window.location.href = links[cid];
    }
  </script>
</body>
</html>`;
}

function main() {
  try {
    const campaigns = validateCampaigns(loadCampaigns());

    if (!fs.existsSync(PAGES_DIR)) {
      fs.mkdirSync(PAGES_DIR, { recursive: true });
    }

    const outputPath = path.join(PAGES_DIR, "redirect.html");
    fs.writeFileSync(outputPath, renderRedirectPage(campaigns), "utf8");

    logInfo(`Generated ${outputPath}`);
  } catch (error) {
    logError("Redirect generation failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  renderRedirectPage
};