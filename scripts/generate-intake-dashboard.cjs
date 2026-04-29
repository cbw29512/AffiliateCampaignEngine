const fs = require("fs");
const path = require("path");
const { ROOT, PAGES_DIR } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const INTAKE_PATH = path.join(ROOT, "data", "intake", "incoming-links.json");
const RESEARCH_DIR = path.join(ROOT, "content", "research-packets");
const OUT_PATH = path.join(PAGES_DIR, "operator-intake.html");

function stripBom(text) {
  return String(text || "").replace(/^\uFEFF/, "");
}

function readJson(filePath) {
  return JSON.parse(stripBom(fs.readFileSync(filePath, "utf8")));
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function safeValue(value) {
  return value === null || value === undefined || value === ""
    ? "Not verified"
    : String(value);
}

function researchPacketExists(item) {
  return fs.existsSync(path.join(RESEARCH_DIR, `${item.id}.md`));
}

function renderRows(links) {
  if (links.length === 0) {
    return `<tr><td colspan="5">No intake links yet.</td></tr>`;
  }

  return links.map((item) => {
    const packetStatus = researchPacketExists(item)
      ? "Generated"
      : "Missing";

    return `<tr>
  <td><code>${escapeHtml(item.id)}</code></td>
  <td><a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="nofollow noopener">Source</a></td>
  <td>${escapeHtml(safeValue(item.status))}</td>
  <td>${escapeHtml(safeValue(item.publishDecision))}</td>
  <td>${escapeHtml(packetStatus)}</td>
</tr>`;
  }).join("\n");
}

function renderPage(intake) {
  const links = Array.isArray(intake.links) ? intake.links : [];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="robots" content="noindex,nofollow">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Operator Intake Dashboard</title>
  <meta name="description" content="Local operator dashboard for blocked affiliate product intake.">
  <link rel="stylesheet" href="assets/style.css">
</head>
<body>
  <main>
    <header>
      <p class="eyebrow">Operator Dashboard</p>
      <h1>Affiliate Link Intake</h1>
      <p>Paste a product URL, generate the safe local command, then run it in PowerShell. Nothing becomes public until verification gates pass.</p>
    </header>

    <section class="bottom-disclosure-section">
      <h2>Safety Rule</h2>
      <p>This page does not publish products, invent reviews, invent prices, or create public pages. It only helps prepare blocked intake commands.</p>
    </section>

    <section class="operator-panel" aria-labelledby="new-link-heading">
      <h2 id="new-link-heading">Add a product link</h2>

      <label for="productUrl">Product URL</label>
      <input id="productUrl" class="operator-input" type="url" placeholder="https://example.com/product">

      <label for="productNote">Optional note</label>
      <textarea id="productNote" class="operator-input" rows="4" placeholder="Why this product is interesting, affiliate possibility, niche angle, etc."></textarea>

      <button class="cta" type="button" onclick="generateCommand()">Generate safe command</button>

      <h3>PowerShell command</h3>
      <pre id="commandOutput" class="operator-command">Paste a URL above to generate a command.</pre>
      <button class="secondary-cta" type="button" onclick="copyCommand()">Copy command</button>
    </section>

    <section class="operator-panel" aria-labelledby="queue-heading">
      <h2 id="queue-heading">Current intake queue</h2>
      <table class="operator-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Source</th>
            <th>Status</th>
            <th>Publish decision</th>
            <th>Research packet</th>
          </tr>
        </thead>
        <tbody>
${renderRows(links)}
        </tbody>
      </table>
    </section>

    <section class="operator-panel">
      <h2>After running the command</h2>
      <pre class="operator-command">node .\\scripts\\build.cjs
git add data content scripts PROJECT_BLUEPRINT.md
git commit -m "Record intake link"
git push</pre>
    </section>
  </main>

  <script>
    function psEscape(value) {
      return String(value || "").replace(/"/g, '\\"').trim();
    }

    function generateCommand() {
      const url = document.getElementById("productUrl").value.trim();
      const note = document.getElementById("productNote").value.trim();
      const output = document.getElementById("commandOutput");

      if (!url || !/^https?:\\/\\//i.test(url)) {
        output.textContent = "Enter a valid product URL starting with http:// or https://.";
        return;
      }

      const cleanNote = note || "Product candidate submitted from operator dashboard.";
      output.textContent = 'node .\\\\scripts\\\\intake-link.cjs "' + psEscape(url) + '" "' + psEscape(cleanNote) + '"';
    }

    async function copyCommand() {
      const text = document.getElementById("commandOutput").textContent;

      try {
        await navigator.clipboard.writeText(text);
        alert("Command copied.");
      } catch (error) {
        alert("Copy failed. Select the command text manually.");
      }
    }
  </script>
</body>
</html>`;
}

function generateDashboard() {
  if (!fs.existsSync(INTAKE_PATH)) {
    throw new Error(`Missing intake file: ${INTAKE_PATH}`);
  }

  const intake = readJson(INTAKE_PATH);

  if (!Array.isArray(intake.links)) {
    throw new Error("incoming-links.json must contain links array.");
  }

  fs.mkdirSync(PAGES_DIR, { recursive: true });
  fs.writeFileSync(OUT_PATH, renderPage(intake), "utf8");

  logInfo(`Generated ${OUT_PATH}`);
  logInfo(`PASS operator intake dashboard generated with ${intake.links.length} links`);
}

function main() {
  try {
    generateDashboard();
  } catch (error) {
    logError("Operator intake dashboard generation failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
