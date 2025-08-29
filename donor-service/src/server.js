require("dotenv").config();
const express = require("express");
const authRoutes = require("./routes/authRoutes.js");
const profileRoutes = require("./routes/profileRoutes.js"); // <-- import profile routes
const donationCamps = require("./routes/donationCamps.js");
const { pool } = require("./db/pool");
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(cors({ origin: ["http://localhost:5173"], credentials: false }));

// Auth routes
app.use("/api/users", authRoutes);

// Profile routes (protected by JWT)
app.use("/api", profileRoutes); // <-- all routes in profileRoutes.js start with /api

app.use("/api/donation-camps", donationCamps);

const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
  console.log(`Donor Service running on port ${PORT}`);
});
