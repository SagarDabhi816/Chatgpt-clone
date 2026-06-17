const cookieParser = require("cookie-parser");
const express = require("express");
const cors = require("cors");
const path = require("path")
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
app.use(express.static(path.join(__dirname,'../public')))

app.get("*name",(req,res)=>{
  res.sendFile(path.join(__dirname,'../public/index.html'))
})

/* Using Routes */
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

module.exports = app;
