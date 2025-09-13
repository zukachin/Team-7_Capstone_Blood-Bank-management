// server.js
require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes.js');
const { requireAuth } = require('./middlewares/authMiddleware.js');
const pool = require('./db/pool.js');
const cors = require("cors");
const locationRoutes = require('./routes/locationRoutes');
const profileRoutes = require("./routes/profileRoutes");
const bloodGroupRoutes = require("./routes/bloodGroupRoutes");

const app = express();
app.use(cors({ origin: ["http://localhost:5173"], credentials: false }));
app.use(express.json());  // ✅ must be here before routes
app.use(express.urlencoded({ extended: true }));



app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);

app.use("/api", profileRoutes);
app.use("/api", bloodGroupRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
