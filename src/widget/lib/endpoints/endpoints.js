import { makeGenericCall } from "../factory/factory.js";

var a = window.aga;

export const ping = makeGenericCall({ method: "get", plOptional: true });

// Users
export const auth = makeGenericCall({
  method: "post",
  endpoint: `/v${a.version}/auth/`,
  plOptional: true
});

export const login = makeGenericCall({
  method: "post",
  endpoint: `/v${a.version}/auth/login/`
});

export const logout = makeGenericCall({
  method: "get",
  endpoint: `/v${a.version}/auth/logout/`,
  plOptional: true
});

// Projects
export const createProject = makeGenericCall({
  method: "post",
  endpoint: `/v${a.version}/projects/`
});

export const getSingleProject = makeGenericCall({
  method: "get",
  endpoint: `/v${a.version}/projects/`
});

export const getProjects = makeGenericCall({
  method: "get",
  endpoint: `/v${a.version}/projects/`,
  plOptional: true
});

export const updateProject = makeGenericCall({
  method: "patch",
  endpoint: `/v${a.version}/projects/`
});

export const deleteProject = makeGenericCall({
  method: "delete",
  endpoint: `/v${a.version}/projects/`
});

// Tasks
export const createTask = makeGenericCall({
  method: "post",
  endpoint: `/v${a.version}/tasks/`
});

export const getSingleTask = makeGenericCall({
  method: "get",
  endpoint: `/v${a.version}/tasks/`
});

export const getTasksByProject = makeGenericCall({
  method: "get",
  endpoint: `/v${a.version}/tasks/`
});

export const getTasks = makeGenericCall({
  method: "get",
  endpoint: `/v${a.version}/tasks/`,
  plOptional: true
});

export const updateTask = makeGenericCall({
  method: "patch",
  endpoint: `/v${a.version}/tasks/`
});

export const deleteTask = makeGenericCall({
  method: "delete",
  endpoint: `/v${a.version}/tasks/`
});

// Events
export const createEvent = makeGenericCall({
  method: "post",
  endpoint: `/v${a.version}/days/event.create/`
});

export const getEvents = makeGenericCall({
  method: "get",
  endpoint: `/v${a.version}/days/event.find/`
});

export const updateEvent = makeGenericCall({
  method: "patch",
  endpoint: `/v${a.version}/days/event.update/`
});

export const deleteEvent = makeGenericCall({
  method: "delete",
  endpoint: `/v${a.version}/days/event.delete/`
});

export const createLog = makeGenericCall({
  method: "post",
  endpoint: `/v${a.version}/days/log.create/`
});

export const updateLog = makeGenericCall({
  method: "patch",
  endpoint: `/v${a.version}/days/log.update/`
});

export const deleteLog = makeGenericCall({
  method: "delete",
  endpoint: `/v${a.version}/days/log.delete/`
});

// Locales
export const createLocale = makeGenericCall({
  method: "post",
  endpoint: `/v${a.version}/locale/`
});

export const getLocales = makeGenericCall({
  method: "get",
  endpoint: `/v${a.version}/locale/`,
  plOptional: true
});

export const updateLocale = makeGenericCall({
  method: "patch",
  endpoint: `/v${a.version}/locale/`
});

// Scans
export const getScans = makeGenericCall({
  method: "get",
  endpoint: `/v${a.version}/scan/`
});

export const scanLocale = makeGenericCall({
  method: "get",
  endpoint: `/v${a.version}/scan/`
});

export const scanLocales = makeGenericCall({
  method: "post",
  endpoint: `/v${a.version}/scan/`,
  plOptional: true
});

// Reports
export const createReport = makeGenericCall({
  method: "get",
  endpoint: `/v${a.version}/report/`
});
