const express = require("express");
const app = express();

// Middlewares
const errorMiddleware = require("./middleware/error");
app.use(express.json());

// Route imports
const productRoutes = require("./routes/productRoute");
const userRoutes = require("./routes/userRoute");

// Mounting routes
app.use("/api/v1", productRoutes);
app.use("/api/v1", userRoutes);

// Middleware to handle errors
app.use(errorMiddleware);

module.exports = app;
