const mongoose = require("mongoose");

// Schema imports
const Event = require("../../days/v1/days.events.model");
const Note = require("../../notes/v1/notes.model");

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, default: "New Task" },
    description: String,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    pl: String,
    column: {
      type: String,
      enum: ["Upcoming", "In Progress", "Completed"],
      default: "Upcoming"
    },
    kanboard: String,
    nas: String,
    dueDate: { type: Number, default: Date.now },
    order: Number,
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },
    eventsCount: Number,
    notesCount: Number,
    tags: [],
    date: { type: Number, default: Date.now },
    done: { type: Boolean, default: false }
  },
  { timestamps: true }
);

taskSchema.pre("validate", async function () {
  // Change due date to numeric format
  this.dueDate = parseInt(new Date(this.dueDate).getTime());

  try {
    // Find counts for events, notes and links
    const [eventsCount, notesCount] = await Promise.all([
      Event.countDocuments({ task: this._id }),
      Note.countDocuments({ task: this._id })
    ]);
    this.eventsCount = eventsCount;
    this.notesCount = notesCount;
  } catch (error) {
    console.warn(error);
  }
});

// Create pre.remove hook to delete Notes and Links
taskSchema.pre("findOneAndDelete", async function () {
  // Get Task ID from Project Query
  const { _id } = this.getFilter();

  // Delete all linked Links and Notes
  Note.deleteMany({ task: _id })
    .then(res => null)
    .catch(err => console.warn(err));
});

module.exports = mongoose.model("Task", taskSchema);
