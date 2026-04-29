const fs = require("fs");
const path = require("path");
const { ROOT } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const INTAKE_PATH = path.join(ROOT, "data", "intake", "incoming-links.json");
const OUT_DIR = path.join(ROOT, "content", "research-packets");

function stripBom(text) {
  return String(text || "").replace(/^\uFEFF/, "");
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(stripBom(raw));
}

function safeValue(value) {
  return value === null || value === undefined || value === ""
    ? "Not verified"
    : String(value);
}

function reviewCount(item) {
  return Array.isArray(item.reviewHighlights) ? item.reviewHighlights.length : 0;
}

function renderPacket(item) {
  return `# Research Packet: ${item.id}

## Current State

Status: ${safeValue(item.status)}
Publish decision: ${safeValue(item.publishDecision)}

Source URL:
${safeValue(item.sourceUrl)}

Product name:
${safeValue(item.productName)}

Price observed:
${safeValue(item.priceObserved)}

Price observed at:
${safeValue(item.priceObservedAt)}

Affiliate program URL:
${safeValue(item.affiliateProgramUrl)}

Affiliate link:
${safeValue(item.affiliateUrl)}

Review evidence:
${reviewCount(item)} / 3 verified review highlights

## Publishing Gate

This item is blocked until all of these are true:

- Affiliate possibility is verified from a trustworthy source
- Actual affiliate link or affiliate code is available
- Product URL is exact and product-specific
- Product name and observed price are source-backed
- At least 3 public review highlights are source-backed
- Reviews are rated 4.5 or higher where ratings are available
- Page copy is balanced and no-nonsense
- Disclosure text is present
- Human approval changes the campaign status later

## Manual Research Checklist

### 1. Affiliate proof

- Find official affiliate program page
- Save source URL
- Record commission/coupon/code details only if source-backed
- Do not invent payout terms

### 2. Product proof

- Confirm exact product name
- Confirm exact product URL
- Confirm price and date observed
- Confirm warranty / return policy if available

### 3. Review evidence

Need 3 review highlights before public page generation.

For each review:

- Reviewer label
- Rating, if available
- How it helped / what buyer liked
- No-nonsense caution
- Source name
- Source URL
- Verified date

### 4. Risk notes

Record anything that could make this a bad recommendation:

- Low review count
- Unclear warranty
- Shipping concerns
- Return concerns
- Brand trust concerns
- Price/value concerns

## Hard Rule

Do not publish this item until the research packet is source-backed and the campaign is manually approved.
`;
}

function generateResearchPackets() {
  if (!fs.existsSync(INTAKE_PATH)) {
    throw new Error(`Missing intake file: ${INTAKE_PATH}`);
  }

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
    fs.writeFileSync(outPath, renderPacket(item), "utf8");
    logInfo(`Generated research packet for ${item.id}`);
  }

  logInfo(`PASS research packets generated: ${intake.links.length}`);
}

function main() {
  try {
    generateResearchPackets();
  } catch (error) {
    logError("Research packet generation failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
