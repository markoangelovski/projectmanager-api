import * as ep from "../endpoints/endpoints.js";

import { widDocs } from "../../lib/docs/widDocs.js";

// Main API store
export const methods = {
  hello: () => console.log("Stay a while and listen!"),
  ping: ep.ping,
  auth: ep.auth,
  login: ep.login,
  logout: ep.logout,
  createProject: ep.createProject,
  getSingleProject: ep.getSingleProject,
  getProjects: ep.getProjects,
  updateProject: ep.updateProject,
  deleteProject: ep.deleteProject,
  createTask: ep.createTask,
  getSingleTask: ep.getSingleTask,
  getTasksByProject: ep.getTasksByProject,
  getTasks: ep.getTasks,
  updateTask: ep.updateTask,
  deleteTask: ep.deleteTask,
  createEvent: ep.createEvent,
  getEvents: ep.getEvents,
  updateEvent: ep.updateEvent,
  deleteEvent: ep.deleteEvent,
  createLog: ep.createLog,
  updateLog: ep.updateLog,
  deleteLog: ep.deleteLog,
  createLocale: ep.createLocale,
  getLocales: ep.getLocales,
  updateLocale: ep.updateLocale,
  getScans: ep.getScans,
  scanLocale: ep.scanLocale,
  scanLocales: ep.scanLocales,
  createReport: ep.createReport,
  docs: widDocs
};

// Interface factory
export default function api(key) {
  if (!key) {
    console.warn("[AGA Library] - You need to provide an argument to aga().");
    return false;
  }
  if (!methods[key]) {
    console.warn(
      `[AGA Library] - aga("${key}", ...) is not a valid aga command.`
    );
    return false;
  }
  const args = Array.prototype.slice.call(arguments, 1);
  return methods[key].apply(methods, args);
}
