const mongoose = require("mongoose");
const moment = require("moment");

// Validation
const { checkDate } = require("../../../validation/date");
const { mongoIdRgx } = require("../../../validation/regex");

// Aggregates
const getDaysAgg = require("../../../lib/Aggregates/Days/getDaysAgg.js");
const getEventsByTaskAgg = require("../../../lib/Aggregates/Days/getEventsByTaskAgg.js");
const getTasksAgg = require("../../../lib/Aggregates/Tasks/getTasksAgg.js");

// Helpers
const {
  getTasksAggrCond
} = require("../../../lib/Helpers/getTasksAggrCond.js");

// @route   GET /stats/day?start=startDate&end=endDate&total=true
// @desc    Get booking stats by day
exports.getDays = async (req, res, next) => {
  try {
    if (!req.query.start) throw new Error("ERR_START_DATE_REQUIRED");

    const start = checkDate(req.query.start);
    const end = checkDate(req.query.end) || moment().format();
    const total = req.query.total == "true";

    if (!start) throw new Error("ERR_DATE_FORMAT_INVALID");

    const stats = await getDaysAgg(start, end, total);

    if (stats.length) {
      res.json({
        message: "Status report successfully created!",
        count: stats.length,
        stats
      });
    } else {
      res.status(404);
      throw new RangeError("ERR_NO_DAYS_FOUND");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @route   GET /stats/task?start=startDate&end=endDate&id=taskId
// @desc    Get booking stats by task
exports.getEventsByTask = async (req, res, next) => {
  try {
    if (!req.query.id) throw new Error("ERR_TASK_ID_REQUIRED");

    const taskId = mongoIdRgx.test(req.query.id) && req.query.id;
    if (!taskId) throw new Error("ERR_TASK_IDENTIFIER_INVALID");

    const start = checkDate(req.query.start);
    const end = checkDate(req.query.end) || moment().format();

    if (!start) throw new Error("ERR_DATE_FORMAT_INVALID");

    const stats = await getEventsByTaskAgg(start, end, taskId);

    if (stats.length) {
      res.json({
        message: "Status report successfully created!",
        count: stats.length,
        stats
      });
    } else {
      res.status(404);
      throw new RangeError("ERR_NO_EVENTS_FOUND");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @route   GET /stats/tasks
// @desc    Get tasks
exports.getTasks = async (req, res, next) => {
  try {
    const skip = parseInt(req.query.skip) || 0;
    if (skip % 50) throw new Error("ERR_INVALID_SKIP_VALUE");
    // Include done query param if included, otherwise omit it
    const done =
      typeof req.query.done === "string" ? req.query.done == "true" : null;

    const { stats, docs } = await getTasksAggrCond(
      {
        skip,
        ownerId: mongoose.Types.ObjectId(req.user._id),
        done,
        column: req.query.column
      },
      getTasksAgg
    );

    if (docs.length) {
      res.json({
        message: "Status report successfully created!",
        stats,
        docs
      });
    } else {
      res.status(404);
      throw new RangeError("ERR_NO_TASKS_FOUND");
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
};
