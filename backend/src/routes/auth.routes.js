const express = require("express");
const authControllers = require("../controller/auth.controller")
// const {authMiddleware} = require("../middleware/auth.middleware")

const Router = express.Router();

Router.get("/test",authControllers.testController);
Router.post("/register",authControllers.registerController);
Router.post("/login",authControllers.loginController );



module.exports = Router;
