const router = require("express").Router();

// Controllers
const { getReport } = require("./reports.controller");

// @route   GET /report
// @desc    Get locales or scans report in CSV, XLSX or JSON format
router.get("/", getReport);

module.exports = router;
