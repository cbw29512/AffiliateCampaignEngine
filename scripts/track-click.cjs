const fs = require("fs");
const path = require("path");

const LOG_PATH = "C:/Users/divcl/OneDrive/Desktop/AffiliateCampaignEngine/logs/clicks.json";

function logClick(campaignId) {
  try {
    let logs = [];

    if (fs.existsSync(LOG_PATH)) {
      const raw = fs.readFileSync(LOG_PATH, "utf8");
      logs = JSON.parse(raw);
    }

    logs.push({
      campaignId,
      timestamp: new Date().toISOString()
    });

    fs.writeFileSync(LOG_PATH, JSON.stringify(logs, null, 2), "utf8");
  } catch (err) {
    console.error("Click log failed:", err.message);
  }
}

module.exports = { logClick };