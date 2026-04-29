const { execFileSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const ROOT = "C:/Users/divcl/OneDrive/Desktop/AffiliateCampaignEngine";
const DOCS = path.join(ROOT, "docs");
const ASSETS_SRC = path.join(ROOT, "assets");
const ASSETS_DEST = path.join(DOCS, "assets");

function run(script) {
  try {
    execFileSync("node", [path.join(ROOT, "scripts", script)], {
      stdio: "inherit"
    });
  } catch (err) {
    console.error(`[BUILD FAILED] ${script}`);
    process.exit(1);
  }
}

function copyAssets() {
  fs.mkdirSync(ASSETS_DEST, { recursive: true });

  for (const file of fs.readdirSync(ASSETS_SRC)) {
    fs.copyFileSync(path.join(ASSETS_SRC, file), path.join(ASSETS_DEST, file));
  }

  console.log("[INFO] Assets copied to docs/");
}

function removePublicIndex() {
  const indexPath = path.join(DOCS, "index.html");

  if (fs.existsSync(indexPath)) {
    fs.unlinkSync(indexPath);
    console.log("[INFO] Removed public campaign index");
  }
}

console.log("=== BUILD START ===");

run("validate-schema.cjs");
run("generate-page.cjs");
run("inject-review-cards.cjs");
run("enforce-bottom-disclosure.cjs");
run("qa-review-cards.cjs");
run("qa-page-layout.cjs");
run("generate-redirect.cjs");
run("generate-traffic-prompts.cjs");
run("generate-social-posts.cjs");
run("apply-promotion-guards.cjs");

copyAssets();
removePublicIndex();

run("qa.cjs");

console.log("=== BUILD COMPLETE (QA PASSED) ===");

