const mongoose = require("mongoose");

const subTaskSchema = new mongoose.Schema({
  title: { type: String, default: "Sub-task 1" },
  description: { type: String, default: "Sub-task 1" },
  date: { type: Number, default: Date.now },
  done: { type: Boolean, default: false },
  order: Number,
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true
  }
});

module.exports = mongoose.model("SubTask", subTaskSchema);
