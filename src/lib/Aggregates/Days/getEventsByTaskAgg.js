const Event = require("../../../api/days/v1/days.events.model");
const mongoose = require("mongoose");

const getEventsByTaskAgg = async (start, end, taskId) => {
  const aggregate = Event.aggregate([
    // Get events for specific task
    {
      $match: {
        task: mongoose.Types.ObjectId(taskId),
        date: { $gte: new Date(start).getTime(), $lte: new Date(end).getTime() }
      }
    },

    // Get related task details
    {
      $lookup: {
        from: "tasks",
        localField: "task",
        foreignField: "_id",
        as: "task"
      }
    },

    // Shape the event object format and include task title, kanboard and description
    {
      $project: {
        title: "$title",
        duration: "$duration",
        date: "$date",
        day: { $toDate: "$date" },
        booked: "$booked",
        task: { $arrayElemAt: ["$task.title", 0] },
        description: { $arrayElemAt: ["$task.description", 0] },
        kanboard: { $arrayElemAt: ["$task.kanboard", 0] },
        logs: { $ifNull: ["$logs", []] }
      }
    },

    // Remove _id from logs
    { $unset: ["logs._id"] },

    // Sort events by date
    { $sort: { date: 1 } },

    // Group events by task title and kanboard
    {
      $group: {
        _id: {
          task: "$task",
          kanboard: "$kanboard",
          description: "$description"
        },
        totalHoursWorked: { $sum: "$duration" },
        totalHoursBooked: {
          $sum: {
            $cond: ["$booked", "$duration", 0]
          }
        },
        startDate: {
          $first: { $dateToString: { format: "%Y-%m-%d", date: "$day" } }
        },
        endDate: {
          $last: { $dateToString: { format: "%Y-%m-%d", date: "$day" } }
        },
        events: {
          $push: {
            title: "$title",
            duration: "$duration",
            day: { $dateToString: { format: "%Y-%m-%d", date: "$day" } },
            date: "$date",
            booked: "$booked",
            logs: "$logs"
          }
        }
      }
    },

    // Display task statistics and event list array
    {
      $project: {
        _id: 0,
        task: "$_id.task",
        kanboard: "$_id.kanboard",
        description: "$_id.description",
        totalEvents: { $size: "$events" },
        totalHoursWorked: "$totalHoursWorked",
        totalHoursBooked: "$totalHoursBooked",
        totalHoursPendingBooking: {
          $subtract: ["$totalHoursWorked", "$totalHoursBooked"]
        },
        range: {
          startDate: "$startDate",
          endDate: "$endDate"
        },
        events: "$events"
      }
    }
  ]);

  return await aggregate;
};

module.exports = getEventsByTaskAgg;
