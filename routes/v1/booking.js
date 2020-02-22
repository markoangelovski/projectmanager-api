const express = require("express");
const router = express.Router();

// Model import
const Task = require("../../models/task");
const { Event } = require("../../models/day");

// Booking function
const bookMe = require("../../lib/Booking/bookMe");

// @route   POST /booking
// @desc    Book an event
router.post("/", async (req, res, next) => {
  try {
    const event = await Event.findById(req.body.event);

    // Check if Event exists
    if (!event) {
      res.status(404).json({
        message: `Event not found!`
      });
      // Check if Event has a Task
    } else if (!event.task) {
      res.status(403).json({
        message: `Event ${event.title} does not have an associated Task. Please add a Task and try again.`
      });
      // Check if Event is already booked
    } else if (event.booked) {
      res.status(403).json({
        message: `Event ${event.title} is already booked!`
      });
    } else {
      const task = await Task.findById(event.task);

      if (!task.kanboard) {
        res.status(403).json({
          message: `Task ${task.title} does not have an associated Kanboard link. Please add the Kanboard link and try again.`
        });
      } else {
        const date = new Date(event.date);
        const day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate();
        const month =
          date.getMonth() + 1 < 10
            ? `0${date.getMonth() + 1}`
            : date.getMonth() + 1;
        const year = date.getFullYear();
        const dateString = `${day}/${month}/${year}`;

        const bookingData = {
          username: req.body.username,
          password: req.body.password,
          url: task.kanboard,
          duration: event.duration.toString(),
          date: dateString
        };

        const booked = await bookMe(bookingData);

        if (booked.status === "OK") {
          event.booked = true;
          await event.save();

          res.status(200).json({
            message: `Event ${event.title} successfully booked!`,
            screenshot: `${req.protocol}://${req.get("host")}/scr-${
              req.body.username
            }-${day}-${month}-${year}.jpeg`
          });
        } else {
          const error = new Error(
            `An error occurred with booking Event ${event.title}. Please try again.`
          );
          next(error);
        }
      }
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
});

module.exports = router;
