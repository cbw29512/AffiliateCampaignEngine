const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { isPublicReady } = require("./affiliate-helpers.cjs");
const { ROOT } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const BASE_URL =
  process.env.PUBLIC_BASE_URL ||
  "https://cbw29512.github.io/AffiliateCampaignEngine";

const OUT_DIR = path.join(ROOT, "content", "publish-ready");

function ensureCleanOutDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function pageUrl(campaign) {
  return `${BASE_URL}/${campaign.slug}.html`;
}

function redirectUrl(campaign) {
  return `${BASE_URL}/redirect.html?cid=${campaign.id}`;
}

function renderReviewBullets(campaign) {
  const reviews = Array.isArray(campaign.reviewHighlights)
    ? campaign.reviewHighlights.slice(0, 3)
    : [];

  if (reviews.length === 0) {
    return "- No source-backed review highlights available.";
  }

  return reviews
    .map((review) => {
      return [
        `- ${review.rating}/5 from ${review.reviewerLabel}`,
        `  - Helped with: ${review.helpedWith}`,
        `  - Source: ${review.sourceName} (${review.sourceUrl})`
      ].join("\n");
    })
    .join("\n");
}

function renderPack(campaign) {
  return `# Publish-Ready Traffic Pack: ${campaign.productName}

Status: PUBLIC-READY

## Safe Live Links

Landing page:
${pageUrl(campaign)}

Tracked redirect:
${redirectUrl(campaign)}

## Posting Rule

This campaign is safe to promote because the build verified:

- Public landing page exists
- Redirect map contains this campaign
- Disclosure exists at the bottom of the page
- Review evidence appears near the top
- Promotion guard is cleared

## Required Disclosure For Social Posts

Use a short disclosure in the post caption when recommending this product.

Suggested wording:
Referral link / possible compensation. Results vary.

## No-Nonsense Review Evidence

${renderReviewBullets(campaign)}

## Safe Caption Option 1

I put together a no-nonsense review of ${campaign.productName}: what it is, who it may help, what real public reviewers said, and what to watch out for.

${pageUrl(campaign)}

Referral link / possible compensation. Results vary.

## Safe Caption Option 2

If you are looking at ${campaign.productName}, do not just click blindly. I made a plain-English page with review evidence, cautions, and the referral disclosure at the bottom.

${pageUrl(campaign)}

Referral link / possible compensation. Results vary.

## Short Video Prompt

Create a short, direct video explaining:

- What ${campaign.productName} is
- Who it might help
- What public reviewers said
- Why results can vary
- Why viewers should read the full no-nonsense page before signing up

End with:
Read the no-nonsense breakdown before you decide.

## Do Not Say

- Guaranteed results
- Everyone will improve
- Best credit app
- Instant credit fix
- No risk
- Proven to work for everyone
`;
}

function generatePublishReadyPacks() {
  const campaigns = validateCampaigns(loadCampaigns());
  const publicCampaigns = campaigns.filter(isPublicReady);

  ensureCleanOutDir();

  for (const campaign of publicCampaigns) {
    const outPath = path.join(OUT_DIR, `${campaign.id}.md`);
    fs.writeFileSync(outPath, renderPack(campaign), "utf8");
    logInfo(`Generated publish-ready pack for ${campaign.id}`);
  }

  logInfo(`PASS publish-ready packs generated: ${publicCampaigns.length}`);
}

function main() {
  try {
    generatePublishReadyPacks();
  } catch (error) {
    logError("Publish-ready pack generation failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
