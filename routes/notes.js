const express = require("express");

const router = express.Router();

// Models
const Task = require("../models/task");
const Note = require("../models/note");

// @route   POST /notes
// @desc    Create a new note
router.post("/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
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
        message: "Task not found!"
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

    if (!updated.n) {
      res.status(404).json({
        message: "Note not found!"
      });
    } else if (!updated.nModified) {
      res.status(200).json({
        message: "No detail modifications detected. No actions taken."
      });
    } else if (updated.nModified) {
      res.status(201).json({
        message: "Note successfully updated!"
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
      Task.findById(req.params.taskId),
      Note.findById(req.query.noteId)
    ]);

    // If Task or Note are found, delete the Note and note entry from task
    if (taskToUpdate || noteToUpdate) {
      taskToUpdate.notes = taskToUpdate.notes.filter(
        note => note != req.query.noteId
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
        message: "Task or Note not found"
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
