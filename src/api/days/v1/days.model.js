const mongoose = require("mongoose");

// Model imports
const Event = require("./days.events.model");

const daySchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    events: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Event",
        required: true
      }
    ],
    date: Number,
    day: String,
    start: {
      type: Number,
      min: [0, "Earliest time can be at midnight"],
      max: [23.99, "Latest time can be one minute to midnight"]
    }
  },
  { timestamps: true }
);

daySchema.pre("save", async function (next) {
  this.date = parseInt(new Date(this.day).getTime());
  next();
});

daySchema.post("findOneAndUpdate", async function () {
  // Post update find the document and remove if no events are found
  const day = await this.model.findOne(this.getQuery());
  if (day && !day.events.length) day.remove();
});

module.exports = mongoose.model("Day", daySchema);
