const express = require("express");

const router = express.Router();

// Models
const Project = require("../../models/project");
const Task = require("../../models/task");

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
    console.error(error.message);
    res.status(500).json({
      message: `Service connection error ocurred: ${error.message}`,
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
      .populate("links")
      .populate("notes");

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
    console.error(error.message);
    res.status(500).json({
      message: `Service connection error ocurred: ${error.message}`,
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
    console.error(error.message);
    res.status(500).json({
      message: `Service connection error ocurred: ${error.message}`,
      error
    });
  }
});

// @route   DELETE /tasks/:taskId
// @desc    Delete a project
router.delete("/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    const project = task ? await Project.findById(task.project._id) : null;
    if (task || project) {
      project.tasks = project.tasks.filter(
        task => task._id != req.params.taskId
      );
      const [deletedTask, updatedProject] = await Promise.all([
        task.remove(),
        project.save()
      ]);

      res.status(200).json({
        message: `Task "${deletedTask.title}" successfully deleted!`,
        project: updatedProject
      });
    } else {
      res.status(404).json({
        message: "Project or task not found!"
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: `Service connection error ocurred: ${error.message}`,
      error
    });
  }
});

module.exports = router;
