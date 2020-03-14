const express = require("express");
const router = express.Router();

// Model import
const Task = require("../../models/task");
const { Day, Event } = require("../../models/day");

// @route   POST /days
// @desc    Create a new event
router.post("/", async (req, res, next) => {
  try {
    // Get Day's Task if it is passed
    const task =
      req.body.task == ""
        ? null
        : await Task.findOne({ _id: req.body.task, owner: req.user });

    // Check if Day exists
    const day = await Day.findOne({ day: req.body.day, owner: req.user });

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
      if (task) {
        task.events.push(event);
        await task.save();
      }

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

// @route   GET /days?task=taskId
// @desc    Get all events for a requested Task ID
const getTasks = async (req, res, next) => {
  if (req.query.task) {
    try {
      let taskId;
      taskId = /^[a-f\d]{24}$/i.test(req.query.task) && req.query.task;
      if (!taskId) throw new Error("Task identifier invalid");

      // Find events for specific task
      const events =
        taskId &&
        (await Event.find({
          owner: req.user,
          task: taskId
        }));

      if (events && events.length > 0) {
        res.json({
          message: "Event entries successfully found!",
          events
        });
      } else {
        throw new RangeError("No event entries found.");
      }
    } catch (error) {
      console.error(error.message);
      next(error);
    }
  } else {
    next();
  }
};

// @route   GET /days?start=startDate&end=endDate&id=dayId&task=taskId
// @desc    Get all days in range
router.get("/", getTasks, async (req, res, next) => {
  const start =
    req.query.start && req.query.start.length > 1
      ? new Date(req.query.start)
      : null;
  const end =
    req.query.end && req.query.end.length > 1 ? new Date(req.query.end) : null;
  let dayId = null;
  if (req.query.id && /^[a-f\d]{24}$/i.test(req.query.id)) dayId = req.query.id;

  // Original Range Querry
  // const days = await Day.find({
  //   date: { $gte: start, $lte: end },
  //   owner: req.user
  // }).sort({ date: "desc" });

  const query = { owner: req.user };

  try {
    // Create Range Query for multiple Days request
    if (start && end) {
      const rangeQuery = {};
      rangeQuery.$gte = start;
      rangeQuery.$lte = end;
      query.date = rangeQuery;
    } else if (start) {
      // Create Start Day Query for Single day request
      query.date = start;
    } else if (dayId) {
      // Create Day ID Query for Single day request
      query._id = dayId;
    } else {
      const error = new Error("Invalid request.");
      return next(error);
    }

    // Find days for specific query
    let days;
    if (start && end) {
      days = await Day.find(query).sort({ date: "desc" });
    } else if (start || dayId) {
      days = await Day.findOne(query).populate("events");
    }

    if (days) {
      if (days.length > 0 || Object.keys(days).length > 0) {
        res.json({
          message: "Day entries successfully found!",
          days
        });
      } else {
        throw new RangeError("No day entries found.");
      }
    } else {
      throw new RangeError("No day entries found.");
    }
  } catch (error) {
    console.error(error.message);
    next(error);
  }
});

// @route   PATCH /days/:eventId
// @desc    Edit events
// router.patch("/", async (req, res, next) => {})
router.patch("/:eventId", async (req, res, next) => {
  try {
    const updateOps = {};
    req.body.forEach(element => {
      updateOps[element.propName] = element.propValue;
    });
    updateOps.dateModified = parseInt(new Date().getTime());

    const event = await Event.updateOne(
      { owner: req.user, _id: req.params.eventId },
      { $set: updateOps }
    );

    // Update task if task is present
    if (updateOps.task) {
      const task = await Task.findById(updateOps.task);
      task.events.push(req.params.eventId);
      task.save();
    }

    if (!event.n) {
      const error = new RangeError(
        "Event you are trying to edit was not found!"
      );
      next(error);
    } else if (!event.nModified) {
      res.status(200).json({
        message: "No detail modifications detected. No actions taken."
      });
    } else if (event.nModified) {
      res.status(201).json({
        message: "Event successfully updated!"
      });
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
});

// @route   DELETE /days/:dayId/:eventId
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
        const index =
          task &&
          task.events.findIndex(
            event => JSON.stringify(event) == JSON.stringify(req.params.eventId)
          );
        if (index != null && index > -1) {
          task.events.splice(index, 1);
          await task.save();
        }
      };

      // Remove Event reference from Day
      const index = day.events.findIndex(
        event => JSON.stringify(event) == JSON.stringify(req.params.eventId)
      );

      // Check if event exists and remove it
      if (index !== -1) {
        day.events.splice(index, 1);

        // If any events are remaining, save the Day
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
