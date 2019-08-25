const mongoose = require("mongoose");

const linkSchema = new mongoose.Schema({
  title: String,
  description: String,
  link: String,
  date: { type: Number, default: Date.now },
  order: Number,
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true
  }
});

module.exports = mongoose.model("Link", linkSchema);
