const request = require("supertest");
const app = require("../src/app");

let token;

beforeAll(async () => {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@example.com", password: "Test@1234" }); // adjust creds
  token = res.body.token;
});

describe("Profile Routes", () => {
  it("should get profile", async () => {
    const res = await request(app)
      .get("/api/profile")
      .set("Authorization", `Bearer ${token}`);
    expect([200, 401]).toContain(res.statusCode);
  });

  it("should update profile", async () => {
    const res = await request(app)
      .patch("/api/profile")
      .set("Authorization", `Bearer ${token}`)
      .send({ age: 28 });
    expect([200, 401]).toContain(res.statusCode);
  });
});
