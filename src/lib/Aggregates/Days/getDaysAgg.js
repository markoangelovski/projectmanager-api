const Day = require("../../../api/days/v1/days.model");

const getDaysAgg = async (start, end, total = false) => {
  const aggregate = Day.aggregate([
    {
      $match: {
        date: { $gte: new Date(start).getTime(), $lte: new Date(end).getTime() }
      }
    },
    {
      $lookup: {
        from: "events",
        localField: "events",
        foreignField: "_id",
        as: "events"
      }
    },
    { $unwind: "$events" },
    {
      $lookup: {
        from: "tasks",
        localField: "events.task",
        foreignField: "_id",
        as: "events.task"
      }
    },
    // { $unwind: "$events.task" }, // if enabled, deletes events without task
    {
      $project: {
        day: "$day",
        date: "$date",
        "events.title": "$events.title",
        "events.eventId": "$events._id",
        "events.duration": "$events.duration",
        "events.booked": "$events.booked",
        "events.createdAt": "$events.createdAt",
        "events.task": { $arrayElemAt: ["$events.task.title", 0] },
        "events.taskId": { $arrayElemAt: ["$events.task._id", 0] },
        "events.kanboard": { $arrayElemAt: ["$events.task.kanboard", 0] },
        "events.logs": { $ifNull: ["$events.logs", []] }
      }
    },
    { $unset: ["events.logs._id"] },
    {
      $group: {
        _id: "$day",
        date: { $max: "$date" },
        events: { $addToSet: "$events" }
      }
    },
    {
      $project: {
        _id: 0,
        day: "$_id",
        date: "$date",
        events: "$events"
      }
    },
    {
      $addFields: {
        totalEvents: { $size: "$events" },
        totalLogs: {
          $reduce: {
            input: "$events",
            initialValue: 0,
            in: {
              $add: ["$$value", { $size: "$$this.logs" }]
            }
          }
        },
        totalHoursWorked: {
          $reduce: {
            input: "$events",
            initialValue: 0,
            in: {
              $add: ["$$value", "$$this.duration"]
            }
          }
        },
        totalHoursBooked: {
          $reduce: {
            input: "$events",
            initialValue: 0,
            in: {
              $add: [
                "$$value",
                {
                  $cond: ["$$this.booked", "$$this.duration", 0]
                }
              ]
            }
          }
        }
      }
    },
    {
      $addFields: {
        totalHoursPendingBooking: {
          $subtract: ["$totalHoursWorked", "$totalHoursBooked"]
        },
        totalHoursOvertime: {
          $cond: [
            { $gte: ["$totalHoursWorked", 7.5] },
            { $subtract: ["$totalHoursWorked", 7.5] },
            0
          ]
        }
      }
    },
    { $sort: { date: 1 } }
    // { $limit: 5 }
  ]);

  total &&
    aggregate.append(
      {
        $group: {
          _id: 0,
          startDate: {
            $first: "$day"
          },
          endDate: {
            $last: "$day"
          },
          totalDays: { $push: "$day" },
          totalEvents: { $sum: "$totalEvents" },
          totalLogs: { $sum: "$totalLogs" },
          totalHoursWorked: { $sum: "$totalHoursWorked" },
          totalHoursBooked: { $sum: "$totalHoursBooked" },
          totalHoursPendingBooking: { $sum: "$totalHoursPendingBooking" },
          totalHoursOvertime: { $sum: "$totalHoursOvertime" }
        }
      },
      {
        $project: {
          _id: 0,
          range: {
            startDate: "$startDate",
            endDate: "$endDate"
          },
          totalDays: { $size: "$totalDays" },
          totalEvents: "$totalEvents",
          totalLogs: "$totalLogs",
          totalHoursWorked: "$totalHoursWorked",
          totalHoursBooked: "$totalHoursBooked",
          totalHoursPendingBooking: "$totalHoursPendingBooking",
          totalHoursOvertime: "$totalHoursOvertime"
        }
      }
    );

  return await aggregate;
};

module.exports = getDaysAgg;
