const request = require("supertest");
const { expect } = require("chai");
const bcrypt = require("bcryptjs");

const app = require("../../../../app");
const User = require("./users.model");

const user = { email: "test@user.com", password: "testpassword" };
let cookie;

describe("GET /v1/auth", () => {
  it("shoud respond with a message", async () => {
    const response = await request(app).get("/v1/auth").expect(200);
    expect(response.body.message).to.equal("Success!");
  });
});

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
      .send({ email: "test@user.com", password: "testpassword" })
      .expect(200);
    cookie = response.headers["set-cookie"][0];
    expect(response.body.user).to.have.property("_id");
  });
});

describe("POST /v1/auth/register", () => {
  after(async () => {
    await User.collection.drop();
  });

  it("should require a body", async () => {
    const response = await request(app)
      .post("/v1/auth/register")
      .set("Cookie", cookie)
      .send({})
      .expect(422);
    expect(response.body.message).to.equal(
      "Oops! You're up to no good, aren't ya? Missing something?"
    );
  });

  it("should require user email", async () => {
    const response = await request(app)
      .post("/v1/auth/register")
      .set("Cookie", cookie)
      .send({ data: "some data" })
      .expect(422);
    expect(response.body.message).to.equal('"email" is required');
  });

  it("should require password", async () => {
    const response = await request(app)
      .post("/v1/auth/register")
      .set("Cookie", cookie)
      .send({ email: "test@user.com" })
      .expect(422);
    expect(response.body.message).to.equal('"password" is required');
  });

  it("should register a new user", async () => {
    const response = await request(app)
      .post("/v1/auth/register")
      .set("Cookie", cookie)
      .send(user)
      .expect(201);
    expect(response.body).to.have.property("user");
  });

  it("should not allow a user with existing email", async () => {
    const response = await request(app)
      .post("/v1/auth/register")
      .set("Cookie", cookie)
      .send(user)
      .expect(409);
    expect(response.body.message).to.equal("Username already exists!");
  });
});
