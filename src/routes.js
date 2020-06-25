const router = require("express").Router();

// Middleware imports
const { checkApiKey } = require("./middlewares/users/checkApiKey");
const { isLoggedIn } = require("./middlewares/users/checkUser");

// Users
router.use("/v1/auth", require("./api/users/v1/users.routes"));

// Days & Events
router.use("/v1/days", isLoggedIn, require("./api/days/v1/days.routes"));

// Locales
router.use(
  "/v1/locale",
  checkApiKey,
  require("./api/locales/v1/locales.routes")
);

// Reports
router.use(
  "/v1/report",
  checkApiKey,
  require("./api/reports/v1/reports.routes")
);

// Scans
router.use("/v1/scan", checkApiKey, require("./api/scans/v1/scans.routes"));

// Docs
router.use("/v1/docs", require("./api/docs/v1/docs.routes"));

module.exports = router;
