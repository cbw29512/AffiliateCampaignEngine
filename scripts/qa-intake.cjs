const fs = require("fs");
const path = require("path");
const { ROOT } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const INTAKE_PATH = path.join(ROOT, "data", "intake", "incoming-links.json");

function stripBom(text) {
  return String(text || "").replace(/^\uFEFF/, "");
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(stripBom(raw));
}

function requireText(value, label) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`Missing ${label}`);
  }
}

function requireUrl(value, label) {
  requireText(value, label);

  if (!/^https?:\/\//i.test(value)) {
    throw new Error(`${label} must start with http:// or https://`);
  }
}

function assertNullOrUrl(value, label) {
  if (value === null) {
    return;
  }

  requireUrl(value, label);
}

function qaIntake() {
  if (!fs.existsSync(INTAKE_PATH)) {
    throw new Error(`Missing intake file: ${INTAKE_PATH}`);
  }

  const intake = readJson(INTAKE_PATH);

  if (!Array.isArray(intake.links)) {
    throw new Error("incoming-links.json must contain links array.");
  }

  const seen = new Set();

  for (const item of intake.links) {
    requireText(item.id, "id");
    requireUrl(item.sourceUrl, "sourceUrl");
    requireText(item.status, "status");
    requireText(item.publishDecision, "publishDecision");

    if (seen.has(item.id)) {
      throw new Error(`Duplicate intake id: ${item.id}`);
    }

    seen.add(item.id);

    if (item.publishDecision !== "blocked_until_verified") {
      throw new Error(`${item.id} must remain blocked until verified.`);
    }

    if (!["research_needed", "affiliate_possible", "affiliate_link_needed", "review_evidence_needed", "draft_ready", "manual_review_required", "no_affiliate_program_found"].includes(item.status)) {
      throw new Error(`${item.id} has invalid status: ${item.status}`);
    }

    assertNullOrUrl(item.affiliateProgramUrl, "affiliateProgramUrl");
    assertNullOrUrl(item.affiliateUrl, "affiliateUrl");

    if (!Array.isArray(item.reviewHighlights)) {
      throw new Error(`${item.id} reviewHighlights must be an array.`);
    }

    if (!Array.isArray(item.researchSources)) {
      throw new Error(`${item.id} researchSources must be an array.`);
    }
  }

  logInfo(`PASS intake QA checked ${intake.links.length} incoming links`);
}

function main() {
  try {
    qaIntake();
  } catch (error) {
    logError("Intake QA failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
