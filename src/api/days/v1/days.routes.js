const router = require("express").Router();

// Middlewares
const { hasBody } = require("../../../middlewares/checkUser");

// Controllers
const {
  postEvent,
  getEventsByTask,
  getEventsByDay,
  getEventsByRange,
  patchEvent,
  deleteEvent,
  postLog,
  patchEventLog,
  deleteEventLog
} = require("./days.controller.js");

// @route   POST /event.create
// @desc    Create a new event
router.post("/event.create", postEvent);

// @route   GET /days/event.find?task=taskId&start=startDate&end=endDate&id=dayId
// @desc    Get all events for a requested Task ID, Day ID or requested range
router.get("/event.find", getEventsByTask, getEventsByDay, getEventsByRange);

// @route   PATCH /days/event.update/:eventId
// @desc    Edit events
router.patch("/event.update/:eventId", hasBody, patchEvent);

// @route   DELETE /days/:dayId/:eventId
// @desc    Delete events
router.delete("/event.delete/:dayId/:eventId", deleteEvent);

// @route   POST /log.create
// @desc    Create a new event
router.post("/log.create", postLog);

// @route   PATCH /days/log.update/:logId
// @desc    Edit event logs
router.patch("/log.update/:logId", /* hasBody, */ patchEventLog);

// @route   DELETE /days/log.delete/:logId
// @desc    Delete event log
router.delete("/log.delete/:logId", deleteEventLog);

module.exports = router;
