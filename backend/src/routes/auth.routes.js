const express = require("express");
const authControllers = require("../controller/auth.controller");
const Router = express.Router();
const authMiddleware = require("../middleware/auth.middleware");

Router.post("/register", authControllers.registerController);
Router.post("/login", authControllers.loginController);
Router.post("/logout", authControllers.logoutController);
Router.get("/me", authMiddleware.authUser, (req, res) => {
  res.status(200).json({
    user: req.user
  });
});

module.exports = Router;
