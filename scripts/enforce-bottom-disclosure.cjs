const fs = require("fs");
const path = require("path");
const { loadCampaigns } = require("./campaign-loader.cjs");
const { validateCampaigns } = require("./validate-schema.cjs");
const { isPublicReady } = require("./affiliate-helpers.cjs");
const { PAGES_DIR } = require("./paths.cjs");
const { logError, logInfo } = require("./logger.cjs");

const START = "<!-- BOTTOM_DISCLOSURE_START -->";
const END = "<!-- BOTTOM_DISCLOSURE_END -->";

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function stripExistingBottomDisclosure(html) {
  const pattern = new RegExp(`${START}[\\s\\S]*?${END}\\n*`, "g");
  return html.replace(pattern, "");
}

function stripClassedDisclosureBlocks(html) {
  let next = html;

  const patterns = [
    /<aside[^>]*class="[^"]*disclosure[^"]*"[^>]*>[\s\S]*?<\/aside>/gi,
    /<section[^>]*class="[^"]*disclosure[^"]*"[^>]*>[\s\S]*?<\/section>/gi,
    /<div[^>]*class="[^"]*disclosure[^"]*"[^>]*>[\s\S]*?<\/div>/gi
  ];

  for (const pattern of patterns) {
    next = next.replace(pattern, "");
  }

  return next;
}

function stripSingleDisclosureParagraphs(html) {
  return html.replace(/<p[^>]*>[^<]*Disclosure:[^<]*<\/p>/gi, "");
}

function buildDisclosure(campaign) {
  const text =
    campaign.disclosureText ||
    "Disclosure: This page may contain referral or affiliate links. We may receive compensation if you click or sign up through those links. Individual results vary.";

  const cleaned = escapeHtml(text).replace(/^Disclosure:\s*/i, "");

  return `${START}
<section class="bottom-disclosure-section" aria-labelledby="bottom-disclosure-heading">
  <h2 id="bottom-disclosure-heading">Disclosure</h2>
  <p>${cleaned}</p>
</section>
${END}
`;
}

function appendBeforeMainClose(html, section) {
  if (html.includes("</main>")) {
    return html.replace("</main>", `${section}\n</main>`);
  }

  if (html.includes("</body>")) {
    return html.replace("</body>", `${section}\n</body>`);
  }

  throw new Error("Could not find </main> or </body> for bottom disclosure.");
}

function enforceBottomDisclosure() {
  const campaigns = validateCampaigns(loadCampaigns());

  for (const campaign of campaigns.filter(isPublicReady)) {
    const pagePath = path.join(PAGES_DIR, `${campaign.slug}.html`);

    if (!fs.existsSync(pagePath)) {
      throw new Error(`Missing public page: ${pagePath}`);
    }

    const html = fs.readFileSync(pagePath, "utf8");
    const withoutBottom = stripExistingBottomDisclosure(html);
    const withoutClassed = stripClassedDisclosureBlocks(withoutBottom);
    const clean = stripSingleDisclosureParagraphs(withoutClassed);
    const section = buildDisclosure(campaign);

    fs.writeFileSync(pagePath, appendBeforeMainClose(clean, section), "utf8");

    logInfo(`Moved disclosure to bottom for ${campaign.slug}.html`);
  }
}

function main() {
  try {
    enforceBottomDisclosure();
  } catch (error) {
    logError("Bottom disclosure enforcement failed", error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}
