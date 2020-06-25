const moment = require("moment");

const { createReportFile } = require("./createReportFile");

const createScansReport = (scans, format) => {
  scans.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const rows = [];

  // Iterate over scans and extract data for each row
  scans.forEach(scan => {
    // Check only scans that found any errors
    if (scan.stats.length) {
      scan.stats.forEach(stat => {
        // In case that diffs object does not exist, initate new empty object
        const diffs = stat.result.diff || {};
        // Check which error has the most counts and create a row for each missing GTM key
        // or a difference in GTM key/attribute values
        const iterations = Math.max(
          stat.result.missingKeysInPrevious.length,
          stat.result.missingKeysInScanned.length,
          Object.keys(diffs).length
        );

        // Create a new row for each error
        for (let i = 0; i < iterations; i++) {
          diffKey = Object.keys(diffs)[i];
          rows.push([
            moment(scan.createdAt).format("YYYY-MM-DD"),
            stat.title,
            stat.url,
            diffKey ? diffKey : "",
            diffs[diffKey] ? diffs[diffKey].previous : "",
            diffs[diffKey] ? diffs[diffKey].scanned : "",
            stat.result.missingKeysInPrevious[i]
              ? stat.result.missingKeysInPrevious[i]
              : "",
            stat.result.missingKeysInScanned[i]
              ? stat.result.missingKeysInScanned[i]
              : "",
            Math.round((scan.scanDurationMs / 1000) * 100) / 100
          ]);
        }
      });
    }
  });

  const titles = [
    "Date",
    "Title",
    "URL",
    "GTM Key",
    "Previous",
    "Scanned",
    "Missing keys prev.",
    "Missing keys scanned",
    "Scan duration (s)"
  ];

  return createReportFile("scan", titles, rows, format);
};

module.exports = { createScansReport };
