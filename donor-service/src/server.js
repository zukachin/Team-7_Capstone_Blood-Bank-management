require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes.js");
const profileRoutes = require("./routes/profileRoutes.js"); // <-- import profile routes
const { pool } = require("./db/pool");

const app = express();
app.use(express.json());

// Auth routes
app.use("/api/users", authRoutes);

// Profile routes (protected by JWT)
app.use("/api", profileRoutes); // <-- all routes in profileRoutes.js start with /api

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Donor Service running on port ${PORT}`);
});
