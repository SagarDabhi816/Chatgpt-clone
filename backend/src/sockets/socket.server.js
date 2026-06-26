const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const userModel = require("../model/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../model/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

const cookie = require("cookie");
const {
  QueryVectorFromJSON,
} = require("@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_data");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://chatgpt-clone-1-h5yx.onrender.com",
      ],
      allowedHeaders: ["Content-Type", "Authorization"],
      credentials: true,
    },
  });

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
    // Validate chat ID
    const chatId = messagePayload.chat;
    const mongoose = require('mongoose');
    if (!chatId || !mongoose.isValidObjectId(chatId)) {
      socket.emit("error", { message: "Invalid or missing chat ID" });
      return;
    }
      const [message, vectors] = await Promise.all([
        messageModel.create({
          chat: chatId,
          user: socket.user._id,
          content: messagePayload.content,
          role: "user",
        }),
        aiService.generateVector(messagePayload.content),
      ]);

      await createMemory({
        vectors,
        messageId: message._id,
        metadata: {
          chat: chatId,
          user: socket.user._id,
          text: messagePayload.content,
        },
      });

      const [memory, chatHistory] = await Promise.all([
        queryMemory({
          queryVector: vectors,
          limit: 7,
          metadata: {
            user: socket.user._id,
          },
        }),
        messageModel
          .find({
            chat: chatId,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
          .then((messages) => messages.reverse()),
      ]);
      const shortTermMemory = chatHistory.map((item) => {
        return {
          role: item.role,
          parts: [{ text: item.content }],
        };
      });

      const longTermMemory = [
        {
          role: "user",
          parts: [
            {
              text: `These are some previous messages from the chat, use them to generate a response
            
            ${memory.map((item) => item.metadata.text).join("\n")}`,
            },
          ],
        },
      ];

      const response = await aiService.generateResponse([
        ...longTermMemory,
        ...shortTermMemory,
      ]);

      // Send response immediately
      socket.emit("ai-response", {
        content: response,
        chat: chatId,
      });

      // Save in background (don't await)
      (async () => {
        try {
          const [responseMessage, responseVectors] = await Promise.all([
            messageModel.create({
              chat: chatId,
              user: socket.user._id,
              content: response,
              role: "model",
            }),
            aiService.generateVector(response),
          ]);

          await createMemory({
            vectors: responseVectors,
            messageId: responseMessage._id,
            metadata: {
              chat: chatId,
              user: socket.user._id,
              text: response,
            },
          });
        } catch (error) {
          console.error("Background save failed:", error);
        }
      })();
    });
  });
}

module.exports = initSocketServer;
