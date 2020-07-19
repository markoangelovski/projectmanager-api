// Model imports
const Project = require("../../projects/v1/projects.model");
const Task = require("./tasks.model");

// Validation
const { mongoIdRgx } = require("../../../validation/regex");
const { taskSchema, taskUpdateSchema } = require("../../../validation/task");

// Helper functions
const {
  getQueryConditions
} = require("../../../lib/Helpers/getQueryConditions");

// @route   POST /tasks
// @desc    Create a new task
// Request JSON body:
// {
//     "title": "Task title"
//     "description": ""
//     "pl": "John Doe"
//     "column": "Upcoming"
//     "dueDate": "2020-06-29"
//     "kanboard": ""
//     "nas": ""
//     "project": "ProjectId"
//     "done": "true"
// }
exports.postTask = async (req, res, next) => {
  try {
    const projectId = mongoIdRgx.test(req.body.project) && req.body.project;
    if (!projectId) throw new Error("ERR_PROJECT_IDENTIFIER_INVALID");

    const result = taskSchema.validate(req.body);
    if (result.error) throw new Error(result.error);

    const project = await Project.findById(result.value.project);

    if (project) {
      const task = new Task({ owner: req.user, ...result.value });
      const savedTask = await task.save();

      res.status(201).json({
        message: `Task ${task.title} successfully created!`,
        task: savedTask
      });

      // Trigger project.save to recalculate project's task count
      project
        .save()
        .then(res => null)
        .catch(err => console.warn(err));
    } else {
      throw new RangeError("ERR_PROJECT_NOT_FOUND");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @route   GET /tasks?task=taskId
// @desc    Get single task middleware function
exports.getSingleTask = async (req, res, next) => {
  if (req.query.task) {
    try {
      const taskId = mongoIdRgx.test(req.query.task) && req.query.task;
      if (!taskId) throw new Error("ERR_TASK_IDENTIFIER_INVALID");

      const task = await Task.findOne({ owner: req.user, _id: taskId });

      if (task) {
        res.status(200).json({
          message: `Task ${task.title} successfully found!`,
          task
        });
      } else {
        res.status(404).json({
          error: "ERR_TASK_NOT_FOUND",
          message: "Task not found"
        });
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  } else {
    next();
  }
};

// @route   GET /tasks?project=projectId
// @desc    Get tasks by project middleware function
exports.getTasksByProject = async (req, res, next) => {
  if (req.query.project) {
    try {
      const projectId = mongoIdRgx.test(req.query.project) && req.query.project;
      if (!projectId) throw new Error("ERR_TASK_IDENTIFIER_INVALID");

      const { stats, docs } = await getQueryConditions(req, Task, {
        project: projectId
      });

      if (stats && stats.total) {
        res.status(200).json({
          message: "Tasks successfully found!",
          stats,
          tasks: docs
        });
      } else {
        throw new RangeError("ERR_NO_TASKS_FOUND");
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  } else {
    next();
  }
};

// @route   GET /tasks
// @desc    Get all tasks
exports.getTasks = async (req, res, next) => {
  try {
    const { stats, docs } = await getQueryConditions(req, Task);

    /** Include the following section if Notes need to be returned on GET Tasks call
 // Find all notes for each task
 const notesArr = await Promise.all(
   Array.from({ length: tasks.length }, (_, i) =>
   Note.find({ task: tasks[i] })
   .then(res => res)
   .catch(err => console.warn(err)))); */

    if (stats && stats.total) {
      res.status(200).json({
        message: "Tasks successfully fetched!",
        stats,
        tasks: docs
        /** Include the following section if Notes need to be returned on GET Tasks call
         tasks: docs.map((task, i) => ({
           ...task.toJSON(),
           notes: notesArr[i].map(note => note._id)
          }))
    */
      });
    } else {
      throw new RangeError("ERR_NO_TASKS_FOUND");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @route   PATCH /tasks/:taskId
// @desc    Update task
// Request JSON body, array of values to be updated:
// [{"propName": "title", "propValue": "Updated title"},
//  {"propName": "description", "propValue": "Updated Description value"}]
exports.patchTask = async (req, res, next) => {
  try {
    const taskId = mongoIdRgx.test(req.params.taskId) && req.params.taskId;
    if (!taskId) throw new Error("ERR_TASK_IDENTIFIER_INVALID");

    const result = taskUpdateSchema.validate(req.body);
    if (result.error) throw new Error(result.error);

    const updateOps = {};
    for (const ops of result.value) {
      ops.propValue ? (updateOps[ops.propName] = ops.propValue) : null;
    }
    if (updateOps.done) updateOps.done = updateOps.done == "true";

    const task = await Task.findOneAndUpdate(
      { _id: taskId, owner: req.user._id },
      { $set: updateOps },
      { new: true }
    );

    if (task) {
      // Trigger Project.save() to recalculate the number of tasks in the project
      Project.findById(task.project)
        .then(project =>
          project
            .save()
            .then(pro => null)
            .catch(err => console.warn(err))
        )
        .catch(err => console.warn(err));

      res.status(201).json({
        message: `Task ${task.title} successfully updated!`,
        task
      });
    } else {
      throw new RangeError("ERR_TASK_NOT_FOUND");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @route   DELETE /tasks/:taskId
// @desc    Delete a task
exports.deleteTask = async (req, res, next) => {
  try {
    const taskId = mongoIdRgx.test(req.params.taskId) && req.params.taskId;
    if (!taskId) throw new Error("ERR_TASK_IDENTIFIER_INVALID");

    const task = await Task.findOneAndDelete({
      _id: taskId,
      owner: req.user._id
    });

    if (task) {
      // Trigger Project.save() to recalculate the number of tasks in the project
      const project = await Project.findById(task.project);
      const savedProject = await project.save();

      res.status(200).json({
        message: `Task ${task.title} successfully deleted!`,
        project: savedProject
      });
    } else {
      throw new RangeError("ERR_TASK_NOT_FOUND");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};
