const request = require("supertest");
const { expect } = require("chai");
const bcrypt = require("bcryptjs");

const app = require("../../../../app");
const { User, UserSettings } = require("./users.model");

const user = { email: "test@user.com", password: "testpassword" };
let cookie, key;

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
      .send({ key: "value" })
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

describe("GET /v1/auth", () => {
  it("shoud respond with a message", async () => {
    const response = await request(app).get("/v1/auth").expect(401);
    expect(response.body.message).to.equal("Un-authorized");
  });

  it("shoud respond with a message", async () => {
    const response = await request(app)
      .get("/v1/auth")
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.message).to.equal("Success!");
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

describe("GET /v1/auth/logout", () => {
  it("shoud respond with a message", async () => {
    const response = await request(app)
      .get("/v1/auth/logout")
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.message).to.equal("Logout successful!");
  });
});

describe("PATCH /v1/auth/update", () => {
  it("shoud add a service", async () => {
    const response = await request(app)
      .patch("/v1/auth/update?service=add:locale")
      .set("Cookie", cookie)
      .expect(201);
    expect(response.body.message).to.equal("Settings successfully stored.");
  });

  it("shoud add a service", async () => {
    const response = await request(app)
      .patch("/v1/auth/update?service=add:scan")
      .set("Cookie", cookie)
      .expect(201);
    expect(response.body.message).to.equal("Settings successfully stored.");
  });

  it("shoud remove a service", async () => {
    const response = await request(app)
      .patch("/v1/auth/update?service=remove:locale")
      .set("Cookie", cookie)
      .expect(201);
    expect(response.body.message).to.equal("Settings successfully stored.");
  });
});

describe(" POST /auth/api-key?services=locale", () => {
  it("shoud create API key", async () => {
    const response = await request(app)
      .post("/v1/auth/api-key?services=scan")
      .set("Cookie", cookie)
      .expect(201);
    key = response.body.key;
    expect(response.body.message).to.equal("API key created successfully!");
  });
});

describe(" GET /auth/api-key", () => {
  it("shoud fetch API keys", async () => {
    const response = await request(app)
      .get("/v1/auth/api-key")
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.message).to.equal("Keys successfully fetched!");
  });
});

describe(" DELETE /auth/api-key?key=123456", () => {
  after(async () => {
    await UserSettings.collection.drop();
  });

  it("shoud delete API key", async () => {
    const response = await request(app)
      .delete(`/v1/auth/api-key?key=${key}`)
      .set("Cookie", cookie)
      .expect(200);
    expect(response.body.message).to.equal("API Key successfully deleted.");
  });
});
