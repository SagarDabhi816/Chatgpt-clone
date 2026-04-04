const express = require("express");
const authControllers = require("../controller/auth.controller")

const Router = express.Router();

Router.post("/register",authControllers.registerController);
Router.post("/login",authControllers.loginController );



module.exports = Router;
