// app.js
require('dotenv').config();
const express = require('express');
const cors = require("cors");

const authRoutes = require('./routes/authRoutes.js');
const locationRoutes = require('./routes/locationRoutes');
const profileRoutes = require("./routes/profileRoutes");
const bloodGroupRoutes = require("./routes/bloodGroupRoutes");

const app = express();

app.use(cors({ origin: ["http://localhost:5173"], credentials: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);
app.use("/api", profileRoutes);
app.use("/api", bloodGroupRoutes);

module.exports = app;
