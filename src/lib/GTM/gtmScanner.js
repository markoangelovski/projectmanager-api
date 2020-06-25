const axios = require("axios");

// GTM Functions
const gtmParser = require("./gtmParser");
const gtmCompare = require("./gtmCompare");

const gtmScanner = async locales => {
  const scanPromises = [];
  let localesScanned = 0;
  const scanStart = new Date();

  // Create a new promise for each new scan
  locales.forEach(locale => {
    const { title, url, favicon, GTM: previousGtm } = locale;
    scanPromises.push(
      new Promise((resolve, reject) => {
        axios
          .get(url)
          .then(({ data }) => {
            const scannedGtm = gtmParser(data);
            const result = gtmCompare(previousGtm, scannedGtm);
            resolve({
              title,
              url,
              favicon,
              result
            });
          })
          .catch(err => reject(err));
      })
    );
    localesScanned++;
  });

  // Resolve all scan promises
  const scanResults = await Promise.all(scanPromises);

  // Filter scan results for scans with errors
  let totalMissingKeys = 0;
  let totalErrors = 0;
  const stats = [];
  scanResults.forEach(res => {
    if (res.result.hasMissingKeys || res.result.hasErrors) {
      res.result.hasMissingKeys && totalMissingKeys++;
      res.result.hasErrors && totalErrors++;
      stats.push(res);
    }
  });

  const scanDurationMs = new Date() - scanStart;

  return {
    localesScanned,
    totalMissingKeys,
    totalErrors,
    scanDurationMs,
    stats
  };
};

module.exports = gtmScanner;
