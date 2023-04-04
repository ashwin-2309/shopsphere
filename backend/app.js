const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");

// Middlewares
const errorMiddleware = require("./middleware/error");
app.use(express.json());
app.use(cookieParser());

// Route imports
const productRoutes = require("./routes/productRoute");
const userRoutes = require("./routes/userRoute");
const orderRoutes = require("./routes/orderRoute");

// Mounting routes
app.use("/api/v1", productRoutes);
app.use("/api/v1", userRoutes);
app.use("/api/v1", orderRoutes);

// Middleware to handle errors
app.use(errorMiddleware);

module.exports = app;
