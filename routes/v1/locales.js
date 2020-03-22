const express = require("express");
const axios = require("axios");
const moment = require("moment");

const router = express.Router();

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

// @route   POST /locales/scan
// @desc    Initiate scan
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

// @route   GET /locales/scan?url=https://www.locale.com
// @desc    Initiate single locale scan
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
      const scans = await Scan.find();

      if (scans.length) {
        res.status(200).json({
          message: `Scans susscessfully fetched!`,
          count: scans.length,
          scans
        });
      } else {
        res.status(404).json({
          message: "No scans found.",
          error: "ERR_SCANS_NOT_FOUND"
        });
      }
    } catch (error) {
      console.warn(error);
      next(error);
    }
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
        // Iterate over req.query and update the values in locale
        for (const key in req.body) {
          if (req.body.hasOwnProperty(key)) {
            locale[key] = req.body[key];
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

module.exports = router;
