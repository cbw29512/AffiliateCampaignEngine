const fs = require("fs");
const path = require("path");
const { ROOT } = require("./paths.cjs");

const INTAKE_PATH = path.join(ROOT, "data", "intake", "incoming-links.json");

function stripBom(text) {
  return String(text || "").replace(/^\uFEFF/, "");
}

function readJson(filePath) {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(stripBom(raw));
}

function writeJson(filePath, data) {
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

function requireUrl(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error("Missing product URL.");
  }

  const clean = value.trim();

  if (!/^https?:\/\//i.test(clean)) {
    throw new Error("Product URL must start with http:// or https://");
  }

  return clean;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function buildId(sourceUrl) {
  const parsed = new URL(sourceUrl);
  const pathPart = parsed.pathname.replace(/\/$/, "");
  const candidate = pathPart.split("/").filter(Boolean).pop() || parsed.hostname;

  return slugify(candidate);
}

function nowDate() {
  return new Date().toISOString().slice(0, 10);
}

function ensureShape(data) {
  if (!data || typeof data !== "object") {
    throw new Error("Intake file must be an object.");
  }

  if (!Array.isArray(data.links)) {
    throw new Error("Intake file must contain links array.");
  }
}

function intakeLink() {
  const sourceUrl = requireUrl(process.argv[2]);
  const note = typeof process.argv[3] === "string" ? process.argv[3].trim() : "";
  const intake = readJson(INTAKE_PATH);

  ensureShape(intake);

  const normalizedUrl = sourceUrl.replace(/[?#].*$/, "");
  const existing = intake.links.find((item) => item.sourceUrl === normalizedUrl);

  if (existing) {
    existing.lastSeenAt = nowDate();

    if (note) {
      existing.notes = [existing.notes || "", note].filter(Boolean).join("\n");
    }

    writeJson(INTAKE_PATH, intake);

    console.log(`[INFO] Existing intake link updated: ${existing.id}`);
    console.log(`[INFO] Status remains: ${existing.status}`);
    console.log("[INFO] Publish decision remains blocked until verified.");
    return;
  }

  const id = buildId(normalizedUrl);

  intake.links.push({
    id,
    sourceUrl: normalizedUrl,
    submittedAt: nowDate(),
    lastSeenAt: nowDate(),
    status: "research_needed",
    affiliateProgramUrl: null,
    affiliateUrl: null,
    productName: null,
    priceObserved: null,
    priceObservedAt: null,
    reviewHighlights: [],
    researchSources: [],
    publishDecision: "blocked_until_verified",
    notes: note || null
  });

  writeJson(INTAKE_PATH, intake);

  console.log(`[INFO] Intake link added: ${id}`);
  console.log(`[INFO] Source URL: ${normalizedUrl}`);
  console.log("[INFO] Status: research_needed");
  console.log("[INFO] Publish decision: blocked_until_verified");
}

try {
  intakeLink();
} catch (error) {
  console.error(`[ERROR] ${error.message}`);
  console.error("");
  console.error("Usage:");
  console.error('node scripts/intake-link.cjs "https://example.com/product-url" "optional note"');
  process.exit(1);
}
