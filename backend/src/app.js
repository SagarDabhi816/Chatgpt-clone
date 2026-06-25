const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const path = require("path");
/* Routes */
const authRoutes = require("./routes/auth.routes");
const chatRoutes = require("./routes/chat.routes");

// Creating Server
const app = express();
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173", "http://localhost:5174",
  "https://chatgpt-clone-1-h5yx.onrender.com",
];
app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like curl/postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

// Using Middlewares
app.use(cookieParser());
app.use(express.json());

/* Using Routes */
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

/* Static files */
app.use(express.static(path.join(__dirname, "../public")));

/* SPA fallback LAST */
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});


module.exports = app;
