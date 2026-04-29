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

const OUT_DIR = path.join(ROOT, "content", "launch-batches");

function cleanOutDir() {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
  fs.mkdirSync(OUT_DIR, { recursive: true });
}

function pageUrl(campaign) {
  return `${BASE_URL}/${campaign.slug}.html`;
}

function firstReview(campaign) {
  const reviews = Array.isArray(campaign.reviewHighlights)
    ? campaign.reviewHighlights
    : [];

  return reviews[0] || null;
}

function renderBatch(campaign) {
  const review = firstReview(campaign);
  const reviewLine = review
    ? `One public reviewer reported: ${review.helpedWith}`
    : "Public review evidence is summarized on the landing page.";

  return `# Launch Batch 001: ${campaign.productName}

Status: PUBLISHABLE
Campaign ID: ${campaign.id}

Live page:
${pageUrl(campaign)}

## YouTube Shorts Title

Kikoff Review: Read This Before You Sign Up

## Hook Line

You should not click a credit app just because it sounds easy.

## Short Video Script

You should not sign up for Kikoff blindly.

It is marketed as a simple way to help build credit, and some public reviewers say it helped them.

${reviewLine}

But that does not mean everyone gets the same result.

Credit depends on your full credit profile, payment history, utilization, and other factors.

I made a no-nonsense page that explains what Kikoff is, who it may help, what real reviewers said, and what to watch out for.

Referral link / possible compensation. Results vary.

Read the breakdown before you decide.

## TikTok / Reel Caption

I made a no-nonsense Kikoff review page: what it is, who it may help, what public reviewers said, and what to watch out for before signing up.

${pageUrl(campaign)}

Referral link / possible compensation. Results vary.

## Pinned Comment

Read the full no-nonsense breakdown here:
${pageUrl(campaign)}

Referral link / possible compensation. Results vary. This is not financial advice.

## Posting Checklist

- Link points to the Kikoff landing page, not directly to the referral link
- Caption includes referral/compensation disclosure
- Caption says results vary
- No guaranteed credit-score claims
- No "best app" claim
- No fake personal result
- No Amazon or Home Depot content included

## Do Not Say

- Guaranteed credit improvement
- Everyone will improve
- Best credit app
- Instant credit fix
- No risk
- Proven for everyone
- This will raise your score
`;
}

function generateLaunchBatches() {
  const campaigns = validateCampaigns(loadCampaigns());
  const publicCampaigns = campaigns.filter(isPublicReady);

  cleanOutDir();

  for (const campaign of publicCampaigns) {
    const outPath = path.join(OUT_DIR, `${campaign.id}-launch-001.md`);
    fs.writeFileSync(outPath, renderBatch(campaign), "utf8");
    logInfo(`Generated launch batch for ${campaign.id}`);
  }

  logInfo(`PASS launch batches generated: ${publicCampaigns.length}`);
}

function main() {
  try {
    generateLaunchBatches();
  } catch (error) {
    logError("Launch batch generation failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
