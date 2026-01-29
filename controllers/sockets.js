const User = require("../models/User");
const Play = require("../models/Play");
const jwt = require("jsonwebtoken");

const socketService = (io) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("No token provided"));

      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      const user = await User.findById(payload.id);

      if (!user) return next(new Error("User not found"));

      socket.user = {
        id: user._id.toString(),
        name: user.full_name,
      };

      next();
    } catch (err) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.user.id);

    socket.on("join-stream", ({ playId }) => {
      if (!playId || playId.length !== 24) return;
      socket.join(playId);
    });

    socket.on("leave-stream", ({ playId }) => {
      socket.leave(playId);
    });

    socket.on("get-play-info", async ({ playId }) => {
      try {
        const play = await Play.findById(playId).populate("comments.user");
        if (!play)
          return socket.emit("error-message", { message: "Play not found" });

        socket.emit("stream-play-info", {
          _id: play.id,
          likes: play.likes,
          rating: play.rating,
          starred: play.starred,
          comments: play.comments,
          is_liked: play.liked_by.some(
            (id) => id.toString() === socket.user.id,
          ),
          is_starred: play.starred_by.some(
            (id) => id.toString() === socket.user.id,
          ),
        });
      } catch (err) {
        socket.emit("error-message", { message: "Failed to fetch play info" });
      }
    });

    socket.on("like-play", async ({ playId }) => {
      try {
        const play = await Play.findById(playId);
        if (!play)
          return socket.emit("error-message", { message: "Play not found" });

        const alreadyLiked = play.liked_by.some(
          (id) => id.toString() === socket.user.id,
        );

        if (!alreadyLiked) {
          play.likes += 1;
          play.liked_by.push(socket.user.id);
          await play.save();

          io.to(playId).emit("stream-likes", { likes: play.likes });
        }
      } catch (err) {
        socket.emit("error-message", { message: "Like failed" });
      }
    });

    socket.on("new-comment", async ({ playId, comment }) => {
      try {
        const cleanComment = comment?.trim();

        if (!cleanComment || cleanComment.length > 200)
          return socket.emit("error-message", { message: "Invalid comment" });

        const play = await Play.findById(playId);
        if (!play)
          return socket.emit("error-message", { message: "Play not found" });

        play.comments.push({
          user: socket.user.id,
          comment: cleanComment,
        });

        await play.save();
        await play.populate("comments.user");

        io.to(playId).emit("stream-comments", play.comments);
      } catch (err) {
        socket.emit("error-message", { message: "Comment failed" });
      }
    });

    socket.on("send-reaction", ({ playId, reaction }) => {
      if (!reaction || !socket.rooms.has(playId)) return;

      io.to(playId).emit("stream-reactions", {
        emoji: reaction,
        userId: socket.user.id,
        timestamp: Date.now(),
      });
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.user.id);
    });
  });
};

module.exports = socketService;
