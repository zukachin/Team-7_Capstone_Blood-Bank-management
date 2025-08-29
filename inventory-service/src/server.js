const express = require("express");
const cors = require("cors");
require("dotenv").config();
const path = require("path"); 

const authRoutes = require("./routes/authRoutes");
const donorRoutes = require("./routes/donorRoutes");
// const counselingRoutes = require("./routes/counselingRoutes");

const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Configuration
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Blood Bank Management API",
      version: "1.0.0",
      description: "API documentation for Blood Bank Management System",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [path.join(__dirname, "./routes/*.js")],

};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
app.use("/auth", authRoutes);
app.use("/donor", donorRoutes);
// app.use("/counseling", counselingRoutes);

app.get("/", (req, res) => res.send("Blood Bank API Running"));

// Server Start
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
