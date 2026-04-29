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

function qaResearchPackets() {
  if (!fs.existsSync(INTAKE_PATH)) {
    throw new Error(`Missing intake file: ${INTAKE_PATH}`);
  }

  const intake = readJson(INTAKE_PATH);

  if (!Array.isArray(intake.links)) {
    throw new Error("incoming-links.json must contain links array.");
  }

  for (const item of intake.links) {
    const packetPath = path.join(OUT_DIR, `${item.id}.md`);

    if (!fs.existsSync(packetPath)) {
      throw new Error(`Missing research packet: ${packetPath}`);
    }

    const content = fs.readFileSync(packetPath, "utf8");

    requireIncludes(content, `Research Packet: ${item.id}`, packetPath);
    requireIncludes(content, item.sourceUrl, packetPath);
    requireIncludes(content, "Publish decision:", packetPath);
    requireIncludes(content, "blocked_until_verified", packetPath);
    requireIncludes(content, "0 / 3 verified review highlights", packetPath);
    requireIncludes(content, "Manual Research Checklist", packetPath);
    requireIncludes(content, "Do not publish this item", packetPath);
    requireExcludes(content, "Status: PUBLIC-READY", packetPath);
  }

  logInfo(`PASS research packet QA checked ${intake.links.length} packets`);
}

function main() {
  try {
    qaResearchPackets();
  } catch (error) {
    logError("Research packet QA failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
