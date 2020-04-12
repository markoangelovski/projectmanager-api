const path = require("path");
const router = require("express").Router();
const axios = require("axios");
const moment = require("moment");

// Models
const Locale = require("../../models/locale");
const Scan = require("../../models/scan");

// Middlewares
const { hasBody } = require("../../middleware/checkUser");

// Validation
const { urlRgx } = require("../../validation/regex");

// GTM Functions
const gtmParser = require("../../lib/GTM/gtmParser");
const gtmCompare = require("../../lib/GTM/gtmCompare");
const gtmScanner = require("../../lib/GTM/gtmScanner");

// Reporting Functions
const {
  createScansReport,
  getDates
} = require("../../lib/Reports/createScansReport");
const {
  createLocalesReport
} = require("../../lib/Reports/createLocalesReport");

// @route   POST /locales
// @desc    Create a new locale
router.post("/", async (req, res, next) => {
  if (urlRgx.test(req.body.url)) {
    try {
      const locale = new Locale(req.body);
      const savedLocale = await locale.save();
      if (savedLocale) {
        res.status(201).json({
          message: `Locale ${locale.title} susscessfully saved!`,
          locale
        });
      } else {
        const error = new Error("An error occurred while saving the locale.");
        next(error);
      }
    } catch (error) {
      console.warn(error);
      next(error);
    }
  } else {
    res.status(400).json({
      message: "URL not valid",
      error: "INVALID_URL"
    });
  }
});

// @route   GET /locales
// @desc    Get locales by query params
router.get("/", async (req, res, next) => {
  try {
    const locales = await Locale.find(req.query);

    if (locales.length) {
      res.status(200).json({
        message: `Locales susscessfully fetched!`,
        count: locales.length,
        locales
      });
    } else {
      res.status(404).json({
        message: "No Locales found that match this condition.",
        error: "ERR_LOCALES_NOT_FOUND"
      });
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
});

// @route   PATCH /locales
// @desc    Update single Locale values
router.patch("/", hasBody, async (req, res, next) => {
  const localeUrl = req.body.url;

  if (localeUrl && urlRgx.test(localeUrl)) {
    try {
      const locale = await Locale.findOne({ url: localeUrl });

      if (locale) {
        // Iterate over req.body and update the values in locale
        for (const key in req.body) {
          if (req.body.hasOwnProperty(key)) {
            locale[key] =
              req.body[key].length > 1 ? req.body[key] : delete locale[key];
          }
        }

        const savedLocale = await locale.save();

        res.json({
          message: `Locale ${savedLocale.title} updated successfully!`,
          locale: savedLocale
        });
      } else {
        res.status(404).json({
          message: "Locale not found.",
          error: "LOCALE_NOT_FOUND"
        });
      }
    } catch (error) {
      console.warn(error);
      next(error);
    }
  } else if (localeUrl && !urlRgx.test(localeUrl)) {
    res.status(400).json({
      message: "Please enter valid locale URL.",
      error: "INVALID_URL"
    });
  }
});

// @route   POST /locales/scan
// @desc    Initiate scan
router.post("/scan", async (req, res, next) => {
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
      // Get locales
      const locales = await Locale.find().select("title url favicon GTM");

      // Generate Scan ID for fetching the scan later
      const scanID = Math.floor(10000 + Math.random() * 90000);

      // Send a scan link to the user
      res.json({
        message: `Scan initiated.`,
        result: `https://${req.get("host")}/v1/locales/scan/${scanID}`
      });

      // Initiate scan
      const scanResult = await gtmScanner(locales);

      const scan = new Scan({
        scanID,
        ...scanResult
      });

      scan.save();
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
});

// @route   GET /locales/scan?url=https://www.locale.com || ?start=startDate&end=endDate
// @desc    Initiate single locale scan or fetch all scans
router.get("/scan", async (req, res, next) => {
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
});

// @route   GET /locales/scan/:scanID
// @desc    Get single scan by Scan ID
router.get("/scan/:scanID", async (req, res, next) => {
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
});

// @route   GET /locales/report
// @desc    Get locales or scans report in CSV, XLSX or JSON format
router.get("/report", async (req, res, next) => {
  try {
    const format = req.query.format && req.query.format.toLowerCase().trim();
    const type = req.query.type && req.query.type.toLowerCase().trim();

    const sendResponse = report => {
      if (typeof report === "string") {
        // Respond with a report in file format
        res.download(
          path.resolve(__dirname + "../../../reports/" + report),
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
      const { start, end } = getDates(req.query.start, req.query.end);

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
});

module.exports = router;
