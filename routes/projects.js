const express = require("express");

const router = express.Router();

// Models
const Project = require("./../models/project");

// @route   POST /projects
// @desc    Create a new project
router.post("/", async (req, res) => {
  try {
    const project = new Project(req.body);
    await project.save();
    res.status(201).json({
      message: "Project successfully created!",
      project
    });
  } catch (error) {
    console.warn(error);
    res.status(500).json({
      error
    });
  }
});

// @route   GET /projects
// @desc    Get all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().populate("tasks");

    if (projects.length > 0) {
      res.status(200).json({
        projectCount: projects.length,
        projects
      });
    } else {
      res.status(404).json({
        message: "No projects found!"
      });
    }
  } catch (error) {
    console.warn(error);
    res.status(500).json({
      error
    });
  }
});

module.exports = router;
