require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes.js");
const { pool } = require("./db/pool");

const app = express();
app.use(express.json());

app.use("/api/users", authRoutes);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Donor Service running on port ${PORT}`);
});

// ---------- TEMP: Show current DB and table list ----------
pool.query("SELECT current_database()", (err, result) => {
  if (err) {
    console.error("Error getting DB name:", err);
  } else {
    console.log("Connected to database:", result.rows[0].current_database);
  }

  pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'",
    (err2, result2) => {
      if (err2) {
        console.error("Failed to list tables:", err2);
      } else {
        console.log("Tables in DB:", result2.rows);
      }
    }
  );
});
// ----------------------------------------------------------
