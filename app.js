require("dotenv").config();
const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const connectDB = require("./config/connect");

const app = express();

app.use(express.json());

const server = http.createServer(app);

const io = socketIo(server, { cors: { origin: "*" } });

const start = async () => {
  try {
    console.log(process.env.MONGO_URI)
    await connectDB(process.env.MONGO_URI);
    server.listen(process.env.PORT || 3000, () =>
      console.log(
        `HTTP server is running on http://localhost:${
          process.env.PORT || 3000
        } `
      )
    );
  } catch (error) {
    console.log(error);
  }
};

start();
