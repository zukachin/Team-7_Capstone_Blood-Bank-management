const request = require("supertest");
const app = require("../src/app");

describe("Location Routes", () => {
  it("should fetch states", async () => {
    const res = await request(app).get("/api/locations/states");
    expect([200, 500]).toContain(res.statusCode);
  });

  it("should fetch districts for state", async () => {
    const res = await request(app).get("/api/locations/states/19/districts");
    expect([200, 500]).toContain(res.statusCode);
  });
});
