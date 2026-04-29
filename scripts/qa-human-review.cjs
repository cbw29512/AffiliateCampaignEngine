const fs = require("fs");
const path = require("path");
const { ROOT } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const INTAKE_PATH = path.join(ROOT, "data", "intake", "incoming-links.json");
const REVIEW_DIR = path.join(ROOT, "content", "human-review");
const DRAFT_DIR = path.join(ROOT, "content", "page-drafts");

function stripBom(text) {
  return String(text || "").replace(/^\uFEFF/, "");
}

function readJson(filePath) {
  return JSON.parse(stripBom(fs.readFileSync(filePath, "utf8")));
}

function requireIncludes(content, expected, filePath) {
  if (!content.includes(expected)) {
    throw new Error(`Missing "${expected}" in ${filePath}`);
  }
}

function requireExcludes(content, forbidden, filePath) {
  if (content.includes(forbidden)) {
    throw new Error(`Forbidden "${forbidden}" found in ${filePath}`);
  }
}

function qaHumanReview() {
  const intake = readJson(INTAKE_PATH);

  if (!Array.isArray(intake.links)) {
    throw new Error("incoming-links.json must contain links array.");
  }

  for (const item of intake.links) {
    const reviewPath = path.join(REVIEW_DIR, `${item.id}.md`);
    const draftPath = path.join(DRAFT_DIR, `${item.id}.md`);

    if (!fs.existsSync(reviewPath)) {
      throw new Error(`Missing human review file: ${reviewPath}`);
    }

    if (!fs.existsSync(draftPath)) {
      throw new Error(`Missing SEO draft file: ${draftPath}`);
    }

    const reviewContent = fs.readFileSync(reviewPath, "utf8");
    const draftContent = fs.readFileSync(draftPath, "utf8");

    requireIncludes(reviewContent, `Human Review: ${item.id}`, reviewPath);
    requireIncludes(reviewContent, "Review status: needs_human_review", reviewPath);
    requireIncludes(reviewContent, "Approved for publishing: false", reviewPath);
    requireIncludes(reviewContent, "Generated Suggestions", reviewPath);
    requireIncludes(reviewContent, "Reference Rules Applied", reviewPath);
    requireIncludes(reviewContent, "Do not publish this campaign", reviewPath);
    requireExcludes(reviewContent, "Approved for publishing: true", reviewPath);

    requireIncludes(draftContent, `SEO Draft:`, draftPath);
    requireIncludes(draftContent, "blocked_for_human_review", draftPath);
    requireIncludes(draftContent, "Human Review Required", draftPath);
    requireExcludes(draftContent, "Status: PUBLIC-READY", draftPath);
  }

  logInfo(`PASS human review QA checked ${intake.links.length} intake items`);
}

function main() {
  try {
    qaHumanReview();
  } catch (error) {
    logError("Human review QA failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
