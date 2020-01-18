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

      // Save Day and Event, fetch events for the response
      const [savedDay, savedEvent] = await Promise.all([
        day.save(),
        event.save()
      ]);

      // Save event to task
      if (task) {
        task.events.push(event);
        await task.save();
        console.log("3");
      }

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

// @route   GET /days
// @desc    Get all days in range
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
        message: "Day entries successfully found!",
        days
      });
    } else {
      throw new RangeError("No day entries found.");
    }
  } catch (error) {
    console.error(error.message);
    next(error);
  }
});

// @route   GET /days/:dayId
// @desc    Get all events for a certan Day
router.get("/:dayId", async (req, res, next) => {
  try {
    // Find days within the requested timeframe
    const day = await Day.findOne({
      _id: req.params.dayId,
      owner: req.user
    }).populate("events");

    if (day) {
      res.json({
        message: "Day successfully found!",
        day
      });
    } else {
      throw new RangeError("No day entries found.");
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
router.delete("/:dayId/:eventId", async (req, res, next) => {
  try {
    // Find Day and Event
    const [day, event] = await Promise.all([
      Day.findOne({ _id: req.params.dayId, owner: req.user }),
      Event.findOne({ _id: req.params.eventId, owner: req.user })
    ]);

    if (day && event) {
      // Remove Event reference from Task functon
      const removeEventFromTask = async event => {
        const task = await Task.findOne({ _id: event.task, owner: req.user });

        // Remove Event reference from Task
        const index = task.events.findIndex(
          event => JSON.stringify(event) == JSON.stringify(req.params.eventId)
        );
        if (index !== -1) {
          task.events.splice(index, 1);
          await task.save();
        }
      };

      // Remove Event reference from Day
      const index = day.events.findIndex(
        event => JSON.stringify(event) == JSON.stringify(req.params.eventId)
      );
      console.log("index", index);
      // Check if event exists and remove it
      if (index !== -1) {
        day.events.splice(index, 1);

        // If any events are remaining, save the Day and Fetch remaining events for response
        if (day.events.length >= 1) {
          const [updatedDay, deletedEvent] = await Promise.all([
            day.save(),
            event.remove()
          ]);

          // Remove Event reference from Task
          removeEventFromTask(event);

          res.json({
            message: `Event ${deletedEvent.title} deleted successfully!`,
            day: updatedDay
          });
        } else {
          // If no events are remaining, delete the Day
          const [deletedDay, deletedEvent] = await Promise.all([
            day.remove(),
            event.remove()
          ]);

          // Remove Event reference from Task
          removeEventFromTask(event);

          res.json({
            message: `Event ${deletedEvent.title} deleted successfully!`,
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
