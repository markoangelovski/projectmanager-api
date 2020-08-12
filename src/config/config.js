require("dotenv").config();

const NODE_ENV = process.env.NODE_ENV;
const NODE_ORIGIN = process.env.NODE_ORIGIN;
const DB = process.env.DB;
const TEST_DB = process.env.TEST_DB;
const JWT = process.env.JWT;
const DEFAULT_ADMIN_PASSWORD = process.env.DEFAULT_ADMIN_PASSWORD;

const corsOptions = {
  origin: new RegExp(NODE_ORIGIN),
  credentials: true,
  optionsSuccessStatus: 204
};

const rateLimitOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs,
  message: {
    error: "ERR_RATE_LIMIT_REACHED",
    message: `Rate limit reached, please try again later.`
  }
};

module.exports = Object.freeze({
  NODE_ENV: () => NODE_ENV,
  NODE_ORIGIN: () => NODE_ORIGIN,
  DB: () => DB,
  TEST_DB: () => TEST_DB,
  JWT: () => JWT,
  DEFAULT_ADMIN_PASSWORD: () => DEFAULT_ADMIN_PASSWORD,
  corsOptions: () => corsOptions,
  rateLimitOptions: () => rateLimitOptions
});
