const fs = require("fs");
const { CAMPAIGNS_PATH } = require("./paths.cjs");
const { logError } = require("./logger.cjs");

function loadCampaigns() {
  try {
    const raw = fs.readFileSync(CAMPAIGNS_PATH, "utf8");
    const campaigns = JSON.parse(raw);

    if (!Array.isArray(campaigns)) {
      throw new Error("campaigns.json must contain an array.");
    }

    return campaigns;
  } catch (error) {
    logError("Unable to load campaigns", error);
    throw error;
  }
}

module.exports = {
  loadCampaigns
};