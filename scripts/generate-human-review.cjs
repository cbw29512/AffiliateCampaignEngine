const fs = require("fs");
const path = require("path");
const { ROOT } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const INTAKE_PATH = path.join(ROOT, "data", "intake", "incoming-links.json");
const RULES_PATH = path.join(ROOT, "data", "review-learning", "reference-rules.json");
const OUT_DIR = path.join(ROOT, "content", "human-review");

function stripBom(text) {
  return String(text || "").replace(/^\uFEFF/, "");
}

function readJson(filePath) {
  return JSON.parse(stripBom(fs.readFileSync(filePath, "utf8")));
}

function reviewCount(item) {
  return Array.isArray(item.reviewHighlights) ? item.reviewHighlights.length : 0;
}

function suggestion(area, issue, suggestedChange, severity = "medium") {
  return { area, issue, suggestedChange, severity };
}

function buildSuggestions(item) {
  const suggestions = [];

  if (!item.productName) {
    suggestions.push(suggestion(
      "product proof",
      "Product name is not verified.",
      "Confirm the exact product name from the source product page.",
      "high"
    ));
  }

  if (!item.priceObserved) {
    suggestions.push(suggestion(
      "price proof",
      "Price is not verified.",
      "Record the observed price and observation date from the product page.",
      "medium"
    ));
  }

  if (!item.affiliateProgramUrl) {
    suggestions.push(suggestion(
      "affiliate proof",
      "Affiliate program proof is missing.",
      "Add the official affiliate program URL before publishing.",
      "critical"
    ));
  }

  if (!item.affiliateUrl) {
    suggestions.push(suggestion(
      "affiliate link",
      "Actual affiliate URL or code is missing.",
      "Add the real affiliate URL/code and verify it lands on the exact product.",
      "critical"
    ));
  }

  if (reviewCount(item) < 3) {
    suggestions.push(suggestion(
      "review evidence",
      `Only ${reviewCount(item)} of 3 required review highlights are present.`,
      "Add 3 source-backed public review highlights rated 4.5+ when ratings are available.",
      "critical"
    ));
  }

  suggestions.push(suggestion(
    "headline",
    "Avoid hype-first wording.",
    "Use a no-nonsense headline that says what the product is and what must be verified before buying.",
    "medium"
  ));

  suggestions.push(suggestion(
    "risk section",
    "High-ticket products need extra caution.",
    "Add warranty, return policy, shipping, review-count, and brand-trust notes before any CTA.",
    "high"
  ));

  return suggestions;
}

function renderRules(rules) {
  if (!Array.isArray(rules.rules) || rules.rules.length === 0) {
    return "- No reference rules recorded yet.";
  }

  return rules.rules
    .map((rule) => `- [${rule.severity}] ${rule.rule}`)
    .join("\n");
}

function renderSuggestions(suggestions) {
  return suggestions
    .map((item, index) => {
      return `### Suggestion ${index + 1}: ${item.area}

Severity: ${item.severity}

Issue:
${item.issue}

Suggested change:
${item.suggestedChange}

Human decision:
- [ ] accepted
- [ ] rejected
- [ ] needs rewrite

Human notes:
`;
    })
    .join("\n");
}

function renderReview(item, rules) {
  const suggestions = buildSuggestions(item);

  return `# Human Review: ${item.id}

Review status: needs_human_review
Approved for publishing: false

## Current Publish Decision

${item.publishDecision}

## Source URL

${item.sourceUrl}

## Required Human Checks

- [ ] Product URL is exact and product-specific
- [ ] Product name is verified
- [ ] Price and date are verified
- [ ] Affiliate program proof is verified
- [ ] Affiliate URL/code is verified
- [ ] 3 review highlights are source-backed
- [ ] Claims are not exaggerated
- [ ] Risks are clearly stated
- [ ] Disclosure is visible
- [ ] Page is good enough for a real customer

## Generated Suggestions

${renderSuggestions(suggestions)}

## Reference Rules Applied

${renderRules(rules)}

## Final Human Review Notes

Write final notes here before approval.

## Hard Gate

Do not publish this campaign until this file has been reviewed and approval is explicitly recorded through the approval workflow.
`;
}

function generateHumanReviews() {
  const intake = readJson(INTAKE_PATH);
  const rules = readJson(RULES_PATH);

  if (!Array.isArray(intake.links)) {
    throw new Error("incoming-links.json must contain links array.");
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  for (const item of intake.links) {
    if (!item.id) {
      throw new Error("Intake item missing id.");
    }

    const outPath = path.join(OUT_DIR, `${item.id}.md`);
    fs.writeFileSync(outPath, renderReview(item, rules), "utf8");
    logInfo(`Generated human review file for ${item.id}`);
  }

  logInfo(`PASS human review files generated: ${intake.links.length}`);
}

function main() {
  try {
    generateHumanReviews();
  } catch (error) {
    logError("Human review generation failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
