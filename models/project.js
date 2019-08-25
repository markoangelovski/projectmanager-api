const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true, default: "New Project" },
  description: String,
  owner: String,
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

module.exports = mongoose.model("Project", projectSchema);
