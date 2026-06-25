const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const chatController = require("../controller/chat.controller")

const Router = express.Router();

/* POST /api/chat/ */
Router.post("/", authMiddleware.authUser,chatController.createChat);

/* GET /api/chat/ */
Router.get("/", authMiddleware.authUser,chatController.getChats);

/* GET /api/chat/messages/:id */
Router.get('/messages/:id', authMiddleware.authUser, chatController.getMessages)
Router.get("/me", authMiddleware.authUser, (req, res) => {
  res.status(200).json({
    user: req.user
  });
});

module.exports = Router;
 