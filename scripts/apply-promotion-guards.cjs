const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { isPublicReady } = require("./affiliate-helpers.cjs");
const { ROOT } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const START = "<!-- PROMOTION_GUARD_START -->";
const END = "<!-- PROMOTION_GUARD_END -->";

function buildGuard(campaign) {
  return [
    START,
    "",
    "# DO NOT PUBLISH YET",
    "",
    `Campaign: ${campaign.id}`,
    "",
    "This campaign is not public-ready.",
    "Do not post this social content publicly yet.",
    "Do not send traffic to this campaign yet.",
    "",
    "Required before promotion:",
    "- Public landing page generated",
    "- Technical QA passed",
    "- Design QA passed",
    "- Affiliate/referral disclosure verified",
    "- Outbound redirect verified",
    "",
    END,
    ""
  ].join("\n");
}

function stripExistingGuard(content) {
  const pattern = new RegExp(`${START}[\\s\\S]*?${END}\\n*`, "g");
  return content.replace(pattern, "");
}

function writeGuardedFile(filePath, campaign) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const original = fs.readFileSync(filePath, "utf8");
  const clean = stripExistingGuard(original).trimStart();
  const guarded = `${buildGuard(campaign)}\n${clean}`;

  fs.writeFileSync(filePath, guarded, "utf8");
  return true;
}

function writeCleanFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return false;
  }

  const original = fs.readFileSync(filePath, "utf8");
  const clean = stripExistingGuard(original);

  fs.writeFileSync(filePath, clean, "utf8");
  return true;
}

function applyPromotionGuards() {
  const campaigns = validateCampaigns(loadCampaigns());

  for (const campaign of campaigns) {
    const promptPath = path.join(
      ROOT,
      "content",
      "shorts-prompts",
      `${campaign.id}.txt`
    );

    const socialPath = path.join(
      ROOT,
      "content",
      "social-posts",
      `${campaign.id}.md`
    );

    if (isPublicReady(campaign)) {
      writeCleanFile(promptPath);
      writeCleanFile(socialPath);
      logInfo(`Promotion guard cleared for public-ready campaign ${campaign.id}`);
    } else {
      writeGuardedFile(promptPath, campaign);
      writeGuardedFile(socialPath, campaign);
      logInfo(`Promotion guard applied to draft campaign ${campaign.id}`);
    }
  }
}

function main() {
  try {
    applyPromotionGuards();
  } catch (error) {
    logError("Promotion guard failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
