const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema(
  {
    data: {
      time: Number,
      blocks: Array,
      version: String
    },
    date: { type: Number, default: Date.now },
    order: Number,
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: true
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Note", noteSchema);
