const express = require("express");

const router = express.Router();

// Models
const Project = require("../../models/project");

// @route   POST /projects
// @desc    Create a new project
router.post("/", async (req, res, next) => {
  try {
    const project = new Project(req.body);
    project.owner = req.user;
    await project.save();
    res.status(201).json({
      message: `Project ${project.title} successfully created!`,
      project
    });
  } catch (error) {
    console.error(error.message);
    res.status(500);
    next(error);
  }
});

// @route   GET /projects
// @desc    Get all projects
router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find({ owner: req.user._id }).populate(
      "tasks"
    );

    if (projects.length > 0) {
      res.status(200).json({
        projectCount: projects.length,
        projects
      });
    } else {
      res.status(200).json({
        projectCount: 0,
        projects: []
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500);
    next(error);
  }
});

// @route   PATCH /projects/:projectId
// @desc    Update project

// @route   DELETE /projects/:projectId
// @desc    Delete a project
router.delete("/:projectId", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    const isOwner = project.owner == req.user._id;
    if (project && isOwner) {
      const deletedProject = await project.remove();
      res.status(200).json({
        message: `Project "${deletedProject.title}" successfully deleted!`,
        deletedProject
      });
    } else {
      res.status(404).json({
        message: "Project not found!"
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500);
    next(error);
  }
});

module.exports = router;
