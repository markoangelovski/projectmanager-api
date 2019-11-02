const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// Connect to Database
connectDB();

// Middleware
app.use(cors());
app.use(morgan("dev"));
app.use(express.json({ extended: true }));

// Routes imports
const projectsRoutes = require("./routes/projects");
const tasksRoutes = require("./routes/tasks");
const linksRoutes = require("./routes/links");

// Routes
app.use("/projects", projectsRoutes);
app.use("/tasks", tasksRoutes);
app.use("/links", linksRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}!`));
