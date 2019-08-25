const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, default: "New Task" },
  description: String,
  column: { type: String, default: "Upcoming" },
  kanTaskLink: String,
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

module.exports = mongoose.model("Task", taskSchema);
