const mongoose = require("mongoose");

// Schema import
const Task = require("./../models/task");
const Link = require("./../models/link");
const Note = require("./../models/note");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, default: "New Project" },
  description: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  pl: String,
  kanboard: String,
  dev: String,
  stage: String,
  prod: String,
  live: String,
  nas: String,
  order: Number,
  date: { type: Number, default: Date.now },
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    }
  ],
  done: { type: Boolean, default: false }
});

// Create pre.remove hook to delete tasks
projectSchema.pre("remove", async function(next) {
  try {
    const tasks = await Task.find({ project: this._id });
    tasks.forEach(async task => {
      await Promise.all([
        Link.remove({ task: task._id }),
        Note.remove({ task: task._id })
      ]);
    });

    await Promise.all([Task.remove({ project: this._id })]);

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Project", projectSchema);
