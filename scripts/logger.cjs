function logInfo(message, extra = "") {
  console.log(`[INFO] ${message}`, extra);
}

function logError(message, error) {
  const detail = error && error.message ? error.message : String(error);
  console.error(`[ERROR] ${message}: ${detail}`);
}

module.exports = {
  logInfo,
  logError
};