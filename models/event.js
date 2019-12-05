const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  title: String,
  start: Number,
  end: Number
});

const daySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: Date,
  events: [eventSchema]
});

module.exports = mongoose.model("Event", daySchema);
