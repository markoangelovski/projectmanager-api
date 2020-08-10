const router = require("express").Router();

// Middlewares
// const {  } = require("../../../middlewares/");

// Controllers
const { byDay, byTask } = require("./stats.controller.js");

// @route   GET /stats/day?start=startDate&end=endDate&total=true
// @desc    Get booking stats by day
router.get("/day", byDay);

// @route   GET /stats/task?id=taskId
// @desc    Get booking stats by task
router.get("/task", byTask);

module.exports = router;
