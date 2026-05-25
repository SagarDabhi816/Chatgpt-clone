const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const userModel = require("../model/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../model/message.model");

const cookie = require("cookie");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.use(async (socket, next) => {
    const cookies = cookie.parse(socket.handshake.headers?.cookie || "");

    if (!cookies.token) {
      next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(cookies.token, process.env.JWT_SECRET);

      const user = await userModel.findById(decoded.id);

      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    socket.on("ai-message", async (messagePayload) => {
      console.log(messagePayload);

      // Storing user inputs in db
      await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: messagePayload.content,
        role: "user",
      });

      // Fetching Past chats
      const chatHistory = await messageModel.find({
        chat: messagePayload.chat,
      });

      console.log("ChatHistory", chatHistory);

      // Sending inputs without chathistoryy
      // const response = await aiService.generateResponse(messagePayload.content);

      // Sending inputs with chathistoryy
      const response = await aiService.generateResponse(chatHistory.map((item)=>{
          return {
            role:item.role,
            parts:[{text:item.content}]
          }
      }));

      // Storing model response
      await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });
    });
  });
}

module.exports = initSocketServer;
