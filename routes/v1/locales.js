const express = require("express");

const router = express.Router();

// Models
const Locale = require("../../models/locale");

// Validation
const { urlRgx } = require("../../validation/regex");

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

module.exports = router;
