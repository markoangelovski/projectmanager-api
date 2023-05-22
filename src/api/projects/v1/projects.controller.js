// Models
const Project = require("./projects.model");

// Validation
const { mongoIdRgx } = require("../../../validation/regex");
const { projectSchema } = require("../../../validation/project");

// Helper functions
const {
  getQueryConditions
} = require("../../../lib/Helpers/getQueryConditions");

// @route   POST /projects
// @desc    Create a new project
// Request JSON body:
// {
//   "title": "New Project"
//   "description":
//   "pl":
//   "kanboard":
//   "dev":
//   "stage":
//   "prod":
//   "live":
//   "nas":
// }
exports.postProject = async (req, res, next) => {
  try {
    const result = projectSchema.validate(req.body);
    if (result.error) throw new Error(result.error);

    const project = new Project({
      owner: req.user._id,
      ...result.value
    });
    await project.save();

    res.status(201).json({
      message: `Project ${project.title} successfully created!`,
      project
    });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @route   GET /projects/:projectId
// @desc    Get all projects
exports.getSingleProject = async (req, res, next) => {
  try {
    const projectId =
      mongoIdRgx.test(req.params.projectId) && req.params.projectId;
    if (!projectId) throw new Error("ERR_PROJECT_IDENTIFIER_INVALID");

    const project = await Project.findOne({
      _id: projectId,
      owner: req.user._id
    });

    if (project) {
      res.status(200).json({
        message: "Project successfully fetched!",
        project
      });
    } else {
      throw new RangeError("ERR_PROJECT_NOT_FOUND");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @route   GET /projects
// @desc    Get all projects
exports.getProjects = async (req, res, next) => {
  try {
    const { stats, docs } = await getQueryConditions(req, Project);

    if (stats && stats.total) {
      res.status(200).json({
        message: "Projects successfully fetched!",
        stats,
        projects: docs
      });
    } else {
      throw new RangeError("ERR_PROJECTS_NOT_FOUND");
    }
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// @route   PATCH /projects/:projectId
// @desc    Update project
// Request JSON body, array of values to be updated:
// [{"propName": "title", "propValue": "Updated title"},
//  {"propName": "description", "propValue": "Updated Description value"}]
exports.patchProject = async (req, res, next) => {
  try {
    const projectId =
      mongoIdRgx.test(req.params.projectId) && req.params.projectId;
    if (!projectId) throw new Error("ERR_PROJECT_IDENTIFIER_INVALID");

    const updateOps = {};
    req.body.forEach(element =>
      element.propValue
        ? (updateOps[element.propName] = element.propValue)
        : null
    );

    const result = projectSchema.validate(updateOps);
    if (result.error) throw new Error(result.error);

    const updatedProject = await Project.updateOne(
      { owner: req.user, _id: projectId },
      { $set: result.value }
    );

    if (!updatedProject.n) {
      const error = new RangeError("ERR_PROJECT_NOT_FOUND");
      next(error);
    } else if (!updatedProject.nModified) {
      res.status(200).json({
        message: "No detail modifications detected. No actions taken."
      });
    } else if (updatedProject.nModified) {
      res.status(200).json({
        message: "Project successfully updated!"
      });
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
};

// @route   DELETE /projects/:projectId
// @desc    Delete a project
exports.deleteProject = async (req, res, next) => {
  try {
    const projectId =
      mongoIdRgx.test(req.params.projectId) && req.params.projectId;
    if (!projectId) throw new Error("ERR_PROJECT_IDENTIFIER_INVALID");

    const project = await Project.findOneAndDelete({
      _id: projectId,
      owner: req.user._id
    });

    if (project) {
      res.status(200).json({
        message: `Project ${project.title} successfully deleted!`,
        project
      });
    } else {
      res.status(404).json({
        message: "Project not found!",
        error: "ERR_PROJECT_NOT_FOUND"
      });
    }
  } catch (error) {
    console.error(error.message);
    next(error);
  }
};
