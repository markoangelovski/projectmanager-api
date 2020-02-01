const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  },
  day: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Day",
    required: true
  },
  title: String,
  booked: { type: Boolean, default: false },
  duration: {
    type: Number,
    min: [0.25, "Minimum booked time must be at least 0.25"],
    max: [7.5, "Maximum booked time must be at least 7.5"]
  },
  date: { type: Number, default: Date.now }
});

const daySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  date: Number,
  day: String,
  events: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true
    }
  ]
});

daySchema.pre("save", async function(next) {
  this.date = parseInt(new Date(this.day).getTime());
  next();
});

const Day = mongoose.model("Day", daySchema);
const Event = mongoose.model("Event", eventSchema);

module.exports = { Day, Event };
