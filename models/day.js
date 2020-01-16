const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema({
  _id: { type: Number, default: () => Math.floor(Math.random() * 100000) },
  title: String,
  booked: { type: Boolean, default: false },
  duration: {
    type: Number,
    min: [0.25, "Minimum booked time must be at least 0.25"],
    max: [7.5, "Maximum booked time must be at least 7.5"]
  }
});

const daySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  task: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task"
  },
  date: Number,
  day: String,
  events: [eventSchema]
});

daySchema.pre("save", async function(next) {
  this.date = parseInt(new Date(this.day).getTime());
  next();
});

module.exports = mongoose.model("Day", daySchema);
