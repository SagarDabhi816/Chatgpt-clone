const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const userModel = require("../model/user.model");
const aiService = require("../services/ai.service");
const messageModel = require("../model/message.model");
const { createMemory, queryMemory } = require("../services/vector.service");

const cookie = require("cookie");
const { QueryVectorFromJSON } = require("@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_data");

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

      // Storing user inputs in db
     const message = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: messagePayload.content,
        role: "user"
      });

      const vectors = await aiService.generateVector(messagePayload.content)

      await createMemory({
        vectors,
        messageId: message._id,
        metadata:{
          chat:messagePayload.chat,
          user:socket.user._id,
          text:messagePayload.content

        }
      })

      const memory = await queryMemory({
          queryVector:vectors,
          limit:1,
          metadata:{}
      })

      console.log("Memory is = ",memory)

      // Fetching Past chats
      const chatHistory = (await messageModel .find({
            chat: messagePayload.chat,
          }).sort({ createdAt: -1 }).limit(20).lean()).reverse();

      

      // Sending inputs without chathistoryy
      // const response = await aiService.generateResponse(messagePayload.content);

      // Sending inputs with chathistoryy
      const response = await aiService.generateResponse(
        chatHistory.map( item => {
          return {
            role: item.role,
            parts: [{ text: item.content }],
          }
        }),
      );

      // Storing model response
     const responseMessage =  await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      const responseVectors = await aiService.generateVector(response)
      await createMemory({
        vectors:responseVectors,
        messageId:responseMessage._id,
        metadata:{
          chat:messagePayload.chat,
          user:socket.user._id,
          text:response
        }
      })

      socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });
    });
  });
}

module.exports = initSocketServer;
