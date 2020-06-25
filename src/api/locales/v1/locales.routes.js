const router = require("express").Router();

// Controllers
const { postLocale, getLocale, patchLocale } = require("./locales.controller");

// Middlewares
const { hasBody } = require("../../../middlewares/users/checkUser");
const { isApiAdmin } = require("../../../middlewares/users/checkApiKey");

// @route   POST /locales
// @desc    Create a new locale
router.post("/", isApiAdmin, hasBody, postLocale);

// @route   GET /locales
// @desc    Get locales by query params
router.get("/", getLocale);

// @route   PATCH /locales
// @desc    Update single Locale values
router.patch("/", isApiAdmin, hasBody, patchLocale);

module.exports = router;
