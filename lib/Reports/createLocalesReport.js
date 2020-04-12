const fs = require("fs");
const moment = require("moment");

const { createReportFile } = require("./createReportFile");

const createLocalesReport = (locales, keys, format) => {
  locales.sort((a, b) => {
    if (a.project.toUpperCase() > b.project.toUpperCase()) {
      return 1;
    }
    if (a.project.toUpperCase() < b.project.toUpperCase()) {
      return -1;
    }
  });
  const gtmKeys = keys ? keys.split(",").map(key => key.trim()) : [];
  const rows = [];

  // Get all unique GTM keys for titles if no specific keys are requested
  !keys &&
    locales.forEach(locale => {
      locale.GTM &&
        Object.keys(locale.GTM).forEach(key => {
          if (gtmKeys.indexOf(key) === -1) gtmKeys.push(key);
        });
    });

  // Iterate over each locale and store GTM key values into rows
  locales.forEach(locale => {
    const gtmKeyValues = [];
    // Check each unique GTM key in each GTM and create rows
    gtmKeys.forEach(key => {
      gtmKeyValues.push((locale.GTM && locale.GTM[key]) || "");
    });
    rows.push([
      moment(locale.updatedAt).format("YYYY-MM-DD"),
      locale.project,
      locale.title,
      locale.url,
      ...gtmKeyValues
    ]);
  });

  const titles = ["Date", "Project", "Title", "URL", ...gtmKeys];

  return createReportFile("locale", titles, rows, format);
};

module.exports = { createLocalesReport };
