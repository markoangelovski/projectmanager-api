const express = require("express");
const router = express.Router();

// Model import
const Task = require("../../models/task");
const Day = require("../../models/day");

// @route   POST /events
// @desc    Create a new event
router.post("/", async (req, res, next) => {
  try {
    // Get Day's Task if it is passed
    const task = req.body.task
      ? await Task.findOne({ _id: req.body.task })
      : null;

    // Check if Day exists
    const day = await Day.findOne({
      day: req.body.day,
      owner: req.user
    });

    // Save day to task
    const saveToTask = async task => {
      // Check if Day exists in task
      const index = task
        ? task.days.findIndex(
            taskDay => JSON.stringify(taskDay) === JSON.stringify(day._id)
          )
        : null;
      if (index === -1) {
        task.days.push(day);
        await task.save();
      }
    };

    if (day) {
      // If day exists, add new event to its events array
      day.events.push(req.body.events[0]);
      const savedDay = await day.save();

      // Save day to task
      saveToTask(task);

      res.json({
        message: `Event ${req.body.events[0].title} successfully stored!`,
        event: savedDay
      });
    } else {
      // If day does not exist, create a new day
      // Create new Day instance
      const day = new Day(req.body);

      // Add owner
      day.owner = req.user;

      // Save the Day
      const savedDay = await day.save();

      // Save day to task
      saveToTask(task);

      res.status(201).json({
        message: `Event ${req.body.events[0].title} successfully stored!`,
        event: savedDay
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500);
    next(error);
  }
});

// @route   GET /events
// @desc    Get events
router.get("/", async (req, res, next) => {
  const start = new Date(req.query.start);
  const end = new Date(req.query.end);
  try {
    // Find days within the requested timeframe
    const days = await Day.find({
      date: { $gte: start, $lte: end },
      owner: req.user
    }).sort({ date: "desc" });

    if (days.length > 0) {
      res.json({
        message: "Event entries successfully found!",
        days
      });
    } else {
      throw new RangeError("No event entries found.");
    }
  } catch (error) {
    console.error(error.message);
    next(error);
  }
});

// @route   PATCH /events
// @desc    Edit events
// router.patch("/", async (req, res, next) => {})

// @route   DELETE /events/:day/:eventId
// @desc    Delete events
router.delete("/:day/:eventId", async (req, res, next) => {
  try {
    // Find event's Day
    const day = await Day.findOne({ day: req.params.day, owner: req.user });
    if (day) {
      // Remove Event from Day
      const index = day.events.findIndex(
        event => event._id == req.params.eventId
      );
      // Check if event exists and remove it
      if (index !== -1) {
        const eventTitle = day.events[index].title;
        day.events.splice(index, 1);

        // If any events are remaining, save the Day
        if (day.events.length >= 1) {
          const updatedDay = await day.save();

          res.json({
            message: `Event ${eventTitle} deleted successfully!`,
            day: updatedDay
          });
          // If no events are remaining, delete the Day
        } else {
          const deletedDay = await day.remove();
          res.json({
            message: `Event ${eventTitle} deleted successfully!`,
            day: deletedDay
          });
        }
      } else {
        throw new RangeError("Event not found.");
      }
    } else {
      throw new RangeError("Day not found.");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
});

module.exports = router;
