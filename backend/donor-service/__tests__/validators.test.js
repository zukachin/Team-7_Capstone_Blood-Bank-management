const { validationResult } = require("express-validator");
const {
  nameRules,
  emailRules,
  passwordRules,
  handleValidation
} = require("../src/validators/authValidators");

const runMiddleware = (req, res, middleware) =>
  new Promise((resolve) => {
    middleware(req, res, () => resolve());
  });

describe("Auth Validators", () => {
  it("should reject invalid email", async () => {
    const req = { body: { email: "bad", password: "Test@1234", name: "Ok Name" } };
    const res = {};
    await runMiddleware(req, res, emailRules);

    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(false);
  });

  it("should pass with valid data", async () => {
    const req = { body: { email: "valid@test.com", password: "Strong@123", name: "Valid User" } };
    const res = {};
    await runMiddleware(req, res, emailRules);
    await runMiddleware(req, res, passwordRules);
    await runMiddleware(req, res, nameRules);

    const errors = validationResult(req);
    expect(errors.isEmpty()).toBe(true);
  });
});
