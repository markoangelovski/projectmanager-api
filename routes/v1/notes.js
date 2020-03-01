const express = require("express");

const router = express.Router();

// Models
const Task = require("../../models/task");
const Note = require("../../models/note");

// @route   POST /notes/:taskId
// @desc    Create a new note
router.post("/:taskId", async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.taskId,
      owner: req.user._id
    })
      .populate("links")
      .populate("notes");

    if (task) {
      const note = new Note({
        note: req.body.note,
        task: req.params.taskId,
        owner: req.user
      });
      task.notes.push(note);

      [savedTask, savedNote] = await Promise.all([task.save(), note.save()]);

      res.status(201).json({
        message: `Note "${savedNote.note}" successfully stored!`,
        task: savedTask
      });
    } else {
      res.status(404);
      const error = new Error("Task you are trying to update was not found.");
      next(error);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500);
    next(error);
  }
});

// @route   GET /notes
// @desc    Create a new note
router.get("/", async (req, res, next) => {
  try {
    const notes = await Note.find({ owner: req.user });

    if (notes.length > 0) {
      res.json({
        message: "Notes susscessfully found!",
        notes
      });
    } else {
      res.status(404).json({
        error: "NOTES_NOT_FOUND",
        message: `Notes not found!`,
        notes
      });
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
});

// notes/:noteId?note={note text}
// @route   PATCH /notes
// @desc    Update a note
router.patch("/:noteId", async (req, res, next) => {
  try {
    // Set payload to update
    const id = req.params.noteId;
    const value = JSON.parse(req.query.note);

    const updated = await Note.updateOne(
      { _id: id, owner: req.user._id },
      { $set: { note: value } }
    );

    const note = await Note.findOne({ _id: id, owner: req.user._id });
    const task = await Task.findOne({ _id: note.task, owner: req.user._id })
      .populate("links")
      .populate("notes");

    if (!updated.n) {
      res.status(404);
      const error = new Error("Note you are trying to update was not found.");
      next(error);
    } else if (!updated.nModified) {
      res.status(200).json({
        message: "No detail modifications detected. No actions taken.",
        task
      });
    } else if (updated.nModified) {
      res.status(201).json({
        message: "Note successfully updated!",
        task
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500);
    next(error);
  }
});

// @route   DELETE /notes/:taskId?noteId={noteId}
// @desc    Delete a note
router.delete("/:taskId", async (req, res, next) => {
  try {
    // Find Task and Note in DB
    const [taskToUpdate, noteToUpdate] = await Promise.all([
      Task.findOne({ _id: req.params.taskId, owner: req.user._id })
        .populate("links")
        .populate("notes"),
      Note.findOne({ _id: req.query.noteId, owner: req.user._id })
    ]);

    // If Task or Note are found, delete the Note and note entry from task
    if (taskToUpdate && noteToUpdate) {
      taskToUpdate.notes = taskToUpdate.notes.filter(
        note => note._id != req.query.noteId
      );
      const [deletedNote, updatedTask] = await Promise.all([
        noteToUpdate.remove(),
        taskToUpdate.save()
      ]);

      res.status(200).json({
        message: `Note "${deletedNote.note}" successfully deleted!`,
        task: updatedTask
      });
    } else {
      res.status(404);
      const error = new Error(
        "Note that you are trying to delete could not be found."
      );
      next(error);
    }
  } catch (error) {
    console.error(error.message);
    res.status(500);
    next(error);
  }
});

module.exports = router;
