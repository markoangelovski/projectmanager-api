const router = require("express").Router();

// Controllers
const {
  initScan,
  getScans,
  initScanSingle,
  getSingleScan
} = require("./scans.controller");

// Middlewares
const { isApiAdmin } = require("../../../middlewares/users/checkApiKey");

// @route   POST /scan
// @desc    Initiate scan
router.post("/", isApiAdmin, initScan);

// @route   GET /scan?url=https://www.locale.com || ?start=startDate&end=endDate
// @desc    Initiate single locale scan or fetch all scans
router.get("/", getScans, initScanSingle);

// @route   GET /scan/:scanID
// @desc    Get single scan by Scan ID
router.get("/:scanID", getSingleScan);

module.exports = router;
