const request = require("supertest");
const { expect } = require("chai");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const app = require("../../../../app");
const { User } = require("../../users/v1/users.model");
const Project = require("../../projects/v1/projects.model");
const Task = require("../../tasks/v1/tasks.model");

const project = { title: "12345" };
const task = { title: "12345", dueDate: "2020-06-29" };

let cookie, projectId, taskId;

describe("POST /v1/tasks", () => {
  before(async () => {
    const password = await bcrypt.hash("testpassword", 12);
    const newUser = new User({
      email: "test@user.com",
      avatar_url: "https://www.google.com",
      password,
      role: "admin"
    });
    await newUser.save();
    const user = {
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role
    };
    const token = jwt.sign(user, process.env.JWT, { expiresIn: "1d" });
    cookie = `auth=Bearer%20${token}; Path=/; HttpOnly; Secure; SameSite=None`;
    project.owner = newUser._id;
    await Project.create(project).then(proj => (task.project = proj._id));
  });

  it("should return 500 status and message", async () => {
    const response = await request(app)
      .post("/v1/tasks")
      .set("Cookie", cookie)
      .send({ title: "1234" })
      .expect(500);
    expect(response.body.message).to.equal("ERR_PROJECT_IDENTIFIER_INVALID");
    expect(response.body).to.have.property("error");
  });

  it("should create a new task", async () => {
    const response = await request(app)
      .post("/v1/tasks")
      .set("Cookie", cookie)
      .send(task)
      .expect(201);
    taskId = response.body.task._id;
    expect(response.body.message).to.contain("successfully created!");
    expect(response.body).to.have.property("task");
  });
});

describe("GET /v1/tasks?task=taskId", () => {
  after(async () => {
    await User.collection.drop();
    await Project.collection.drop();
    await Task.collection.drop();
  });

  it("should return 500 status and a message", async () => {
    const response = await request(app)
      .get("/v1/tasks?task=1234")
      .set("Cookie", cookie)
      .expect(500);
    expect(response.body.message).to.contain("ERR_TASK_IDENTIFIER_INVALID");
    expect(response.body).to.have.property("error");
  });

  it("should return 404 status and a message", async () => {
    const response = await request(app)
      .get("/v1/tasks?task=5de06639dcaabc585f230340")
      .set("Cookie", cookie)
      .expect(404);
    expect(response.body.message).to.contain("Task not found");
    expect(response.body.error).to.equal("ERR_TASK_NOT_FOUND");
  });

  it("should return a requested task", async () => {
    const response = await request(app)
      .get(`/v1/tasks?task=${taskId}`)
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.message).to.contain("successfully found");
    expect(response.body).to.have.property("task");
  });
});

// describe("GET /v1/projects", () => {
//   it("should fetch all projects", async () => {
//     const response = await request(app)
//       .get("/v1/projects")
//       .set("Cookie", cookie)
//       .expect(200);
//     expect(response.body).to.have.property("projects");
//   });
// });

// describe("PATCH /v1/projects", () => {
//   it("should update a project", async () => {
//     const response = await request(app)
//       .patch(`/v1/projects/${projectId}`)
//       .set("Cookie", cookie)
//       .send(updateProject)
//       .expect(200);
//     expect(response.body.message).to.equal("Project successfully updated!");
//   });
// });

// describe(" DELETE /v1/projects", () => {
//   after(async () => {
//     await Project.collection.drop();
//   });

//   it("should delete a project", async () => {
//     const response = await request(app)
//       .delete(`/v1/projects/${projectId}`)
//       .set("Cookie", cookie)
//       .expect(200);
//     expect(response.body.message).to.contain("successfully deleted");
//   });
// });

// describe("GET /v1/auth/logout", () => {
//   it("should respond with a message", async () => {
//     const response = await request(app)
//       .get("/v1/auth/logout")
//       .set("Cookie", cookie)
//       .expect(200);
//     expect(response.body.message).to.equal("Logout successful!");
//   });
// });

// describe("PATCH /v1/auth/update", () => {
//   it("should add a service", async () => {
//     const response = await request(app)
//       .patch("/v1/auth/update?service=add:locale")
//       .set("Cookie", cookie)
//       .expect(201);
//     expect(response.body.message).to.equal("Settings successfully stored.");
//   });

//   it("should add a service", async () => {
//     const response = await request(app)
//       .patch("/v1/auth/update?service=add:scan")
//       .set("Cookie", cookie)
//       .expect(201);
//     expect(response.body.message).to.equal("Settings successfully stored.");
//   });

//   it("should remove a service", async () => {
//     const response = await request(app)
//       .patch("/v1/auth/update?service=remove:locale")
//       .set("Cookie", cookie)
//       .expect(201);
//     expect(response.body.message).to.equal("Settings successfully stored.");
//   });
// });

// describe(" POST /auth/api-key?services=locale", () => {
//   it("should create API key", async () => {
//     const response = await request(app)
//       .post("/v1/auth/api-key?services=scan")
//       .set("Cookie", cookie)
//       .expect(201);
//     key = response.body.key;
//     expect(response.body.message).to.equal("API key created successfully!");
//   });
// });

// describe(" GET /auth/api-key", () => {
//   it("should fetch API keys", async () => {
//     const response = await request(app)
//       .get("/v1/auth/api-key")
//       .set("Cookie", cookie)
//       .expect(200);
//     expect(response.body.message).to.equal("Keys successfully fetched!");
//   });
// });
