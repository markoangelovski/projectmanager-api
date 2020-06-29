const router = require("express").Router();

// Middlewares
const { hasBody } = require("../../../middlewares/users/checkUser");

// Controllers
const {
  postProject,
  getProjects,
  patchProject,
  deleteProject
} = require("./projects.controller.js");

// @route   POST /projects
// @desc    Create a new project
router.post("/", hasBody, postProject);

// @route   GET /projects
// @desc    Get all projects
router.get("/", getProjects);

// @route   PATCH /projects
// @desc    Edit projects
router.patch("/:projectId", hasBody, patchProject);

// @route   DELETE /projects/:projectId
// @desc    Delete projects
router.delete("/:projectId", deleteProject);

module.exports = router;
