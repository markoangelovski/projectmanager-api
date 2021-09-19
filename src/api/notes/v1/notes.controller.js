// Model imports
const Task = require("../../tasks/v1/tasks.model");
const Note = require("./notes.model");

// Validation
const { mongoIdRgx } = require("../../../validation/regex");

// Helper functions
const {
  getQueryConditions
} = require("../../../lib/Helpers/getQueryConditions");

// @route   POST /notes/:taskId
// @desc    Create a new note
// Request JSON body:
// {
//    "data": { // Saved object from Editor.js
//      time: Number,
//      blocks: Array,
//      version: String
// }
//    "task": "TaskId",
// }
exports.postNote = async (req, res, next) => {
  try {
    const taskId = mongoIdRgx.test(req.body.task) && req.body.task;
    if (!taskId) throw new Error("ERR_TASK_IDENTIFIER_INVALID");

    if (!req.body.data) throw new Error("ERR_NOTE_CONTENT_REQUIRED");

    const task = await Task.findById(taskId);

    if (task) {
      const note = new Note({ owner: req.user, ...req.body });
      const savedNote = await note.save();

      res.status(201).json({
        message: `Note successfully created!`,
        note: savedNote
      });

      // Trigger task.save to recalculate tasks's note count
      task
        .save()
        .then(res => null)
        .catch(err => console.warn(err));
    } else {
      throw new RangeError("ERR_TASK_NOT_FOUND");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @route   GET /notes?task=taskId
// @desc    Get notes by task middleware function
exports.getNotesByTask = async (req, res, next) => {
  if (req.query.task) {
    try {
      const taskId = mongoIdRgx.test(req.query.task) && req.query.task;
      if (!taskId) throw new Error("ERR_TASK_IDENTIFIER_INVALID");

      const task = await Task.countDocuments({
        owner: req.user,
        _id: taskId
      });

      if (task) {
        const notes = await Note.find({ owner: req.user, task: taskId });

        if (notes.length) {
          res.status(200).json({
            message: "Notes successfully found!",
            count: notes.length,
            notes
          });
        } else {
          throw new RangeError("ERR_NOTES_NOT_FOUND");
        }
      } else {
        throw new RangeError("ERR_TASK_NOT_FOUND");
      }
    } catch (error) {
      console.error(error);
      next(error);
    }
  } else {
    next();
  }
};

// @route   GET /notes
// @desc    Get all notes
exports.getNotes = async (req, res, next) => {
  try {
    const { stats, docs } = await getQueryConditions(req, Note);

    if (stats && stats.total) {
      res.status(200).json({
        message: "Notes successfully fetched!",
        stats,
        notes: docs
      });
    } else {
      throw new RangeError("ERR_NOTES_NOT_FOUND");
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
};

// @route   PATCH /notes/:noteId
// @desc    Update a note
// Request JSON body:
// {"note": "Updated note"}
exports.patchNote = async (req, res, next) => {
  try {
    const noteId = mongoIdRgx.test(req.params.noteId) && req.params.noteId;
    if (!noteId) throw new Error("ERR_NOTE_IDENTIFIER_INVALID");

    if (!req.body.note) throw new Error("ERR_NOTE_IDENTIFIER_INVALID");

    const note = await Note.findByIdAndUpdate(
      { _id: noteId, owner: req.user._id },
      { $set: { note: req.body.note } },
      { new: true }
    );

    if (note) {
      // Trigger Task.save() to recalculate the number of notes in the task
      Task.findById(note.task)
        .then(task =>
          task
            .save()
            .then(tas => null)
            .catch(err => console.warn(err))
        )
        .catch(err => console.warn(err));

      res.status(201).json({
        message: `Note ${note.title} successfully updated!`,
        note
      });
    } else {
      throw new RangeError("ERR_NOTE_NOT_FOUND");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @route   DELETE /notes/:noteId
// @desc    Delete a note
exports.deleteNote = async (req, res, next) => {
  try {
    const noteId = mongoIdRgx.test(req.params.noteId) && req.params.noteId;
    if (!noteId) throw new Error("ERR_NOTE_IDENTIFIER_INVALID");

    const note = await Note.findOneAndDelete({
      _id: noteId,
      owner: req.user._id
    });

    if (note) {
      // Trigger Task.save() to recalculate the number of notes in the task
      Task.findById(note.task)
        .then(task => task.save().then())
        .catch(console.log);

      res.status(200).json({
        message: `Note successfully deleted!`
      });
    } else {
      throw new RangeError("ERR_NOTE_NOT_FOUND");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};
