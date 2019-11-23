const request = require("supertest");
const { expect } = require("chai");

const app = require("../../app");
const User = require("../../models/user");

const user = { email: "test@user.com", password: "testpassword" };

describe("GET /v1/auth", () => {
  it("shoud respond with a message", async () => {
    const response = await request(app)
      .get("/v1/auth")
      .expect(200);
    expect(response.body.message).to.equal("Success!");
  });
});

describe("POST /v1/auth/register", () => {
  before(async () => {
    await User.collection.drop();
  });

  it("should require user email", async () => {
    const response = await request(app)
      .post("/v1/auth/register")
      .send({})
      .expect(422);
    expect(response.body.message).to.equal('"email" is required');
  });

  it("should require password", async () => {
    const response = await request(app)
      .post("/v1/auth/register")
      .send({ email: "test@user.com" })
      .expect(422);
    expect(response.body.message).to.equal('"password" is required');
  });

  it("should register a new user", async () => {
    const response = await request(app)
      .post("/v1/auth/register")
      .send(user)
      .expect(201);
    expect(response.body).to.have.property("user");
  });

  it("should not allow a user with existing email", async () => {
    const response = await request(app)
      .post("/v1/auth/register")
      .send(user)
      .expect(409);
    expect(response.body.message).to.equal("Username already exists!");
  });
});

describe("POST /v1/auth/login", () => {
  it("should require user name", async () => {
    const response = await request(app)
      .post("/v1/auth/login")
      .send({})
      .expect(422);
    expect(response.body.message).to.equal("Unable to login");
  });

  it("should require password", async () => {
    const response = await request(app)
      .post("/v1/auth/login")
      .send(user.email)
      .expect(422);
    expect(response.body.message).to.equal("Unable to login");
  });

  it("should not log in user with an invalid email", async () => {
    const user = { email: "test1@user.com", password: "testpassword" };
    const response = await request(app)
      .post("/v1/auth/login")
      .send(user)
      .expect(422);
    expect(response.body.message).to.equal("User not found!");
  });

  it("should not log in user with an invalid password", async () => {
    const user = { email: "test@user.com", password: "testpassword1" };
    const response = await request(app)
      .post("/v1/auth/login")
      .send(user)
      .expect(409);
    expect(response.body.message).to.equal("Unable to login");
  });

  it("should log in a user", async () => {
    const response = await request(app)
      .post("/v1/auth/login")
      .send(user)
      .expect(200);
    expect(response.body.user).to.have.property("_id");
  });
});
