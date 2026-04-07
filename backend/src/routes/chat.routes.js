const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const chatController = require("../controller/chat.controller")

const Router = express.Router();
Router.post("/", authMiddleware.authUser,chatController.createChat);

module.exports = Router;
