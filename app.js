const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

// Config
const {
  NODE_ENV,
  corsOptions,
  rateLimitOptions
} = require("./src/config/config.js");

// Connect to Database
const { connectDB } = require("./src/config/db");
connectDB();

// Middleware imports
const { checkUser } = require("./src/middlewares/users/checkUser");
const checkScan = require("./src/middlewares/scans/checkScan");

const app = express();
app.disable("etag");
app.set("trust-proxy", 1); // Enable rate limit behind proxies such as Heroku

// Middleware
app.use(helmet());
app.use(cors(corsOptions()));
app.use(rateLimit(rateLimitOptions()));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(checkUser);
app.use(checkScan);
if (NODE_ENV() === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

// Widget route
app.use("/v1/w", express.static(path.join(__dirname, "src/widget/build")));

// Home route
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    statusCode: 200,
    user: req.user
  });
});

// Routes
app.use(`/`, require(`./src/routes.js`));

// Error handlers
function notFound(req, res, next) {
  res.status(404);
  const error = new Error("Not Found - " + req.originalUrl);
  next(error);
}

function errorHandler(error, req, res, next) {
  // Create error payload
  const payload = {
    message: error.message,
    error
  };
  // Handle Axios errors
  if (error.isAxiosError)
    payload.message = "An error occurred while fetching the data.";
  // If in development, send error stack
  if (NODE_ENV() === "development") payload.stack = error.stack;
  if (error instanceof RangeError) res.status(404);
  res.statusCode === 200 ? res.status(500) : res.statusCode;
  res.json(payload);
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
