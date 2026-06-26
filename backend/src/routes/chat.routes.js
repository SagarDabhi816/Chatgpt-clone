const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const chatController = require("../controller/chat.controller")

const Router = express.Router();

/* POST /api/chat/ */
Router.post("/", authMiddleware.authUser,chatController.createChat);

/* GET /api/chat/ */
Router.get("/", authMiddleware.authUser,chatController.getChats);
Router.delete('/:id', authMiddleware.authUser, chatController.deletChat)

/* GET /api/chat/messages/:id */
Router.get('/messages/:id', authMiddleware.authUser, chatController.getMessages)



module.exports = Router;
 