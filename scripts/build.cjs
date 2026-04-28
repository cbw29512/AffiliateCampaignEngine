const { execFileSync } = require("child_process");
const path = require("path");

const ROOT = "C:/Users/divcl/OneDrive/Desktop/AffiliateCampaignEngine";

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

console.log("=== BUILD START ===");

run("validate-schema.cjs");
run("generate-page.cjs");
run("generate-redirect.cjs");
run("generate-index.cjs");
run("generate-traffic-prompts.cjs");

console.log("=== BUILD COMPLETE ===");