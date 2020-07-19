const router = require("express").Router();

// Middlewares
const { hasBody } = require("../../../middlewares/users/checkUser");

// Controllers
const {
  postTask,
  getSingleTask,
  getTasksByProject,
  getTasks,
  patchTask,
  deleteTask
} = require("./tasks.controller.js");

// @route   POST /tasks
// @desc    Create a new task
router.post("/", hasBody, postTask);

// @route   GET /tasks
// @desc    Get single or all tasks
router.get("/", getSingleTask, getTasksByProject, getTasks);

// @route   PATCH /tasks
// @desc    Edit task
router.patch("/:taskId", hasBody, patchTask);

// @route   DELETE /tasks/:taskId
// @desc    Delete tasks
router.delete("/:taskId", deleteTask);

module.exports = router;
