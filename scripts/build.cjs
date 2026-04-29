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
  if (!fs.existsSync(ASSETS_DEST)) {
    fs.mkdirSync(ASSETS_DEST, { recursive: true });
  }

  const files = fs.readdirSync(ASSETS_SRC);

  for (const file of files) {
    fs.copyFileSync(
      path.join(ASSETS_SRC, file),
      path.join(ASSETS_DEST, file)
    );
  }

  console.log("[INFO] Assets copied to docs/");
}

console.log("=== BUILD START ===");

run("validate-schema.cjs");
run("generate-page.cjs");
run("generate-redirect.cjs");
run("generate-index.cjs");
run("generate-traffic-prompts.cjs");

copyAssets();

run("qa.cjs");

console.log("=== BUILD COMPLETE (QA PASSED) ===");