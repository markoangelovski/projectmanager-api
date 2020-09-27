const Task = require("../../../api/tasks/v1/tasks.model.js");
const mongoose = require("mongoose");

const getTasksAgg = async (skip, query) => {
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
        createdAt: "$createdAt",
        updatedAt: "$updatedAt"
      }
    },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: 20 },
    {
      $group: {
        _id: {
          project: "$project",
          projectId: "$projectId"
        },
        tasks: {
          $push: {
            _id: "$_id",
            title: "$title",
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
            createdAt: "$createdAt",
            updatedAt: "$updatedAt"
          }
        }
      }
    },
    {
      $project: {
        _id: 0,
        project: "$_id.project",
        projectId: "$_id.projectId",
        tasks: "$tasks"
      }
    }
  ]);

  return await aggregate;
};

module.exports = getTasksAgg;
