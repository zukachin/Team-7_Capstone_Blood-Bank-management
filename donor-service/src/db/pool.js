const pg = require("pg");

const pool = new pg.Pool({
  host: "localhost",
  user: "postgres",
  password: "admin",
  database: "blood_bank"
});

module.exports = { pool };
