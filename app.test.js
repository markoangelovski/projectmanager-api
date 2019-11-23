const request = require("supertest");
const { expect } = require("chai");

const app = require("./app");

describe("App GET /", () => {
  it("shoud respond with a message", async () => {
    const response = await request(app)
      .get("/")
      .expect(200);
    expect(response.body.status).to.equal("OK");
  });
});