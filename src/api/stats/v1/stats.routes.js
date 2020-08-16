const router = require("express").Router();

// Middlewares
// const {  } = require("../../../middlewares/");

// Controllers
const { getDays, getEventsByTask, getTasks } = require("./stats.controller.js");

// @route   GET /stats/day?start=startDate&end=endDate&total=true
// @desc    Get booking stats by day
router.get("/day", getDays);

// @route   GET /stats/task?id=taskId
// @desc    Get booking stats by task
router.get("/task", getEventsByTask);

// @route   GET /stats/task?id=taskId
// @desc    Get booking stats by task
router.get("/tasks", getTasks);

module.exports = router;
