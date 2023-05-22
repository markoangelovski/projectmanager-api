const Task = require("../../../api/tasks/v1/tasks.model.js");
const mongoose = require("mongoose");

const getTasksAgg = async (skip, sort, query) => {
  const aggregate = Task.aggregate([
    { $match: query },
    {
      $lookup: {
        from: "projects",
        localField: "project",
        foreignField: "_id",
        as: "project"
      }
    },
    {
      $lookup: {
        from: "notes",
        localField: "_id",
        foreignField: "task",
        as: "notes"
      }
    },
    {
      $project: {
        _id: "$_id",
        title: "$title",
        project: { $arrayElemAt: ["$project.title", 0] },
        projectId: { $arrayElemAt: ["$project._id", 0] },
        description: "$description",
        pl: "$pl",
        kanboard: "$kanboard",
        nas: "$nas",
        column: "$column",
        done: "$done",
        date: "$date",
        dueDate: "$dueDate",
        eventsCount: "$eventsCount",
        notesCount: "$notesCount",
        notes: {
          _id: 1,
          data: 1,
          createdAt: 1,
          updatedAt: 1
        },
        createdAt: "$createdAt",
        updatedAt: "$updatedAt"
      }
    },
    // { $sort: { updatedAt: 1 } },
    { $sort: sort },
    { $skip: skip },
    { $limit: 50 }
  ]);

  return await aggregate;
};

module.exports = getTasksAgg;
