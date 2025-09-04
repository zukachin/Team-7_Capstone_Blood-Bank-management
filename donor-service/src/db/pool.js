const pg = require("pg");

const pool = new pg.Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "susi2003",
  database: "blood_bank"
});

module.exports = { pool };
