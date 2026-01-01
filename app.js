require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/connectDB");

const app = express();
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(process.env.PORT || 3000, () => {
      console.log(
        `HTTP server is running on http://localhost:${process.env.PORT || 3000}`
      );
    });
  } catch (error) {
    console.log(error);
  }
};

startServer();
