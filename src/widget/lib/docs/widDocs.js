export function widDocs() {
  // User endpoints
  console.groupCollapsed("User endpoints:");
  console.log("aga('hello')", { description: "Says hi." });
  console.log("aga('ping')", { description: `Pings ${window.aga.rootUrl}` });
  console.log("aga('auth')", {
    description: "Checks if user is authenticated."
  });
  console.log("aga('login', {pl}, cb(err,res)", {
    description: "Log in.",
    payload: { body: { email: "user@email.com", password: "password" } }
  });
  console.groupEnd();

  // Project Endpoints
  console.groupCollapsed("Project endpoints:");
  console.log("aga('createProject', {pl}, cb(err,res))", {
    description: "Creates a new project",
    payload: { body: { title: "Project title" } }
  });
  console.log("aga('getSingleProject', {pl}, cb(err,res))", {
    description: "Gets a single project by _id.",
    payload: { params: "project _id" }
  });
  console.log("aga('getProjects', {pl}, cb(err,res))", {
    description: "Gets all projects with set limit, skip and sort parameters.",
    payload: {
      query: { limit: "10", skip: "0", sort: "title" }
    }
  });
  console.log("aga('updateProject', {pl}, cb(err,res))", {
    description: "Updates project.",
    payload: {
      params: "project _id",
      body: [{ propName: "title", propValue: "Updated title" }]
    }
  });
  console.log("aga('deleteProject', {pl}, cb(err,res))", {
    description: "Deletes project.",
    payload: { params: "5f838a2c28963c15f737a3f1" }
  });
  console.groupEnd();

  // Task Endpoints
  console.groupCollapsed("Task endpoints:");
  console.log("aga('createTask', {pl}, cb(err,res))", {
    description: "Creates a new task for a specified project.",
    payload: { body: { title: "Task title", project: "project _id" } }
  });
  console.log("aga('getSingleTask', {pl}, cb(err,res))", {
    description: "Gets a single task by _id.",
    payload: { query: { task: "task _id" } }
  });
  console.log("aga('getTasksByProject', {pl}, cb(err,res))", {
    description: "Gets all tasks for a specified project.",
    payload: { query: { project: "project _id" } }
  });
  console.log("aga('getTasks', {pl}, cb(err,res))", {
    description: "Gets all tasks with set limit, skip and sort parameters.",
    payload: { query: { limit: "10", skip: "0", sort: "title" } }
  });
  console.log("aga('updateTask', {pl}, cb(err,res))", {
    description: "Updates task.",
    payload: {
      params: "task _id",
      body: [{ propName: "title", propValue: "Updated Title" }]
    }
  });
  console.log("aga('deleteTask', {pl}, cb(err,res))", {
    description: "Deletes task.",
    payload: { params: "task _id" }
  });
  console.groupEnd();

  // Event Endpoints
  console.groupCollapsed("Event endpoints:");
  console.log("aga('createEvent', {pl}, cb(err,res))", {
    description: "Creates a new event for a specified day.",
    payload: {
      body: {
        day: "2020-10-12",
        task: "",
        title: "Event title",
        duration: "event duration, increments of 0.25",
        start: "day start hour"
      }
    }
  });
  console.log("aga('getEvents', {pl}, cb(err,res))", {
    description:
      "Gets all events in a given time period or single day by day _id or a single task by task _id.",
    payload: {
      query: {
        start: "start date, format YYYY-MM-DD",
        end: "end date, format YYYY-MM-DD",
        id: "day _id",
        task: "task _id"
      }
    }
  });
  console.log("aga('updateEvent', {pl}, cb(err,res))", {
    description: "Updates event.",
    payload: {
      params: "event _id",
      body: [
        { propName: "title", propValue: "Updated title" },
        { propName: "booked", propValue: "false" }
      ]
    }
  });
  console.log("aga('deleteEvent', {pl}, cb(err,res))", {
    description: "Deletes event.",
    payload: { params: "day _id/event _id" }
  });
  console.groupCollapsed("Log endpoints:");
  console.log("aga('createLog', {pl}, cb(err,res))", {
    description: "Creates a new log for a given event.",
    payload: {
      body: {
        event: "event _id",
        title: "Log title",
        duration: "log duration, increments of 0.25"
      }
    }
  });
  console.log("aga('updateLog', {pl}, cb(err,res))", {
    description: "Updates log.",
    payload: {
      params: "log _id",
      body: [
        { propName: "title", propValue: "Updated title" },
        {
          propName: "duration",
          propValue: "log duration, increments of 0.25"
        }
      ]
    }
  });
  console.log("aga('deleteLog', {pl}, cb(err,res))", {
    description: "Deletes task.",
    payload: { params: "log _id" }
  });
  console.groupEnd();
}
