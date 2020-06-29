const mongoose = require("mongoose");

// Schema import
const Task = require("../../../../models/task");
const Link = require("../../../../models/link");
const Note = require("../../../../models/note");

const stringSettings = { type: String, maxlength: 350, trim: true };

const projectSchema = new mongoose.Schema({
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
  tasks: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task"
    }
  ],
  done: { type: Boolean, default: false }
});

// Create pre.remove hook to delete tasks
projectSchema.pre("findOneAndDelete", async function () {
  // Get Project ID from Project Query
  const { _id } = this.getFilter();

  // Find all tasks to delete dependant Notes and Links
  Task.find({ project: _id })
    .then(tasks => {
      const arr = Array.from({ length: tasks.length }, (_, i) => {
        return [
          new Promise((resolve, reject) => {
            Link.deleteMany({ task: tasks[i]._id })
              .then(link => resolve(link))
              .catch(err => reject(err));
          }),
          new Promise((resolve, reject) => {
            Note.deleteMany({ task: tasks[i]._id })
              .then(note => resolve(note))
              .catch(err => reject(err));
          })
        ];
      });
      Promise.all(arr.flat())
        .then(res => res)
        .catch(err => next(err));
    })
    .catch(err => reject(err));

  // Delete dependant Tasks
  Task.deleteMany({ project: _id })
    .then(res => res)
    .catch(err => next(err));
});

module.exports = mongoose.model("Project", projectSchema);
