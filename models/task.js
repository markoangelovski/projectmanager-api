const mongoose = require("mongoose");

// inks import
const Link = require("./../models/link");
const Note = require("./../models/note");

const taskSchema = new mongoose.Schema({
  title: { type: String, default: "New Task" },
  description: String,
  owner: String,
  column: { type: String, default: "Upcoming" },
  kanboard: String,
  nas: String,
  dueDate: { type: Number, default: Date.now },
  order: Number,
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true
  },
  notes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Note"
    }
  ],
  links: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Link"
    }
  ],
  subtasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subtask"
    }
  ],
  tags: [],
  date: { type: Number, default: Date.now },
  done: { type: Boolean, default: false }
});

// Create pre.remove hook to delete links
taskSchema.pre("remove", async function(next) {
  try {
    await Link.remove({
      task: this._id
    });
    await Note.remove({
      task: this._id
    });
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Task", taskSchema);
