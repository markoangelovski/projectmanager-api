const express = require("express");

const router = express.Router();

// Models
const Task = require("../../models/task");
const Link = require("../../models/link");

// @route   POST /links
// @desc    Create a new link
router.post("/:taskId", async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("links")
      .populate("notes");
    if (task) {
      const link = new Link({
        title: req.body.title,
        link: req.body.link,
        task: req.params.taskId
      });
      task.links.push(link);

      [savedTask, savedLink] = await Promise.all([task.save(), link.save()]);

      res.status(201).json({
        message: `Link "${savedLink.title}" successfully stored!`,
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

//links/:linkId?link={URI-encoded-values}
//{URI-encoded-values} === [{"propName":"name1","value":"value1"},{"propName":"name2","value":"value2"}]
// @route   PATCH /links
// @desc    Update a link
router.patch("/:linkId", async (req, res) => {
  // Set payload to update
  const id = req.params.linkId;
  const values = JSON.parse(req.query.link);

  let setValues = {};

  for (const ops of values) {
    setValues[ops.propName] = ops.value;
  }

  try {
    const updated = await Link.updateOne({ _id: id }, { $set: setValues });
    const link = await Link.findById(id);
    const task = await Task.findById(link.task)
      .populate("links")
      .populate("notes");

    if (!updated.n) {
      res.status(404).json({
        message: "Link not found!",
        error: "Link you are trying to edit was not found!"
      });
    } else if (!updated.nModified) {
      res.status(200).json({
        message: "No detail modifications detected. No actions taken.",
        task
      });
    } else if (updated.nModified) {
      res.status(201).json({
        message: "Link successfully updated!",
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

// @route   DELETE /links/:taskId?linkId={linkId}
// @desc    Delete a link
router.delete("/:taskId", async (req, res) => {
  try {
    // Find Task and Link in DB
    const [taskToUpdate, linkToUpdate] = await Promise.all([
      Task.findById(req.params.taskId)
        .populate("links")
        .populate("notes"),
      Link.findById(req.query.linkId)
    ]);

    // If Task or Links are found, delete the Link and link entry from task
    if (taskToUpdate || linkToUpdate) {
      taskToUpdate.links = taskToUpdate.links.filter(
        link => link._id != req.query.linkId
      );

      const [deletedLink, updatedTask] = await Promise.all([
        Link.findByIdAndDelete(req.query.linkId),
        taskToUpdate.save()
      ]);

      res.status(200).json({
        message: `Link "${deletedLink.title}" successfully deleted!`,
        task: updatedTask
      });
    } else {
      res.status(404).json({
        message: "Task or Link not found",
        error: "Link that you are trying to delete was not found!"
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
