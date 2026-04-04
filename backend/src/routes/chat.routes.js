const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const Router = express.Router();



Router.post("/",authMiddleware.authUser)

module.exports = Router;
