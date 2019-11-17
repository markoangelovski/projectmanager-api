const express = require("express");

const router = express.Router();

// Models
const Task = require("../../models/task");
const Note = require("../../models/note");

// @route   POST /notes
// @desc    Create a new note
router.post("/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("links")
      .populate("notes");
    if (task) {
      const note = new Note({
        note: req.body.note,
        task: req.params.taskId
      });
      task.notes.push(note);

      [savedTask, savedNote] = await Promise.all([task.save(), note.save()]);

      res.status(201).json({
        message: `Note "${savedNote.note}" successfully stored!`,
        task: savedTask
      });
    } else {
      res.status(404).json({
        message: "Task not found!",
        error: "Task you are trying to update was not found."
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: `Service connection error ocurred: ${error.message}`,
      error
    });
  }
});

// notes/:noteId?note={note tex}
// @route   PATCH /notes
// @desc    Update a note
router.patch("/:noteId", async (req, res) => {
  try {
    // Set payload to update
    const id = req.params.noteId;
    const value = JSON.parse(req.query.note);

    const updated = await Note.updateOne(
      { _id: id },
      { $set: { note: value } }
    );
    const note = await Note.findById(id);
    const task = await Task.findById(note.task)
      .populate("links")
      .populate("notes");

    if (!updated.n) {
      res.status(404).json({
        message: "Note not found!",
        error: "Note you are trying to update could not be found."
      });
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
    res.status(500).json({
      message: `Service connection error ocurred: ${error.message}`,
      error
    });
  }
});

// @route   DELETE /notes/:taskId?noteId={noteId}
// @desc    Delete a note
router.delete("/:taskId", async (req, res) => {
  try {
    // Find Task and Note in DB
    const [taskToUpdate, noteToUpdate] = await Promise.all([
      Task.findById(req.params.taskId)
        .populate("links")
        .populate("notes"),
      Note.findById(req.query.noteId)
    ]);

    // If Task or Note are found, delete the Note and note entry from task
    if (taskToUpdate || noteToUpdate) {
      taskToUpdate.notes = taskToUpdate.notes.filter(
        note => note._id != req.query.noteId
      );
      const [deletedNote, updatedTask] = await Promise.all([
        Note.findByIdAndDelete(req.query.noteId),
        taskToUpdate.save()
      ]);

      res.status(200).json({
        message: `Note "${deletedNote.note}" successfully deleted!`,
        task: updatedTask
      });
    } else {
      res.status(404).json({
        message: "Task or Note not found",
        error: "Note that you are trying to delete could not be found."
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      message: `Service connection error ocurred: ${error.message}`,
      error
    });
  }
});

module.exports = router;
