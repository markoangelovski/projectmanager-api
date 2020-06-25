const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

// Connect to Database
const { connectDB } = require("./src/config/db");
connectDB();

// Middleware imports
const { checkUser, isLoggedIn } = require("./src/middlewares/users/checkUser");
const checkScan = require("./src/middlewares/scans/checkScan");

const app = express();
app.disable("etag");

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: process.env.NODE_ORIGIN,
    credentials: true,
    optionsSuccessStatus: 204
  })
);
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs,
    message: {
      error: "ERR_RATE_LIMIT_REACHED",
      message: `Rate limit reached, please try again later.`
    }
  })
);
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(checkUser);
app.use(checkScan);
if (process.env.NODE_ENV === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

// Home route
app.get("/", (req, res, next) => {
  res.json({
    status: "OK",
    statusCode: 200,
    user: req.user
  });
});

// Current api version in use
const v = "v1";

// Routes
app.use(`/${v}/projects`, isLoggedIn, require(`./routes/${v}/projects`));
app.use(`/${v}/tasks`, isLoggedIn, require(`./routes/${v}/tasks`));
app.use(`/${v}/links`, isLoggedIn, require(`./routes/${v}/links`));
app.use(`/${v}/notes`, isLoggedIn, require(`./routes/${v}/notes`));
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
  if (process.env.NODE_ENV === "development") payload.stack = error.stack;
  if (error instanceof RangeError) res.status(404);
  res.statusCode === 200 ? res.status(500) : res.statusCode;
  res.json(payload);
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
