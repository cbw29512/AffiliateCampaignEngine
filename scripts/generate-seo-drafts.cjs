const fs = require("fs");
const path = require("path");
const { ROOT } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const INTAKE_PATH = path.join(ROOT, "data", "intake", "incoming-links.json");
const OUT_DIR = path.join(ROOT, "content", "page-drafts");

function stripBom(text) {
  return String(text || "").replace(/^\uFEFF/, "");
}

function readJson(filePath) {
  return JSON.parse(stripBom(fs.readFileSync(filePath, "utf8")));
}

function safeValue(value) {
  return value === null || value === undefined || value === ""
    ? "Not verified"
    : String(value);
}

function titleFromId(id) {
  return String(id || "")
    .split("-")
    .filter(Boolean)
    .map((part) => part.slice(0, 1).toUpperCase() + part.slice(1))
    .join(" ");
}

function reviewCount(item) {
  return Array.isArray(item.reviewHighlights) ? item.reviewHighlights.length : 0;
}

function renderDraft(item) {
  const productName = item.productName || titleFromId(item.id);
  const reviews = reviewCount(item);

  return `# SEO Draft: ${productName}

Draft status: blocked_for_human_review
Campaign candidate ID: ${item.id}

## SEO Title Draft

No-Nonsense Review: ${productName}

## SEO Description Draft

Plain-English review of ${productName}, including affiliate disclosure, source-backed review evidence, and what to verify before buying.

## Source Product URL

${safeValue(item.sourceUrl)}

## Current Verification State

| Gate | Status |
|---|---|
| Exact product URL | ${item.sourceUrl ? "Recorded" : "Missing"} |
| Product name | ${item.productName ? "Verified" : "Not verified"} |
| Price | ${item.priceObserved ? "Verified" : "Not verified"} |
| Affiliate program URL | ${item.affiliateProgramUrl ? "Verified" : "Missing"} |
| Affiliate URL/code | ${item.affiliateUrl ? "Verified" : "Missing"} |
| Review highlights | ${reviews} / 3 verified |
| Human approval | Missing |
| Publish decision | ${safeValue(item.publishDecision)} |

## Suggested Page Structure

1. Hero: what this product is
2. No-nonsense review evidence near the top
3. Who this may help
4. What to verify before buying
5. Price/value notes
6. Warranty/return/shipping notes
7. CTA only if affiliate link is verified
8. Disclosure at the bottom

## Draft Copy Notes

This product should not be described as “best,” “guaranteed,” “proven,” or “perfect” unless the claim is backed by source evidence.

## Human Review Required

This draft is not public-ready. It exists so a human can review the angle, claims, missing proof, and quality before any public page is generated.
`;
}

function generateSeoDrafts() {
  const intake = readJson(INTAKE_PATH);

  if (!Array.isArray(intake.links)) {
    throw new Error("incoming-links.json must contain links array.");
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const item of intake.links) {
    if (!item.id) {
      throw new Error("Intake item missing id.");
    }

    const outPath = path.join(OUT_DIR, `${item.id}.md`);
    fs.writeFileSync(outPath, renderDraft(item), "utf8");
    logInfo(`Generated SEO draft for ${item.id}`);
  }

  logInfo(`PASS SEO drafts generated: ${intake.links.length}`);
}

function main() {
  try {
    generateSeoDrafts();
  } catch (error) {
    logError("SEO draft generation failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
