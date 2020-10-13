export function widDocs() {
  // User endpoints
  console.groupCollapsed("User endpoints:");
  console.log("aga('hello')", { description: "Says hi." });
  console.log("aga('ping')", { description: `Pings ${window.aga.rootUrl}` });
  console.log("aga('auth')", {
    description: "Checks if user is authenticated."
  });
  console.log("aga('login', {pl}, (err,res)=>{})", {
    description: "Log in.",
    payload: { body: { email: "user@email.com", password: "password" } }
  });
  console.groupEnd();

  // Project Endpoints
  console.groupCollapsed("Project endpoints:");
  console.log("aga('createProject', {pl}, (err,res)=>{})", {
    description: "Creates a new project",
    payload: { body: { title: "Project title" } }
  });
  console.log("aga('getSingleProject', {pl}, (err,res)=>{})", {
    description: "Gets a single project by _id.",
    payload: { params: "project _id" }
  });
  console.log("aga('getProjects', {pl}, (err,res)=>{})", {
    description: "Gets all projects with set limit, skip and sort parameters.",
    payload: {
      query: { limit: "10", skip: "0", sort: "title" }
    }
  });
  console.log("aga('updateProject', {pl}, (err,res)=>{})", {
    description: "Updates project.",
    payload: {
      params: "project _id",
      body: [{ propName: "title", propValue: "Updated title" }]
    }
  });
  console.log("aga('deleteProject', {pl}, (err,res)=>{})", {
    description: "Deletes project.",
    payload: { params: "5f838a2c28963c15f737a3f1" }
  });
  console.groupEnd();

  // Task Endpoints
  console.groupCollapsed("Task endpoints:");
  console.log("aga('createTask', {pl}, (err,res)=>{})", {
    description: "Creates a new task for a specified project.",
    payload: { body: { title: "Task title", project: "project _id" } }
  });
  console.log("aga('getSingleTask', {pl}, (err,res)=>{})", {
    description: "Gets a single task by _id.",
    payload: { query: { task: "task _id" } }
  });
  console.log("aga('getTasksByProject', {pl}, (err,res)=>{})", {
    description: "Gets all tasks for a specified project.",
    payload: { query: { project: "project _id" } }
  });
  console.log("aga('getTasks', {pl}, (err,res)=>{})", {
    description: "Gets all tasks with set limit, skip and sort parameters.",
    payload: { query: { limit: "10", skip: "0", sort: "title" } }
  });
  console.log("aga('updateTask', {pl}, (err,res)=>{})", {
    description: "Updates task.",
    payload: {
      params: "task _id",
      body: [{ propName: "title", propValue: "Updated Title" }]
    }
  });
  console.log("aga('deleteTask', {pl}, (err,res)=>{})", {
    description: "Deletes task.",
    payload: { params: "task _id" }
  });
  console.groupEnd();

  // Event Endpoints
  console.groupCollapsed("Event endpoints:");
  console.log("aga('createEvent', {pl}, (err,res)=>{})", {
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
  console.log("aga('getEvents', {pl}, (err,res)=>{})", {
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
  console.log("aga('updateEvent', {pl}, (err,res)=>{})", {
    description: "Updates event.",
    payload: {
      params: "event _id",
      body: [
        { propName: "title", propValue: "Updated title" },
        { propName: "booked", propValue: "false" }
      ]
    }
  });
  console.log("aga('deleteEvent', {pl}, (err,res)=>{})", {
    description: "Deletes event.",
    payload: { params: "day _id/event _id" }
  });
  console.groupCollapsed("Log endpoints:");
  console.log("aga('createLog', {pl}, (err,res)=>{})", {
    description: "Creates a new log for a given event.",
    payload: {
      body: {
        event: "event _id",
        title: "Log title",
        duration: "log duration, increments of 0.25"
      }
    }
  });
  console.log("aga('updateLog', {pl}, (err,res)=>{})", {
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
  console.log("aga('deleteLog', {pl}, (err,res)=>{})", {
    description: "Deletes log.",
    payload: { params: "log _id" }
  });
  console.groupEnd();
  console.groupEnd();

  // Locales Endpoints
  console.groupCollapsed("Locale endpoints:");
  console.log("aga('createLocale', {pl}, (err,res)=>{})", {
    description: "Creates a new locale.",
    payload: {
      headers: { "X-Service-Key": "AGA API key" },
      body: {
        project: "Project title, eg. Amazon",
        title: "Locale title, eg. Amazon en-us",
        url: "https://locale.url/",
        SiteTouchpoint: "",
        GoogleAnalyticsLocal: "",
        GoogleAnalyticsBrand: "",
        GoogleAnalyticsReportingView: "",
        SiteLocalContainer: "",
        ConsentOverlayID: "",
        FacebookRemarketingID: "",
        Segment: "",
        Lytics: ""
      }
    }
  });
  console.log("aga('getLocales', {pl}, (err,res)=>{})", {
    description: "Gets all locales for a specific query.",
    payload: {
      headers: { "X-Service-Key": "AGA API key" },
      query: {
        url: "https://locale.url",
        project: "Project title",
        title: "Locale title",
        SiteTouchpoint: "",
        GoogleAnalyticsLocal: "",
        GoogleAnalyticsReportingView: "",
        SiteLocalContainer: "",
        ConsentOverlayID: "",
        FacebookRemarketingID: "",
        Segment: "",
        Lytics: "",
        globalGTM: "GTM-PW4NS3V",
        "GTM.SiteCountry": "Any PGdataLayer.GTM parameter"
      }
    }
  });
  console.log("aga('updateLocale', {pl}, (err,res)=>{})", {
    description: "Updates locale.",
    payload: {
      headers: { "X-Service-Key": "AGA API key" },
      body: {
        url: "https://locale.url",
        title: "Locale title",
        SiteTouchpoint: "",
        GoogleAnalyticsLocal: "",
        GoogleAnalyticsBrand: "",
        GoogleAnalyticsReportingView: "",
        SiteLocalContainer: "",
        ConsentOverlayID: "",
        FacebookRemarketingID: "",
        Segment: "",
        Lytics: ""
      }
    }
  });
  console.groupEnd();

  // Scans Endpoints
  console.groupCollapsed("Scan endpoints:");
  console.log("aga('getScans', {pl}, (err,res)=>{})", {
    description: "Gets all scans for a given time period.",
    payload: {
      headers: { "X-Service-Key": "AGA API key" },
      query: {
        start: "start date, format YYYY-MM-DD",
        end: "end date, format YYYY-MM-DD"
      }
    }
  });
  console.log("aga('scanLocale', {pl}, (err,res)=>{})", {
    description: "Scans single locale.",
    payload: {
      headers: { "X-Service-Key": "AGA API key" },
      query: {
        url: "https://Scan.url"
      }
    }
  });
  console.log("aga('scanLocales', {pl}, (err,res)=>{})", {
    description: "Scans all locales. Runs once per day."
  });
  console.groupEnd();

  // Reports endpoint
  console.groupCollapsed("Report endpoints:");
  console.log("aga('createReport', {pl}, (err,res)=>{})", {
    description:
      "Creates .xlsx, .csv or a json a report with provided attributes.",
    payload: {
      headers: { "X-Service-Key": "AGA API key" },
      query: {
        format: "csv, xlsx or don't include for json format",
        type: "scan or locale",
        start: "for type scan, start date, format YYYY-MM-DD",
        end: "for type scan, end date, format YYYY-MM-DD",
        keys: "for type locale, select GTM keys to include in report",
        projects:
          "for type locale, select projects with comma separated values, eg. Amazon,Google"
      }
    }
  });
  console.groupEnd();
}
