const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { isPublicReady } = require("./affiliate-helpers.cjs");
const { ROOT } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const OUT_DIR = path.join(ROOT, "content", "publish-ready");

function requireFile(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${filePath}`);
  }
}

function requireMissing(filePath) {
  if (fs.existsSync(filePath)) {
    throw new Error(`Draft campaign leaked into publish-ready pack: ${filePath}`);
  }
}

function requireIncludes(filePath, text) {
  const content = fs.readFileSync(filePath, "utf8");

  if (!content.includes(text)) {
    throw new Error(`Missing "${text}" inside ${filePath}`);
  }
}

function qaPublishReadyPacks() {
  const campaigns = validateCampaigns(loadCampaigns());

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const campaign of campaigns) {
    const packPath = path.join(OUT_DIR, `${campaign.id}.md`);

    if (isPublicReady(campaign)) {
      requireFile(packPath);
      requireIncludes(packPath, "Status: PUBLIC-READY");
      requireIncludes(packPath, `${campaign.slug}.html`);
      requireIncludes(packPath, `redirect.html?cid=${campaign.id}`);
      requireIncludes(packPath, "Referral link / possible compensation");
      requireIncludes(packPath, "Results vary");

      const content = fs.readFileSync(packPath, "utf8");

      if (content.includes("DO NOT PUBLISH YET")) {
        throw new Error(`Public pack still has draft guard: ${packPath}`);
      }
    } else {
      requireMissing(packPath);
    }
  }

  logInfo("PASS publish-ready pack QA");
}

function main() {
  try {
    qaPublishReadyPacks();
  } catch (error) {
    logError("Publish-ready pack QA failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
