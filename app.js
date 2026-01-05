require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./src/config/connectDB");
const notFoundMiddleware = require("./src/middleware/not-found");
const errorHandlerMiddleware = require("./src/middleware/error-handler");

//Routers
const authRouter = require("./src/routes/auth");
const playRouter = require("./src/routes/play");

// Import socket service
const socketService = require("./src/controllers/sockets");

const app = express();
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, { cors: { origin: "*" } });

// Attach the WebSocket instance to the request object
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Initialize the WebSocket handling logic
socketService(io);

app.use("/auth", authRouter);
app.use("/play", playRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const startServer = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    server.listen(process.env.PORT || 3000, () =>
      console.log(
        `HTTP server is running on http://localhost:${process.env.PORT || 3000}`
      )
    );
  } catch (error) {
    console.log(error);
  }
};

startServer();
