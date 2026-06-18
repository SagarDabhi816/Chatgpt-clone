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
            origin: "https://chatgpt-clone-6ihx.onrender.com",
            allowedHeaders: [ "Content-Type", "Authorization" , ],
            credentials: true
        }
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
      
      // Storing User Inputs In Local Database
      // const message = await messageModel.create({
      //   chat: messagePayload.chat,
      //   user: socket.user._id,
      //   content: messagePayload.content,
      //   role: "user",
      // });

      // const vectors = await aiService.generateVector(messagePayload.content);

      // Runs code Simultaneously
      // Storing User Inputs To Vector Database

      const [message, vectors] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
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
            chat: messagePayload.chat,
            user: socket.user._id,
            text: messagePayload.content,
          },
        })

      /*
      const memory = await queryMemory({
        queryVector: vectors,
        limit: 3,
        metadata: {},
      });

      // Fetching Past chats
      const chatHistory = (
        await messageModel
          .find({
            chat: messagePayload.chat,
          })
          .sort({ createdAt: -1 })
          .limit(20)
          .lean()
      ).reverse();
*/

      const [memory, chatHistory] = await Promise.all([
        queryMemory({
          queryVector: vectors,
          limit: 3,
          metadata: {
            user:socket.user._id},
        }),
        messageModel
          .find({
            chat: messagePayload.chat,
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

      // Sending inputs without chathistoryy
      // const response = await aiService.generateResponse(messagePayload.content);

      // Sending inputs with chathistoryy
      const response = await aiService.generateResponse([
        ...longTermMemory,
        ...shortTermMemory,
      ]);


       socket.emit("ai-response", {
        content: response,
        chat: messagePayload.chat,
      });
      /*
      // Storing Model Response In Local Database
      const responseMessage = await messageModel.create({
        chat: messagePayload.chat,
        user: socket.user._id,
        content: response,
        role: "model",
      });

      const responseVectors = await aiService.generateVector(response);*/

      const [responseMessage, responseVectors] = await Promise.all([
        messageModel.create({
          chat: messagePayload.chat,
          user: socket.user._id,
          content: response,
          role: "model",
        }),
        aiService.generateVector(response),
      ]);

      // Storing Agent Response To Vector Database
      await createMemory({
        vectors: responseVectors,
        messageId: responseMessage._id,
        metadata: {
          chat: messagePayload.chat,
          user: socket.user._id,
          text: response,
        },
      });

     
    });
  });
}

module.exports = initSocketServer;
