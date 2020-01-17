const express = require("express");
const router = express.Router();

// Model import
const Task = require("../../models/task");
const { Day, Event } = require("../../models/day");

// @route   POST /events
// @desc    Create a new event
router.post("/", async (req, res, next) => {
  try {
    // Get Day's Task if it is passed
    const task = req.body.task
      ? await Task.findOne({ _id: req.body.task, owner: req.user })
      : null;

    // Check if Day exists
    const day = await Day.findOne({
      day: req.body.day,
      owner: req.user
    });

    // Create new event
    const event = new Event({
      title: req.body.title,
      duration: req.body.duration,
      task: req.body.task ? req.body.task : null,
      owner: req.user,
      day: day ? day : ""
    });

    if (day) {
      // If day exists, add new event to its events array
      day.events.push(event);
      const savedDay = await day.save();
      const savedEvent = await event.save();

      // Fetch Events for response
      const events = await Event.find({ _id: { $in: day.events } });

      // Add events array to Day object for response
      savedDay.events = events;

      // Save event to task
      task.events.push(event);
      await task.save();

      res.status(201).json({
        message: `Event ${savedEvent.title} successfully stored!`,
        day: savedDay
      });
    } else {
      // If day does not exist, create a new Day
      const day = new Day({ day: req.body.day, owner: req.user });

      // Add event to Day
      day.events.push(event);

      // Add reference to Day in Event
      event.day = day;

      // Save the Day
      const savedDay = await day.save();
      const savedEvent = await event.save();

      // Save event to task
      task.events.push(event);
      await task.save();

      res.status(201).json({
        message: `Event ${savedEvent.title} successfully stored!`,
        day: savedDay
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
