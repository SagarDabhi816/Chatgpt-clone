const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
/* Routes */
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

// Creating Server
const app = express();
app.use(
  cors({
    origin: 'http://localhost:5173',
    // methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  }),
);  

// Using Middlewares
app.use(cookieParser());
app.use(express.json());

/* Using Routes */
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
