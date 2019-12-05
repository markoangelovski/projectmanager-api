const express = require("express");
const router = express.Router();

// Model import
const Day = require("../../models/event");

// @route   POST /events
// @desc    Create a new event
router.post("/", async (req, res, next) => {
  try {
    // Check if day exists
    const day = await Day.findOne({ date: req.body.date, owner: req.user });
    if (day) {
      // If day exists, add new event to its events array
      day.events.push(req.body.events[0]);
      const savedDay = await day.save();

      res.json({
        message: `Event ${req.body.events[0].title} successfully stored!`,
        event: savedDay
      });
    } else {
      // If day does not exist, create a new day
      const day = new Day(req.body);
      day.owner = req.user;
      const savedDay = await day.save();

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
  try {
    // Find days within the requested timeframe
    const days = await Day.find({
      date: { $gte: req.query.start, $lte: req.query.end },
      owner: req.user
    });

    // Sort found events into one array
    let events = [];
    days.forEach(day => {
      day.events.forEach(event => {
        events.push(event);
      });
    });
    res.json(events);
  } catch (error) {
    console.error(error.message);
    res.status(500);
    next(error);
  }
});

// @route   PATCH /events
// @desc    Edit events
// router.patch("/", async (req, res, next) => {})

// @route   DELETE /events/:eventId
// @desc    Delete events
router.delete("/:start", async (req, res, next) => {
  let date = new Date(parseInt(req.params.start)).setUTCHours(0, 0, 0, 0);

  try {
    // Find event's Day
    const day = await Day.findOne({ date, owner: req.user });

    // Get the title of the requested event
    const event = day.events.find(event => event.start == req.params.start);
    if (day && event) {
      // If day and event exists, remove the event from the day
      day.events = day.events.filter(event => event.start != req.params.start);
      if (day.events.length === 0) {
        // If there are no events left in the day, delete the day
        const deletedDay = await day.remove();
        res.json({
          message: `Event ${event.title} deleted successfully!`,
          day: deletedDay
        });
      } else {
        // If there are events left, save the Day and send response
        const savedDay = await day.save();
        res.json({
          message: `Event ${event.title} deleted successfully!`,
          day: savedDay
        });
      }
    } else {
      const error = new Error(
        "Day or event you are looking for cannot be found!"
      );
      res.status(404);
      next(error);
    }
  } catch (error) {
    console.error(error);
    res.status(500);
    next(error);
  }
});

module.exports = router;
