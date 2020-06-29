const request = require("supertest");
const { expect } = require("chai");
const bcrypt = require("bcryptjs");

const app = require("../../../../app");
const { User } = require("../../users/v1/users.model");
const Project = require("./projects.model");

const user = { email: "test@user.com", password: "testpassword" };
const project = { title: "12345" };
const updateProject = [
  { propName: "title", propValue: "Updated title" },
  { propName: "description", propValue: "Updated Description" }
];

let cookie, projectId;

describe("POST /v1/auth/login", () => {
  before(async () => {
    const password = await bcrypt.hash("testpassword", 12);
    const newUser = new User({
      email: "test@user.com",
      avatar_url: "https://www.google.com",
      password,
      role: "admin"
    });
    await newUser.save();
  });

  after(async () => {
    await User.collection.drop();
  });

  it("should log in a user", async () => {
    const response = await request(app)
      .post("/v1/auth/login")
      .send(user)
      .expect(200);
    cookie = response.headers["set-cookie"][0];
    expect(response.body.user).to.have.property("_id");
  });
});

describe("POST /v1/projects", () => {
  it("should create a new project", async () => {
    const response = await request(app)
      .post("/v1/projects")
      .set("Cookie", cookie)
      .send(project)
      .expect(201);
    projectId = response.body.project._id;
    expect(response.body).to.have.property("project");
  });
});

describe("GET /v1/projects", () => {
  it("should fetch all projects", async () => {
    const response = await request(app)
      .get("/v1/projects")
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body).to.have.property("projects");
  });
});

describe("PATCH /v1/projects", () => {
  it("should update a project", async () => {
    const response = await request(app)
      .patch(`/v1/projects/${projectId}`)
      .set("Cookie", cookie)
      .send(updateProject)
      .expect(200);
    expect(response.body.message).to.equal("Project successfully updated!");
  });
});

describe(" DELETE /v1/projects", () => {
  after(async () => {
    await Project.collection.drop();
  });

  it("should delete a project", async () => {
    const response = await request(app)
      .delete(`/v1/projects/${projectId}`)
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.message).to.contain("successfully deleted");
  });
});

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
