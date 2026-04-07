const cookieParser = require("cookie-parser");
const express = require("express");
/* Routes */
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

// Creating Server
const app = express();

// Using Middlewares
app.use(cookieParser());
app.use(express.json());

/* Using Routes */

app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
