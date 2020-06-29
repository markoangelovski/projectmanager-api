const express = require("express");

const router = express.Router();

// Models
// const Project = require("../../models/project");
const Project = require("../../src/api/projects/v1/projects.model");
const Task = require("../../models/task");

// @route   POST /tasks
// @desc    Create a new task
router.post("/", async (req, res, next) => {
  try {
    const project = await Project.findById(req.body.project);

    if (project) {
      req.body.dueDate = parseInt(new Date(req.body.dueDate).getTime());
      const task = new Task(req.body);
      task.owner = req.user;

      if (task.column === "undefined") task.column = "Upcoming";
      project.tasks.push(task._id);
      let [savedProject, savedTask] = await Promise.all([
        project.save(),
        task.save()
      ]);

      res.status(201).json({
        message: `Task ${task.title} successfully created!`,
        task: savedTask
      });
    } else {
      res.status(404);
      const error = new Error(
        "Project for which you are trying to create a task was not found."
      );
      next(error);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500);
    next(error);
  }
});

// @route   GET /tasks?task=taskId
// @desc    Get single task
const getSingleTask = async (req, res, next) => {
  if (req.query.task) {
    try {
      let taskId = /^[a-f\d]{24}$/i.test(req.query.task) && req.query.task;
      if (!taskId) throw new Error("Task identifier invalid");

      const task = await Task.findOne({
        owner: req.user,
        _id: taskId
      }).populate("links");

      if (Object.keys(task).length > 0) {
        res.status(200).json({
          message: `Task ${task.title} successfully found!`,
          task
        });
      } else {
        res.status(404).json({
          error: "TASK_NOT_FOUND",
          message: "Task not found"
        });
      }
    } catch (error) {
      console.error(error.message);
      res.status(500);
      next(error);
    }
  } else {
    next();
  }
};

// @route   GET /tasks
// @desc    Get all tasks
router.get("/", getSingleTask, async (req, res, next) => {
  try {
    const tasks = await Task.find({ owner: req.user._id }).populate("links");

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
    res.status(500);
    next(error);
  }
});

// @route   PATCH /tasks
// @desc    Update task
router.patch("/:taskId", async (req, res, next) => {
  try {
    const id = req.params.taskId;
    const updateOps = {};

    for (const ops of req.body) {
      updateOps[ops.propName] = ops.value;
    }

    const task = await Task.updateOne(
      { _id: id, owner: req.user._id },
      { $set: updateOps }
    );
    const updatedTask = await Task.findOne({ _id: id, owner: req.user._id })
      .populate("owner", "avatar_url")
      .populate("project", "title")
      .populate("links")
      .populate("notes");

    if (!task.n) {
      res.status(404);
      const error = new Error("Task you are trying to edit was not found!");
      next(error);
    } else if (!task.nModified) {
      res.status(200).json({
        message: "No detail modifications detected. No actions taken.",
        task: updatedTask
      });
    } else if (task.nModified) {
      res.status(201).json({
        message: "Task successfully updated!",
        task: updatedTask
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500);
    next(error);
  }
});

// @route   DELETE /tasks/:taskId
// @desc    Delete a project
router.delete("/:taskId", async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      owner: req.user._id
    });
    const project = task
      ? await Project.findOne({ _id: task.project._id, owner: req.user._id })
      : null;
    if (task && project) {
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
      res.status(404);
      const error = new Error("Project or task not found!");
      next(error);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500);
    next(error);
  }
});

module.exports = router;
