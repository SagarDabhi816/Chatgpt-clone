require("dotenv").config();
const app = require("./src/app");
const connectToDB = require("./src/db/db");
const initSocketServer = require("./src/sockets/socket.server");
const httpServer = require("http").createServer(app)

const PORT = process.env.PORT;

connectToDB();

initSocketServer(httpServer)

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
