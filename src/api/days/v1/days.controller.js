// Models
const Day = require("./days.model");
const Event = require("./days.events.model");
const Task = require("../../tasks/v1/tasks.model");

// Validation
const dbModelCheck = require("../../../validation/dbModelCheck");
const { mongoIdRgx, dateRgx } = require("../../../validation/regex");
const { checkDate, checkDayId } = require("../../../validation/date");

// @route   POST /days/event.create
// @desc    Create a new event
// Request JSON body:
// {
//     "day": "YYYY-MM-DD",
//     "task": "taskId",
//     "title": "New event title",
//     "duration": 0.25,
//     "start": 7
// }
exports.postEvent = async (req, res, next) => {
  try {
    // Handle Start
    let start = req.body.start;
    if (start) {
      start = start >= 0 && start <= 23.99 && start;
      if (!start) throw new Error("ERR_START_RANGE_EXCEEDED");
    }

    // Handle Day
    const dayId = dateRgx.test(req.body.day) && checkDayId(req.body.day);
    if (!dayId) throw new Error("ERR_DATE_FORMAT_INVALID");
    const dbQuery = [Day.findOne({ day: dayId, owner: req.user })];

    // Handle Task, if task is passed, check if it exists
    const taskId = mongoIdRgx.test(req.body.task) && req.body.task;
    if (req.body.task && !taskId)
      throw new Error("ERR_TASK_IDENTIFIER_INVALID");
    if (taskId) dbQuery.push(Task.findOne({ _id: taskId, owner: req.user }));

    let [day, task] = await Promise.all(dbQuery);

    // Create new event
    const event = new Event({
      title: req.body.title,
      logs: [
        {
          title: req.body.title,
          duration: req.body.duration
        }
      ],
      task: task ? taskId : null,
      owner: req.user,
      day
    });

    if (day) {
      // Add Event reference to Day
      day.events.push(event._id);

      // Update Start hour value
      day.start =
        !isNaN(parseFloat(req.body.start)) && parseFloat(req.body.start);

      const [savedEvent, savedDay] = await Promise.all([
        event.save(),
        day.save()
      ]);

      res.status(201).json({
        message: `Event ${savedEvent.title} successfully stored!`,
        day: savedDay
      });

      // Trigger Task.save() to recalculate the number of events in the task
      if (task)
        task
          .save()
          .then(res => null)
          .catch(err => console.warn(err));
    } else {
      // If day does not exist, create a new Day
      const day = new Day({
        start,
        day: dayId,
        owner: req.user,
        events: [event]
      });

      // Add reference to Day in Event
      event.day = day._id;

      // Save the Day and Event
      const [savedEvent, savedDay] = await Promise.all([
        event.save(),
        day.save()
      ]);

      res.status(201).json({
        message: `Event ${savedEvent.title} successfully stored!`,
        day: savedDay
      });

      // Trigger Task.save() to recalculate the number of events in the task
      if (task)
        task
          .save()
          .then(res => null)
          .catch(err => console.warn(err));
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @route   GET /days/event.find?task=taskId&start=startDate&end=endDate&id=dayId
// @desc    Get all events for a requested Task ID, Day ID or requested range
exports.getEventsByTask = async (req, res, next) => {
  if (req.query.task) {
    try {
      const taskId = mongoIdRgx.test(req.query.task) && req.query.task;
      if (!taskId) throw new Error("ERR_TASK_IDENTIFIER_INVALID");

      // Find events for specific task
      const events = await Event.find({ owner: req.user, task: taskId });

      if (events && events.length > 0) {
        res.json({
          message: "Event entries successfully found!",
          events
        });
      } else {
        res.status(404);
        throw new RangeError("ERR_NO_EVENTS_FOUND");
      }
    } catch (error) {
      console.error(error.message);
      next(error);
    }
  } else {
    next();
  }
};

// @route   GET /days/event.find?task=taskId&start=startDate&end=endDate&id=dayId
// @desc    Get all events for a requested Task ID, Day ID or requested range
exports.getEventsByDay = async (req, res, next) => {
  if (req.query.id) {
    try {
      const dayId = mongoIdRgx.test(req.query.id) && req.query.id;
      if (!dayId) throw new Error("ERR_DAY_IDENTIFIER_INVALID");
      // Find specific Day
      const days = await Day.findOne({ owner: req.user, _id: dayId }).populate(
        "events"
      );

      if (days && Object.keys(days).length > 0) {
        res.json({
          message: "Day entries successfully found!",
          days
        });
      } else {
        throw new RangeError("ERR_NO_DAYS_FOUND");
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  } else {
    next();
  }
};

// @route   GET /days/event.find?task=taskId&start=startDate&end=endDate&id=dayId
// @desc    Get all events for a requested Task ID, Day ID or requested range
exports.getEventsByRange = async (req, res, next) => {
  const start = checkDate(req.query.start);
  const end = checkDate(req.query.end);

  // Original Range Query
  // const days = await Day.find({
  //   date: { $gte: start, $lte: end },
  //   owner: req.user
  // }).sort({ date: "desc" });
  const query = { owner: req.user };

  try {
    // Create Range Query for Day range request
    if (start && end) {
      query.date = { $gte: start, $lte: end };
    } else if (start) {
      // Create Start Day Query for Single day request
      query.day = checkDayId(start);
    } else {
      throw new Error("ERR_INVALID_REQUEST");
    }

    // Find days for specific query
    let days;
    if (start && end) {
      days = await Day.find(query).sort({ date: "desc" });
    } else if (start) {
      days = await Day.findOne(query).populate("events");
    }

    if ((days && days.length > 0) || (days && Object.keys(days).length > 0)) {
      res.json({
        message: "Day entries successfully found!",
        days
      });
    } else {
      throw new RangeError("ERR_NO_DAY_ENTRIES_FOUND");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @route   PATCH /days/event.update/:eventId
// @desc    Edit events
// Request JSON body, array of values to be updated:
// [{"propName": "title", "propValue": "Updated title"},
//  {"propName": "booked", "propValue": "Updated Booked value"}]
exports.patchEvent = async (req, res, next) => {
  try {
    const updateOps = {};
    req.body.forEach(element => {
      updateOps[element.propName] = element.propValue;
    });

    const event = await Event.updateOne(
      { owner: req.user, _id: req.params.eventId },
      { $set: updateOps }
    );

    if (!event.n) {
      throw new RangeError("ERR_EVENT_NOT_FOUND");
    } else if (!event.nModified) {
      res.status(200).json({
        message: "No detail modifications detected. No actions taken."
      });
    } else if (event.nModified) {
      res.status(200).json({
        message: "Event successfully updated!"
      });
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
};

// @route   DELETE /days/event.delete/:dayId/:eventId
// @desc    Delete events
exports.deleteEvent = async (req, res, next) => {
  try {
    await dbModelCheck(
      [
        {
          _id: req.params.dayId,
          model: Day,
          invalidMsg: "ERR_DAY_IDENTIFIER_INVALID",
          notFoundMsg: "ERR_DAY_NOT_FOUND"
        },
        {
          _id: req.params.eventId,
          model: Event,
          invalidMsg: "ERR_EVENT_IDENTIFIER_INVALID",
          notFoundMsg: "ERR_EVENT_NOT_FOUND"
        }
      ],
      req
    );

    // Find Day and Event
    const [day, event] = await Promise.all([
      Day.findByIdAndUpdate(
        { _id: req.params.dayId, owner: req.user },
        { $pull: { events: req.params.eventId } },
        { new: true }
      ),
      Event.findOneAndDelete({ _id: req.params.eventId, owner: req.user })
    ]);

    if (day && event) {
      res.json({
        message: `Event ${event.title} deleted successfully!`,
        day
      });

      // Trigger Task.save() to recalculate the number of events in the task
      Task.findById(event.task)
        .then(task =>
          task
            .save()
            .then(res => null)
            .catch(err => console.warn(err))
        )
        .catch(err => console.warn(err));
    } else {
      const error = new Error("ERR_SERVER_ERROR");
      next(error);
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @route   POST /days/log.create
// @desc    Create a new log
// Request JSON body:
// {
//     "event": "eventId",
//     "title": "New log title",
//     "duration": 0.25
// }
exports.postLog = async (req, res, next) => {
  try {
    // Handle Day
    await dbModelCheck(
      [
        {
          _id: req.body.event,
          model: Event,
          invalidMsg: "ERR_EVENT_IDENTIFIER_INVALID",
          notFoundMsg: "ERR_EVENT_NOT_FOUND"
        }
      ],
      req
    );

    // Create new log
    const newLog = {
      title: req.body.title,
      duration: req.body.duration
    };

    const event = await Event.updateOne(
      { _id: req.body.event, owner: req.user },
      { $push: { logs: newLog } }
    );

    if (!event.n) {
      throw new RangeError("ERR_EVENT_NOT_FOUND");
    } else if (!event.nModified) {
      res.status(200).json({
        message: "No detail modifications detected. No actions taken."
      });
    } else if (event.nModified) {
      res.status(201).json({
        message: `Log ${newLog.title} successfully stored!`
      });
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @route   PATCH /days/log.update/:logId
// @desc    Edit event logs
// Request JSON body, array of values to be updated:
// [{"propName": "title", "propValue": "Updated title"},
//  {"propName": "duration", "propValue": "Updated uration"}]
exports.patchEventLog = async (req, res, next) => {
  try {
    await dbModelCheck(
      [
        {
          _id: req.params.logId,
          model: Event,
          invalidMsg: "ERR_LOG_IDENTIFIER_INVALID",
          notFoundMsg: "ERR_LOG_NOT_FOUND"
        }
      ],
      req
    );

    const updateOps = {};
    req.body.forEach(el => {
      if (
        // Duration of a log cannot be under 0.25h and over 24h
        (el.propName === "duration" && el.propValue < 0.25) ||
        (el.propName === "duration" && el.propValue > 24)
      )
        throw new Error("ERR_TIME_RANGE_EXCEEDED");
      updateOps[`logs.$.${el.propName}`] = el.propValue;
    });

    const event = await Event.updateOne(
      { owner: req.user, "logs._id": req.params.logId },
      { $set: updateOps }
    );

    if (!event.n) {
      throw new RangeError("ERR_EVENT_NOT_FOUND");
    } else if (!event.nModified) {
      res.status(200).json({
        message: "No detail modifications detected. No actions taken."
      });
    } else if (event.nModified) {
      res.status(200).json({
        message: "Log successfully updated!"
      });
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
};

// @route   DELETE /days/log.delete/:logId
// @desc    Delete Log
exports.deleteEventLog = async (req, res, next) => {
  try {
    await dbModelCheck(
      [
        {
          _id: req.params.logId,
          model: Event,
          invalidMsg: "ERR_LOG_IDENTIFIER_INVALID",
          notFoundMsg: "ERR_LOG_NOT_FOUND"
        }
      ],
      req,
      next
    );

    // Delete the log entry
    const event = await Event.findOneAndUpdate(
      { "logs._id": req.params.logId, owner: req.user },
      { $pull: { logs: { _id: req.params.logId } } }
    );

    // Refetch event to recalculate duration,
    // MOVE THIS SECTION TO POST FINDONEANDUPDATE
    Event.findById(event._id)
      .then(foundEvent =>
        foundEvent
          .save()
          .then(savedEvent => null)
          .catch(err => console.warn(err))
      )
      .catch(err => console.warn(err));

    if (event) {
      res.status(200).json({
        message: "Log successfully deleted!"
      });
    } else {
      throw new RangeError("ERR_LOG_NOT_FOUND");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};
