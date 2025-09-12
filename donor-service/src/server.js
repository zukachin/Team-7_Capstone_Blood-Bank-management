
const express = require("express");
const authRoutes = require("./routes/authRoutes.js");
const profileRoutes = require("./routes/profileRoutes.js"); // <-- import profile routes
const donationCamps = require("./routes/donationCamps.js");
const { pool } = require("./db/pool");
const cors = require("cors");
const donorRegisterFormRoutes = require("./routes/donorRegisterFormRoutes.js");
require("dotenv").config();
const { requireAuth } = require('./middlewares/authMiddleware.js');
const locationRoutes = require('./routes/locationRoutes');
const bloodGroupRoutes = require("./routes/bloodGroupRoutes");


const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ["http://localhost:5173"], credentials: false }));
const appointmentRoutes = require("./routes/appointmentRoutes");

// Auth routes
app.use("/api/users", authRoutes);

app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);

app.use("/api", profileRoutes);
app.use("/api", bloodGroupRoutes);


// Profile routes (protected by JWT)
app.use("/api", profileRoutes); // <-- all routes in profileRoutes.js start with /api

app.use("/api/donation-camps", donationCamps);

app.use("/api/donors", donorRegisterFormRoutes);
app.use("/api/appointments", appointmentRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Donor Service running on port ${PORT}`);
});
