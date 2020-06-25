const path = require("path");

// Models
const Locale = require("../../locales/v1/locales.model");
const Scan = require("../../scans/v1/scans.model");

// Reporting Functions
const { createScansReport } = require("../../../lib/Reports/createScansReport");
const {
  createLocalesReport
} = require("../../../lib/Reports/createLocalesReport");

// Helper Functions
const { getCorrectedDates } = require("../../../lib/Helpers/getCorrectedDates");

// @route   GET /report
// @desc    Get locales or scans report in CSV, XLSX or JSON format
exports.getReport = async (req, res, next) => {
  try {
    const format =
      typeof req.query.format === "string" &&
      req.query.format.toLowerCase().trim();
    const type =
      typeof req.query.type === "string" && req.query.type.toLowerCase().trim();

    const sendResponse = report => {
      if (typeof report === "string") {
        // Respond with a report in file format
        res.download(
          path.resolve(__dirname + "./../../../../reports/" + report),
          report
        );
      } else {
        // Respond with a report in JSON format
        res.json({
          message: "Report successfully created.",
          report
        });
      }
    };

    if (type === "scan") {
      const { start, end } = getCorrectedDates(req.query.start, req.query.end);

      const scans = await Scan.find({
        createdAt: {
          $gte: start,
          $lte: end
        }
      });

      if (scans.length) {
        const report = createScansReport(scans, format);
        sendResponse(report);
      } else {
        res.status(404).json({
          message: "No scans found in given time period.",
          error: "ERR_SCANS_NOT_FOUND"
        });
      }
    } else if (type === "locale") {
      const query = {};
      if (req.query.projects)
        query.project = {
          $in: req.query.projects.split(",").map(project => project.trim())
        };

      const locales = await Locale.find(query);

      if (locales.length) {
        const report = createLocalesReport(locales, req.query.keys, format);
        sendResponse(report);
      } else {
        res.status(404).json({
          message: "No locales found.",
          error: "ERR_LOCALES_NOT_FOUND"
        });
      }
    } else {
      const error = new Error("Invalid or missing requested Report type.");
      next(error);
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
};
