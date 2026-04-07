const { Server } = require("socket.io");

function initSocketServer(httpServer) {
  const io = new Server(httpServer, {});

  io.on("connection", (socket) => {
    console.log("Socket is connected");
  });
}

module.exports = initSocketServer;
