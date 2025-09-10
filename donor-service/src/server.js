// server.js
require('dotenv').config();
const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes.js');
const { requireAuth } = require('./middlewares/authMiddleware.js');
const pool = require('./db/pool.js');
const locationRoutes = require('./routes/locationRoutes');
const profileRoutes = require("./routes/profileRoutes");
const bloodGroupRoutes = require("./routes/bloodGroupRoutes");

app.use(express.json());


app.use('/api/auth', authRoutes);
app.use('/api/locations', locationRoutes);

app.use("/api", profileRoutes);
app.use("/api", bloodGroupRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
