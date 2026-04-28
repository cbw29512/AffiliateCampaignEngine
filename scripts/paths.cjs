const path = require("path");

const ROOT = "C:/Users/divcl/OneDrive/Desktop/AffiliateCampaignEngine";

module.exports = {
  ROOT,
  CAMPAIGNS_PATH: path.join(ROOT, "data", "campaigns.json"),
  PAGES_DIR: path.join(ROOT, "pages"),
  ASSETS_DIR: path.join(ROOT, "assets")
};