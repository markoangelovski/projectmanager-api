const router = require("express").Router();

// Middlewares
const { hasBody } = require("../../../middlewares/users/checkUser");

// Controllers
const {
  postNote,
  getNotesByTask,
  getNotes,
  patchNote,
  deleteNote
} = require("./notes.controller");

// @route   POST /notes/:taskId
// @desc    Create a new Note
router.post("/", hasBody, postNote);

// @route   GET /notes
// @desc    Get Notes by task or all Notes
router.get("/", getNotesByTask, getNotes);

// @route   PATCH /Notesa
// @desc    Edit Notes
router.patch("/:noteId", hasBody, patchNote);

// @route   DELETE /Notes/:NoteId
// @desc    Delete Notes
router.delete("/:noteId", deleteNote);

module.exports = router;
