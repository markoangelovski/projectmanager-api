const mongoose = require("mongoose");

// Schema import
const Task = require("../../tasks/v1/tasks.model");
const Note = require("../../notes/v1/notes.model");

const stringSettings = { type: String, maxlength: 350, trim: true };

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      maxlength: 150,
      trim: true,
      default: "New Project"
    },
    description: stringSettings,
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    pl: stringSettings,
    kanboard: stringSettings,
    dev: stringSettings,
    stage: stringSettings,
    prod: stringSettings,
    live: stringSettings,
    nas: stringSettings,
    order: Number,
    date: { type: Number, default: Date.now },
    // tasks: [
    //   {
    //     type: mongoose.Schema.Types.ObjectId,
    //     ref: "Task"
    //   }
    // ],
    openTasksCount: Number,
    closedTasksCount: Number,
    done: { type: Boolean, default: false }
  },
  { timestamps: true }
);

// Create pre.validate/save hook to recalcualte Tasks count
projectSchema.pre("validate", async function () {
  const [openTasksCount, closedTasksCount] = await Promise.all([
    Task.countDocuments({ project: this._id, done: false }),
    Task.countDocuments({ project: this._id, done: true })
  ]);

  this.openTasksCount = openTasksCount;
  this.closedTasksCount = closedTasksCount;
});

// Create pre.remove hook to delete tasks
projectSchema.pre("findOneAndDelete", async function () {
  // Get Project ID from Project Query
  const { _id } = this.getFilter();

  // Find all tasks to delete dependant Notes and Links
  Task.find({ project: _id })
    .select("_id")
    .then(tasks => {
      const arr = Array.from({ length: tasks.length }, (_, i) =>
        Note.deleteMany({ task: tasks[i]._id })
          .then(note => note)
          .catch(err => console.warn(err))
      );
      Promise.all(arr)
        .then(res => null)
        .catch(err => console.warn(err));
    })
    .catch(err => console.warn(err));

  // Delete dependant Tasks
  Task.deleteMany({ project: _id })
    .then(res => null)
    .catch(err => console.warn(err));
});

module.exports = mongoose.model("Project", projectSchema);
