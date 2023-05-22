const router = require("express").Router();

// Controllers
const { getDocs } = require("./docs.controller");

// @route   GET /report
// @desc    Get locales or scans report in CSV, XLSX or JSON format
router.get("/", getDocs);

module.exports = router;
