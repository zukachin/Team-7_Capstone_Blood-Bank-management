const request = require("supertest");
const app = require("../src/app"); // adjust path if needed

describe("Blood Group Routes", () => {
  it("should fetch all blood groups", async () => {
    const res = await request(app).get("/api/blood-groups"); // ✅ matches your route
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    if (res.body.length > 0) {
      expect(res.body[0]).toHaveProperty("id");
      expect(res.body[0]).toHaveProperty("group_name");
    }
  });
});
