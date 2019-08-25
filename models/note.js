const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
  note: String,
  date: { type: Number, default: Date.now },
  order: Number,
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: true
  }
});

module.exports = mongoose.model("Note", noteSchema);
