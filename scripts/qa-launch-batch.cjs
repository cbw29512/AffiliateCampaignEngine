const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { isPublicReady } = require("./affiliate-helpers.cjs");
const { ROOT } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const OUT_DIR = path.join(ROOT, "content", "launch-batches");

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required launch batch: ${filePath}`);
  }
}

function requireMissing(filePath) {
  if (fs.existsSync(filePath)) {
    throw new Error(`Draft campaign leaked into launch batches: ${filePath}`);
  }
}

function requireIncludes(filePath, text) {
  const content = fs.readFileSync(filePath, "utf8");

  if (!content.includes(text)) {
    throw new Error(`Missing "${text}" inside ${filePath}`);
  }
}

function qaLaunchBatches() {
  const campaigns = validateCampaigns(loadCampaigns());

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const campaign of campaigns) {
    const batchPath = path.join(OUT_DIR, `${campaign.id}-launch-001.md`);

    if (isPublicReady(campaign)) {
      requireFile(batchPath);
      requireIncludes(batchPath, "Status: PUBLISHABLE");
      requireIncludes(batchPath, `${campaign.slug}.html`);
      requireIncludes(batchPath, "Referral link / possible compensation");
      requireIncludes(batchPath, "Results vary");
      requireIncludes(batchPath, "Posting Checklist");
      requireIncludes(batchPath, "Do Not Say");
    } else {
      requireMissing(batchPath);
    }
  }

  logInfo("PASS launch batch QA");
}

function main() {
  try {
    qaLaunchBatches();
  } catch (error) {
    logError("Launch batch QA failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
