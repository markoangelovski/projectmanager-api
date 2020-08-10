const moment = require("moment");

// Validation
const { checkDate } = require("../../../validation/date");
const { mongoIdRgx } = require("../../../validation/regex");

// Aggregates
const byDay = require("../../../lib/Aggregates/byDay");
const byTask = require("../../../lib/Aggregates/byTask");

// @route   GET /stats/day?start=startDate&end=endDate&total=true
// @desc    Get booking stats by day
exports.byDay = async (req, res, next) => {
  try {
    if (!req.query.start) throw new Error("ERR_START_DATE_REQUIRED");

    const start = checkDate(req.query.start);
    const end = checkDate(req.query.end) || moment().format();
    const total = req.query.total == "true";

    if (!start) throw new Error("ERR_DATE_FORMAT_INVALID");

    const stats = await byDay(start, end, total);

    if (stats.length) {
      res.json({
        message: "Status report successfully created!",
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
exports.byTask = async (req, res, next) => {
  try {
    if (!req.query.id) throw new Error("ERR_TASK_ID_REQUIRED");

    const taskId = mongoIdRgx.test(req.query.id) && req.query.id;
    if (!taskId) throw new Error("ERR_TASK_IDENTIFIER_INVALID");

    const start = checkDate(req.query.start);
    const end = checkDate(req.query.end) || moment().format();

    if (!start) throw new Error("ERR_DATE_FORMAT_INVALID");

    const stats = await byTask(start, end, taskId);

    if (stats.length) {
      res.json({
        message: "Status report successfully created!",
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
