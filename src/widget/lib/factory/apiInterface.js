import {
  ping,
  auth,
  login,
  logout,
  createProject,
  getSingleProject,
  getProjects,
  updateProject,
  deleteProject,
  createTask,
  getSingleTask,
  getTasksByProject,
  getTasks,
  updateTask,
  deleteTask,
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  createLog,
  updateLog,
  deleteLog
} from "../endpoints/endpoints.js";

import { widDocs } from "../../lib/docs/widDocs.js";

// Main API store
export const methods = {
  hello: () => console.log("Stay a while and listen!"),
  ping,
  auth,
  login,
  logout,
  createProject,
  getSingleProject,
  getProjects,
  updateProject,
  deleteProject,
  createTask,
  getSingleTask,
  getTasksByProject,
  getTasks,
  updateTask,
  deleteTask,
  createEvent,
  getEvents,
  updateEvent,
  deleteEvent,
  createLog,
  updateLog,
  deleteLog,
  docs: widDocs
};

// Interface factory
export default function api(key) {
  if (!methods[key]) {
    console.warn(
      `[AGA Library] - aga("${key}", ...) is not a valid aga command.`
    );
    return false;
  }
  const args = Array.prototype.slice.call(arguments, 1);
  return methods[key].apply(methods, args);
}
