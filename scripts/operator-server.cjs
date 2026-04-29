const http = require("http");
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const { ROOT } = require("./paths.cjs");

const PORT = 4317;
const INTAKE_PATH = path.join(ROOT, "data", "intake", "incoming-links.json");

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

function runNodeScript(scriptPath, args = []) {
  const result = spawnSync("node", [scriptPath, ...args], {
    cwd: ROOT,
    encoding: "utf8",
    shell: true
  });

  return {
    ok: result.status === 0,
    status: result.status,
    stdout: result.stdout || "",
    stderr: result.stderr || ""
  };
}

function send(res, status, html) {
  res.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
  res.end(html);
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = "";

    req.on("data", (chunk) => {
      body += chunk.toString();
    });

    req.on("end", () => {
      resolve(new URLSearchParams(body));
    });
  });
}

function renderRows() {
  const intake = readJson(INTAKE_PATH);
  const links = Array.isArray(intake.links) ? intake.links : [];

  if (links.length === 0) {
    return "<tr><td colspan=\"5\">No intake links yet.</td></tr>";
  }

  return links.map((item) => {
    return `<tr>
  <td><code>${escapeHtml(item.id)}</code></td>
  <td><a href="${escapeHtml(item.sourceUrl)}" target="_blank" rel="noreferrer">Source</a></td>
  <td>${escapeHtml(item.status)}</td>
  <td>${escapeHtml(item.publishDecision)}</td>
  <td><code>content/human-review/${escapeHtml(item.id)}.md</code></td>
</tr>`;
  }).join("\n");
}

function page(message = "") {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Affiliate Site Generator Operator</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 1100px; margin: 32px auto; padding: 0 18px; line-height: 1.5; color: #111827; }
    .panel { border: 1px solid #d1d5db; border-radius: 16px; padding: 22px; margin: 18px 0; background: #f9fafb; }
    input, textarea { width: 100%; box-sizing: border-box; padding: 12px; margin: 8px 0 16px; border-radius: 10px; border: 1px solid #d1d5db; font: inherit; }
    button { padding: 12px 18px; border: 0; border-radius: 999px; background: #111827; color: white; font-weight: bold; cursor: pointer; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 10px; border-bottom: 1px solid #d1d5db; text-align: left; vertical-align: top; }
    pre { white-space: pre-wrap; background: #111827; color: #f9fafb; padding: 16px; border-radius: 12px; overflow-x: auto; }
    .message { background: #ecfdf5; border: 1px solid #a7f3d0; }
    .warning { background: #fffbeb; border: 1px solid #fcd34d; }
  </style>
</head>
<body>
  <h1>Affiliate Site Generator Operator</h1>
  <p>Paste a product URL, hit Go, and the local engine creates blocked intake, research, SEO draft, and human review files.</p>

  <div class="panel warning">
    <strong>Human gate:</strong> This does not publish. Products stay blocked until proof and approval are recorded.
  </div>

  ${message}

  <form class="panel" method="POST" action="/go">
    <h2>New product candidate</h2>
    <label>Product URL</label>
    <input name="sourceUrl" type="url" required placeholder="https://example.com/product">

    <label>Operator note</label>
    <textarea name="note" rows="5" placeholder="Why this product is interesting, affiliate possibility, niche angle, etc."></textarea>

    <button type="submit">Go — Generate blocked draft package</button>
  </form>

  <div class="panel">
    <h2>Current intake queue</h2>
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Source</th>
          <th>Status</th>
          <th>Publish decision</th>
          <th>Human review file</th>
        </tr>
      </thead>
      <tbody>
        ${renderRows()}
      </tbody>
    </table>
  </div>

  <div class="panel">
    <h2>After review</h2>
    <p>Open the generated files, review the suggestions, and keep the product blocked until the data is complete and human approval is recorded.</p>
  </div>
</body>
</html>`;
}

async function handleGo(req, res) {
  const body = await parseBody(req);
  const sourceUrl = String(body.get("sourceUrl") || "").trim();
  const note = String(body.get("note") || "Submitted from local operator website.").trim();

  if (!/^https?:\/\//i.test(sourceUrl)) {
    send(res, 400, page(`<div class="panel warning">Invalid URL. Use http:// or https://.</div>`));
    return;
  }

  const intakeResult = runNodeScript("scripts/intake-link.cjs", [sourceUrl, note]);

  if (!intakeResult.ok) {
    send(res, 500, page(`<div class="panel warning"><h2>Intake failed</h2><pre>${escapeHtml(intakeResult.stderr || intakeResult.stdout)}</pre></div>`));
    return;
  }

  const buildResult = runNodeScript("scripts/build.cjs");

  const message = `<div class="panel message">
    <h2>Draft package generated</h2>
    <p>The link was recorded and the build was run. Review the output below.</p>
    <h3>Intake output</h3>
    <pre>${escapeHtml(intakeResult.stdout + intakeResult.stderr)}</pre>
    <h3>Build output</h3>
    <pre>${escapeHtml(buildResult.stdout + buildResult.stderr)}</pre>
  </div>`;

  send(res, buildResult.ok ? 200 : 500, page(message));
}

function startServer() {
  const server = http.createServer((req, res) => {
    if (req.method === "GET" && req.url === "/") {
      send(res, 200, page());
      return;
    }

    if (req.method === "POST" && req.url === "/go") {
      handleGo(req, res).catch((error) => {
        send(res, 500, page(`<div class="panel warning">${escapeHtml(error.message)}</div>`));
      });
      return;
    }

    send(res, 404, page(`<div class="panel warning">Not found.</div>`));
  });

  server.listen(PORT, () => {
    console.log(`[INFO] Operator server running at http://localhost:${PORT}`);
    console.log("[INFO] Press Ctrl+C to stop.");
  });
}

startServer();
