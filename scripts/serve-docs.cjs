const fs = require("fs");
const http = require("http");
const path = require("path");
const { URL } = require("url");

const ROOT = path.resolve(__dirname, "..");
const DOCS = path.join(ROOT, "docs");
const PORT = Number(process.env.PORT || 4173);

const TYPES = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function send(res, status, content, type = "text/plain; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(content);
}

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath);
  const clean = decoded.replace(/^\/+/, "");
  const target = path.resolve(DOCS, clean);

  if (!target.startsWith(DOCS)) {
    throw new Error("Blocked unsafe path");
  }

  return target;
}

function listPages() {
  const pages = fs
    .readdirSync(DOCS)
    .filter((file) => file.endsWith(".html"))
    .filter((file) => file !== "redirect.html")
    .sort();

  const links = pages
    .map((file) => `<li><a href="/${file}">${file}</a></li>`)
    .join("\n");

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Affiliate Campaign Engine Preview</title>
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
  <main>
    <h1>Affiliate Campaign Engine Preview</h1>
    <p>Local preview server for generated public campaign pages.</p>
    <ul>${links}</ul>
  </main>
</body>
</html>`;
}

function serveFile(req, res) {
  try {
    const parsed = new URL(req.url, `http://${req.headers.host}`);

    if (parsed.pathname === "/") {
      return send(res, 200, listPages(), TYPES[".html"]);
    }

    let filePath = safePath(parsed.pathname);

    if (!path.extname(filePath)) {
      filePath = `${filePath}.html`;
    }

    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      return send(res, 404, "Not found");
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = TYPES[ext] || "application/octet-stream";
    const content = fs.readFileSync(filePath);

    res.writeHead(200, { "Content-Type": type });
    res.end(content);
  } catch (error) {
    console.error(`[SERVER ERROR] ${error.message}`);
    send(res, 500, "Local preview server error");
  }
}

function main() {
  if (!fs.existsSync(DOCS)) {
    throw new Error(`Missing docs folder: ${DOCS}`);
  }

  const server = http.createServer(serveFile);

  server.listen(PORT, () => {
    console.log(`Affiliate preview server running: http://localhost:${PORT}`);
    console.log(`Serving: ${DOCS}`);
  });

  server.on("clientError", (error, socket) => {
    console.error(`[CLIENT ERROR] ${error.message}`);
    socket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
  });
}

try {
  main();
} catch (error) {
  console.error(`[FATAL] ${error.message}`);
  process.exit(1);
}
