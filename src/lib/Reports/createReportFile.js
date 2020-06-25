const fs = require("fs");
const xlsx = require("xlsx");
const moment = require("moment");

const createReportFile = (type, titles, rows, format) => {
  // Report Type
  const reportType =
    (type === "scan" && "Scan") || (type === "locale" && "Locale");

  // Create JSON report
  const spreadsheet = [];
  rows.forEach(row => {
    const rowObj = {};
    row.forEach((cell, i) => {
      rowObj[titles[i]] = cell;
    });
    spreadsheet.push(rowObj);
  });

  // Report Filename
  const reportFile = `reports/${reportType}Report-${moment().format(
    "YYYYMMDD"
  )}${new Date().getTime()}.${format}`;

  // Create Reports folder if it does not exist
  !fs.existsSync("./reports") && fs.mkdirSync("./reports");

  // Delete old report file if it exists
  fs.existsSync(reportFile) && fs.unlinkSync(reportFile);

  if (format === "csv") {
    // Create report csv file and add titles
    fs.appendFileSync(reportFile, titles.join(";") + "\n");

    rows.forEach(row => {
      fs.appendFileSync(reportFile, row.join(";") + "\n");
    });

    return reportFile.slice(8);
  } else if (format === "xlsx") {
    // Create and save xlsx file
    const newWB = xlsx.utils.book_new();
    const newWS = xlsx.utils.json_to_sheet(spreadsheet);
    xlsx.utils.book_append_sheet(newWB, newWS, `${reportType}Report`);
    xlsx.writeFile(newWB, reportFile);

    return reportFile.slice(8);
  } else {
    // If format is not selected, return JSON
    return spreadsheet;
  }
};

module.exports = { createReportFile };
