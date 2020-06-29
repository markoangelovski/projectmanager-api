const mongoose = require("mongoose");

// Schema import
const Link = require("./../models/link");
const Note = require("./../models/note");

const taskSchema = new mongoose.Schema({
  title: { type: String, default: "New Task" },
  description: String,
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  pl: String,
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
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event"
    }
  ],
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

// Create pre.remove hook to delete Notes and Links
taskSchema.pre("remove", async function (next) {
  Promise.all([
    Link.remove({ task: this._id }),
    Note.remove({ task: this._id })
  ])
    .then(res => console.log("Deleted! ", res))
    .catch(err => console.warn(err));
  next();
});

module.exports = mongoose.model("Task", taskSchema);
