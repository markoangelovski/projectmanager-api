// Models
const Locale = require("./locales.model");

// Validation
const { urlRgx } = require("../../../../validation/regex");

// @route   POST /locales
// @desc    Create a new locale
exports.postLocale = async (req, res, next) => {
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
};

// @route   GET /locales
// @desc    Get locales by query params
exports.getLocale = async (req, res, next) => {
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
};

// @route   PATCH /locales
// @desc    Update single Locale values
exports.patchLocale = async (req, res, next) => {
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
};
