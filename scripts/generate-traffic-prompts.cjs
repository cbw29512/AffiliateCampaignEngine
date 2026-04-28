const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { ROOT } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const OUTPUT_DIR = path.join(ROOT, "content", "shorts-prompts");

function makePrompt(campaign) {
  return `Campaign: ${campaign.productName}
Landing Page: pages/${campaign.slug}.html
Category: ${campaign.category}

Create a 20-35 second short-form video.

Rules:
- Start with a direct problem hook.
- Use simple language.
- Do not make fake guarantees.
- Do not claim personal results unless manually verified.
- Push viewer to check the linked page, not to blindly buy.
- End with a curiosity-based CTA.

Hook:
${campaign.problem}

Offer angle:
${campaign.headline}

CTA:
Check the link for the full breakdown.`;
}

function main() {
  try {
    const campaigns = validateCampaigns(loadCampaigns());

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (const campaign of campaigns) {
      const outputPath = path.join(OUTPUT_DIR, `${campaign.id}.txt`);
      fs.writeFileSync(outputPath, makePrompt(campaign), "utf8");
      logInfo(`Generated ${outputPath}`);
    }

    logInfo(`PASS traffic prompts generated: ${campaigns.length}`);
  } catch (error) {
    logError("Traffic prompt generation failed", error);
    process.exit(1);
  }
}

main();