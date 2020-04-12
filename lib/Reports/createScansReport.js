const moment = require("moment");

const { createReportFile } = require("./createReportFile");

const getDates = (startDate, endDate) => {
  // Support for "1584223200000" formats.
  const correctTimestamp = date =>
    date && !isNaN(parseFloat(Number(date))) ? new Date(Number(date)) : date;

  startDate = correctTimestamp(startDate);
  endDate = correctTimestamp(endDate);

  // Support for "2015-06-22T13:17:21+0000" formats.
  const correctUTC = date =>
    date && !isNaN(Date.parse(date)) ? new Date(date) : date;

  startDate = correctUTC(startDate);
  endDate = correctUTC(endDate);

  // Check if input is in valid format
  const formats = [moment.ISO_8601, moment.RFC_2822];
  const startCheck = startDate && moment(startDate, formats, true).isValid();
  const endCheck = endDate && moment(endDate, formats, true).isValid();

  const start = startCheck
    ? moment(startDate).format()
    : moment().startOf("month").format();
  const end = endCheck
    ? moment(endDate).format()
    : moment().endOf("month").format();

  // If no dates are passed
  if (!startDate && !startCheck && !endDate && !endCheck) {
    return { start, end };
  }
  // If both dates are passed
  if (startCheck && endCheck) {
    return { start, end };
  }
  // If only start date is passed
  if (startDate && !endDate && startCheck && !endCheck) {
    return { start, end };
  }
  // If only end date is passed
  if (!startDate && endDate && !startCheck && endCheck) {
    return { start, end };
  } else {
    throw new Error(
      "Start and End dates need to be in the proper time format."
    );
  }
};

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

module.exports = { createScansReport, getDates };
