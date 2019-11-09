const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const { checkUser } = require("./middleware/checkUser");

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: true,
    credentials: true,
    optionsSuccessStatus: 204
  })
);
app.use(morgan("dev"));
app.use(express.json({ extended: true }));
app.use(checkUser);

// Current api version in use
const v = "v1";

// Home route
app.get("/", (req, res, next) => {
  res.json({
    message: "Wellcome!",
    user: req.user
  });
});

// Routes imports
const usersRoutes = require(`./routes/${v}/users`);
const projectsRoutes = require(`./routes/${v}/projects`);
const tasksRoutes = require(`./routes/${v}/tasks`);
const linksRoutes = require(`./routes/${v}/links`);
const notesRoutes = require(`./routes/${v}/notes`);

// Routes
app.use(`/${v}/auth`, usersRoutes);
app.use("/projects", projectsRoutes);
app.use("/tasks", tasksRoutes);
app.use("/links", linksRoutes);
app.use("/notes", notesRoutes);

// Error handlers
function notFound(req, res, next) {
  res.status(404);
  const error = new Error("Not Found - " + req.originalUrl);
  next(error);
}

function errorHandler(error, req, res, next) {
  res.status(res.statusCode || 500);
  res.json({
    message: error.message,
    error
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));
