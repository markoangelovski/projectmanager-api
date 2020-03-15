const express = require("express");
const axios = require("axios");
const moment = require("moment");

const router = express.Router();

// Models
const Locale = require("../../models/locale");
const Scan = require("../../models/scan");

// Validation
const { urlRgx } = require("../../validation/regex");

// GTM Functions
const gtmParser = require("../../lib/GTM/gtmParser");
const gtmCompare = require("../../lib/GTM/gtmCompare");

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

// @route POST /locales/scan
// @desc Initiate scan
router.post("/scan", async (req, res, next) => {
  try {
    // Check if the scan for today has been performed
    const scan = await Scan.findOne({
      createdAt: {
        $gte: moment()
          .startOf("day")
          .format(),
        $lte: moment()
          .endOf("day")
          .format()
      }
    });

    if (scan) {
      res.status(400).json({
        message:
          "Scan for today has already been performed. Please try again tomorrow.",
        error: "SCAN_PERFORMED"
      });
    } else {
      // Get locales
      const locales = await Locale.find().select("title url favicon GTM");

      // Initiate counters
      let localesScanned = 0;
      let totalMissingKeys = 0;
      let totalErrors = 0;
      const stats = [];
      const scanStart = new Date();

      // Iterate over each locale and perform scanning
      for (const locale of locales) {
        const { title, url, favicon, GTM: previousGtm } = locale;

        const { data } = await axios.get(url);

        const scannedGtm = gtmParser(data);
        const result = gtmCompare(previousGtm, scannedGtm);

        const res = {
          title,
          url,
          favicon,
          result
        };

        if (result.hasMissingKeys || result.hasErrors) {
          result.hasMissingKeys && totalMissingKeys++;
          result.hasErrors && totalErrors++;
          stats.push(res);
        }
        localesScanned++;
      }

      const scanDurationMs = new Date() - scanStart;

      const scan = new Scan({
        localesScanned,
        totalMissingKeys,
        totalErrors,
        scanDurationMs,
        stats
      });

      const savedScan = await scan.save();

      res.json({
        message: "Scan successfully completed.",
        result: savedScan
      });
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
});

// @route   GET /locales
// @desc    Get all locales
router.get("/", async (req, res, next) => {
  try {
    const locales = await Locale.find();

    res.status(200).json({
      message: `Locales susscessfully fetched!`,
      locales
    });
  } catch (error) {
    console.warn(error);
    next(error);
  }
});

// @route GET /locales/scan?locale=https://www.locale.com
// @desc Initiate single locale scan
router.get("/scan", async (req, res, next) => {
  const localeUrl = req.query.locale;

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
      error: "INVALID_URL"
    });
  } else if (!localeUrl) {
    res.status(400).json({
      message: "Please enter valid locale query.",
      error: "INVALID_QUERY"
    });
  }
});

module.exports = router;
