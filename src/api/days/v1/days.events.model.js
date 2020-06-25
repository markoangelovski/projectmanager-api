const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
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
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Minimum length must be at least 3 characters."],
      maxlength: [150, "Maximum length cannot exceed 150 characters."]
    },
    logs: [
      {
        title: {
          type: String,
          required: true,
          trim: true,
          minlength: [3, "Minimum length must be at least 3 characters."],
          maxlength: [350, "Maximum length cannot exceed 350 characters."]
        },
        duration: {
          type: Number,
          required: true,
          min: [0.25, "Minimum booked time must be at least 0.25"],
          max: [24, "Maximum booked time is 24"]
        }
      }
    ],
    booked: { type: Boolean, default: false },
    duration: Number,
    date: { type: Number, default: Date.now }
  },
  { timestamps: true }
);

eventSchema.pre("save", function (next) {
  // Add all log durations to calculate total duration
  this.duration = this.logs.reduce((acc, log) => acc + log.duration, 0);
  next();
});

eventSchema.post("updateOne", async function () {
  // Post update find the document and call .save() to recalculate duration
  /* await  */ this.model.findOne(this.getQuery()).then(event => event.save());
});

module.exports = mongoose.model("Event", eventSchema);
