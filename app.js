const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

require("dotenv").config();

const { connectDB } = require("./config/db");
const { checkUser, isLoggedIn } = require("./middleware/checkUser");

const app = express();

// Connect to Database
connectDB();

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
app.use(`/${v}/auth`, require(`./routes/${v}/users`));
app.use(`/${v}/projects`, isLoggedIn, require(`./routes/${v}/projects`));
app.use(`/${v}/tasks`, isLoggedIn, require(`./routes/${v}/tasks`));
app.use(`/${v}/links`, isLoggedIn, require(`./routes/${v}/links`));
app.use(`/${v}/notes`, isLoggedIn, require(`./routes/${v}/notes`));
app.use(`/${v}/days`, isLoggedIn, require(`./routes/${v}/days`));
app.use(`/${v}/locales`, isLoggedIn, require(`./routes/${v}/locales`));

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
  // If in development, send error stack
  process.env.NODE_ENV === "development" ? (payload.stack = error.stack) : null;
  if (error instanceof RangeError) res.status(404);
  res.statusCode === 200 ? res.status(500) : res.statusCode;
  res.json(payload);
}

app.use(notFound);
app.use(errorHandler);

module.exports = app;
