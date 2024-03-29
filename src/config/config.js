require("dotenv").config();

const NODE_ENV = process.env.NODE_ENV;
const NODE_ORIGIN = process.env.NODE_ORIGIN;
const DB = process.env.DB_URI;
const TEST_DB = process.env.TEST_DB;
const JWT = process.env.JWT_KEY;
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD;

const corsOptions = {
  origin: new RegExp(NODE_ORIGIN),
  credentials: true,
  exposedHeaders: "X-Auth",
  optionsSuccessStatus: 204
};

const rateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs,
  keyGenerator: function (req /*, res*/) {
    // Switched from default req.ip to req._ip to bypass proxy's ip
    return req._ip;
  },
  message: {
    error: "ERR_RATE_LIMIT_REACHED",
    message: `Rate limit reached, please try again later.`
  }
};

module.exports = Object.freeze({
  NODE_ENV: () => NODE_ENV,
  DB: () => DB,
  TEST_DB: () => TEST_DB,
  JWT: () => JWT,
  DEFAULT_ADMIN_PASSWORD: () => DEFAULT_ADMIN_PASSWORD,
  corsOptions: () => corsOptions,
  rateLimitOptions: () => rateLimitOptions
});
