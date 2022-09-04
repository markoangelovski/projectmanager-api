const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const requestIp = require("@supercharge/request-ip");

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
const {
  checkUser,
  getClientIp /*
  responseTime, // intended for Analyitics functionality*/
} = require("./src/middlewares/users/checkUser");
const checkScan = require("./src/middlewares/scans/checkScan");
// const { checkSource } = require("./src/middlewares/analyitcs/checkSource.js"); // Analyitcs middleware

const app = express();

app.disable("etag");

app.use(getClientIp); // Get req.ip address middleware. Needs to be set up before "trust-proxy" to catch actual client ip and not the proxy ip

app.set("trust-proxy", 1); // Enable rate limit behind proxies such as Heroku

// Middleware
// app.use(responseTime());// intended for Analyitics functionality
app.use(helmet());
app.use(cors(corsOptions()));
app.use(rateLimit(rateLimitOptions()));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Custom middlewares
app.use(checkUser);
app.use(getClientIp);
app.use(checkScan);
// app.use(checkSource); // Analyitcs middleware for setting agaId cookie on Postman
if (NODE_ENV() === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

// Widget route
app.use("/v1/w", express.static(path.join(__dirname, "src/widget/build")));

// Home route
app.get("/", (req, res) => {
  res.json({
    updatedAt: "2022-09-04T08:19:25.906Z",
    status: "OK",
    statusCode: 200,
    user: req.user,
    ip: req._ip
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
