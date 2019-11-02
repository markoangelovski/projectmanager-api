const express = require("express");

const router = express.Router();

// Models
const Project = require("../models/project");
const Task = require("../models/task");

// @route   POST /tasks
// @desc    Create a new task
router.post("/", async (req, res) => {
  try {
    const task = new Task(req.body);
    if (task.column === "undefined") task.column = "Upcoming";
    const project = await Project.findById(req.body.project);
    if (project) {
      project.tasks.push(task._id);

      project.save();

      task.save();

      res.status(201).json({
        message: "Task successfully created!",
        task
      });
    } else {
      res.status(404).json({
        message: "Project not found!"
      });
    }
  } catch (error) {
    console.warn(error);
    res.status(500).json({
      error
    });
  }
});

// @route   GET /tasks
// @desc    Get all tasks
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("project", "title")
      .populate("links");

    if (tasks.length > 0) {
      res.status(200).json({
        taskCount: tasks.length,
        tasks
      });
    } else {
      res.status(200).json({
        taskCount: 0,
        tasks: []
      });
    }
  } catch (error) {
    console.warn(error);
    res.status(500).json({
      error
    });
  }
});

// @route   PATCH /tasks
// @desc    Update task
router.patch("/:taskId", async (req, res) => {
  try {
    const id = req.params.taskId;
    const updateOps = {};

    for (const ops of req.body) {
      updateOps[ops.propName] = ops.value;
    }

    const task = await Task.updateOne({ _id: id }, { $set: updateOps });

    if (task.n == 1) {
      res.status(200).json({
        message: "Task successfully updated!"
      });
    } else {
      res.status(404).json({
        message: "Task not found!"
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
