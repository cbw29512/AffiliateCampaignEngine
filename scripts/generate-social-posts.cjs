const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { ROOT } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const OUTPUT_DIR = path.join(ROOT, "content", "social-posts");
const SITE_BASE = "https://cbw29512.github.io/AffiliateCampaignEngine";

function campaignUrl(campaign) {
  return `${SITE_BASE}/${campaign.slug}.html`;
}

function renderSocialPack(campaign) {
  const url = campaignUrl(campaign);

  return `# ${campaign.productName} Social Traffic Pack

## Campaign URL
${url}

---

## Pinterest Pin 1

Title:
${campaign.headline}

Description:
${campaign.problem} Here is a simple plain-English breakdown of what to check before using ${campaign.productName}. ${url}

---

## Pinterest Pin 2

Title:
Before You Try ${campaign.productName}, Check This

Description:
A simple guide covering who ${campaign.productName} might help, what to verify first, and what to be careful about. ${url}

---

## Pinterest Pin 3

Title:
Is ${campaign.productName} Worth Looking Into?

Description:
This plain-English page breaks down the possible benefits, cautions, and verification steps before you click. ${url}

---

## Facebook / Instagram Caption

${campaign.problem}

I made a simple breakdown of ${campaign.productName}, including:
- who it might help
- what to verify first
- cautions to watch for

No hype, just a plain-English review.

${url}

---

## X / Twitter Post

${campaign.problem}

I made a quick breakdown of ${campaign.productName}: who it may help, what to verify, and what to watch out for.

${url}

---

## Short Helpful Comment

If you are comparing options, I made a plain-English breakdown here:
${url}

Note: always verify current terms directly on the official site before signing up.
`;
}

function main() {
  try {
    const campaigns = validateCampaigns(loadCampaigns());

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (const campaign of campaigns) {
      const outputPath = path.join(OUTPUT_DIR, `${campaign.id}.md`);
      fs.writeFileSync(outputPath, renderSocialPack(campaign), "utf8");
      logInfo(`Generated ${outputPath}`);
    }

    logInfo(`PASS social posts generated: ${campaigns.length}`);
  } catch (error) {
    logError("Social post generation failed", error);
    process.exit(1);
  }
}

main();