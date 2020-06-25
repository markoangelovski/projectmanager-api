const axios = require("axios");
const moment = require("moment");

// Models
const Scan = require("./scans.model");
const Locale = require("../../locales/v1/locales.model");

// Validation
const { urlRgx } = require("../../../..//validation/regex");

// GTM Functions
const gtmParser = require("../../../../lib/GTM/gtmParser");
const gtmCompare = require("../../../../lib/GTM/gtmCompare");
const gtmScanner = require("../../../../lib/GTM/gtmScanner");

// Helper Functions
const { getDates } = require("../../../../lib/Helpers/getDates");

// @route   POST /locales/scan
// @desc    Initiate scan
exports.initScan = async (req, res, next) => {
  try {
    // Check if the scan for today has been performed
    const scan = await Scan.findOne({
      createdAt: {
        $gte: moment().startOf("day").format(),
        $lte: moment().endOf("day").format()
      }
    });

    if (scan) {
      res.json({
        message:
          "Scan for today has already been performed. New scan can be performed tomorrow.",
        scan
      });
    } else {
      // Generate Scan ID for fetching the scan later
      const scanID = Math.floor(10000 + Math.random() * 90000);

      // Create Scan placeholder
      const scanPlaceholder = new Scan({
        scanID
      });

      // Wait for the Scan placehoder to save in order not to run multiple scans
      const scan = await scanPlaceholder.save();

      // Send a scan link to the user
      res.json({
        message: `Scan initiated.`,
        result: `https://${req.get("host")}/v1/scan/${scanID}`
      });

      // Get locales
      const locales = await Locale.find().select("title url favicon GTM");

      // Initiate scan
      const scanResult = await gtmScanner(locales);

      // Update Scan placehoder with results
      Scan.updateOne(
        { _id: scan._id },
        {
          $set: { ...scanResult }
        }
      ).then(scan => scan);
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
};

// @route   GET /locales/scan?url=https://www.locale.com || ?start=startDate&end=endDate
// @desc    Initiate single locale scan or fetch all scans
exports.getScans = async (req, res, next) => {
  const localeUrl = req.query.url;

  if (localeUrl && urlRgx.test(localeUrl)) {
    try {
      const locale = await Locale.findOne({ url: localeUrl });

      if (locale) {
        const { data } = await axios.get(locale.url);

        const scannedGtm = gtmParser(data);
        const result = gtmCompare(locale.GTM, scannedGtm);

        const scanResult = {
          url: locale.url,
          hasMissingKeys: result.hasMissingKeys,
          hasErrors: result.hasErrors,
          diff: result,
          currentGtm: locale.GTM,
          scannedGtm
        };

        res.json({
          message: "Locale found.",
          result: scanResult
        });
      } else {
        const { data } = await axios.get(localeUrl);

        const scannedGtm = gtmParser(data);

        const scanResult = {
          url: localeUrl,
          scannedGtm
        };

        res.json({
          message: "Locale not found. New scan performed.",
          result: scanResult
        });
      }
    } catch (error) {
      console.warn(error);
      next(error);
    }
  } else if (localeUrl && !urlRgx.test(localeUrl)) {
    res.status(400).json({
      message: "Please enter valid locale URL.",
      error: "ERR_INVALID_URL"
    });
  } else if (!localeUrl) {
    try {
      const { start, end } = getDates(req.query.start, req.query.end);

      const scans = await Scan.find({
        createdAt: {
          $gte: start,
          $lte: end
        }
      });

      if (scans.length) {
        res.status(200).json({
          message: `Scans susscessfully fetched!`,
          count: scans.length,
          scans
        });
      } else {
        res.status(404).json({
          message: "No scans found in given time period.",
          error: "ERR_SCANS_NOT_FOUND"
        });
      }
    } catch (error) {
      console.warn(error);
      next(error);
    }
  }
};

// @route   GET /scan/:scanID
// @desc    Get single scan by Scan ID
exports.getSingleScan = async (req, res, next) => {
  const scanID = req.params.scanID;
  if (Number(scanID) && scanID.length === 5) {
    try {
      const scan = await Scan.findOne({ scanID: scanID });
      if (scan) {
        res.json({
          message: "Scan successfully found.",
          scan
        });
      } else {
        res.status(404).json({
          message: "Scan not found. Please try again later.",
          error: "ERR_SCAN_NOT_FOUND"
        });
      }
    } catch (error) {
      console.warn(error);
      next(error);
    }
  } else {
    const error = new Error("Invalid Scan ID");
    next(error);
  }
};
