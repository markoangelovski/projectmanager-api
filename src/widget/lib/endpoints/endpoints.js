import { makeGenericCall } from "../factory/factory.js";

var a = window.aga;

export const ping = makeGenericCall({ method: "get" });

// Users
export const auth = makeGenericCall({
  method: "post",
  endpoint: `/v${a.version}/auth/`
});

export const login = makeGenericCall({
  method: "post",
  endpoint: `/v${a.version}/auth/login/`
});

export const logout = makeGenericCall({
  method: "get",
  endpoint: `/v${a.version}/auth/logout/`
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
  endpoint: `/v${a.version}/projects/`
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
  endpoint: `/v${a.version}/tasks/`
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
