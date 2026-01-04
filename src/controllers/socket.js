const User = require("../models/User");
const Play = require("../models/Play");
const jwt = require("jsonwebtoken");

const socketService = (io) => {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error("Authentication invalid : No token provided"));
    }

    try {
      const payload = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

      const user = await User.findById(payload.id);

      if (!user) {
        return next(new Error("Authentication invalid: User not found"));
      }

      socket.user = { id: payload.id, full_name: payload.full_name };

      next();
    } catch (error) {
      console.log("Socket Error", error);
      return next(
        new Error("Authentication invalid : Token verification failed")
      );
    }
  });

  io.on("connection", (socket) => {
    socket.on("join-stream", async ({ playId }) => {
      console.log(playId, "User Joined");
      socket.join(playId);
    });

    socket.on("get-play-info", async ({ playId }) => {
      const play = await Play.findById(playId).populate("comments.user");

      if (!play) {
        socket.emit("ERROR", { message: "Play not found" });
        return;
      }

      const isLiked = play.liked_by.includes(socket.user.id);
      const isStarred = play.starred_by.includes(socket.user.id);

      socket.emit("stream-play-info", {
        _id: play.id,
        is_liked: isLiked,
        is_starred: isStarred,
        likes: play.likes,
        rating: play.rating,
        starred: play.starred,
        comments: play.comments,
      });
    });

    socket.on("like-play", async ({ playId }) => {
      const play = await Play.findById(playId);

      if (!play) {
        socket.emit("ERROR", { message: "Play not found" });
        return;
      }

      const alreadyLiked = play.liked_by.includes(socket.user.id);

      if (!alreadyLiked) {
        play.likes += 1;
        play.liked_by.push(socket.user.id);
        await play.save();

        io.to(playId).emit("stream-likes", { likes: play.likes });
      }
    });

    socket.on("new-comment", async ({ playId, comment }) => {
      const play = await Play.findById(playId);

      if (!play) {
        socket.emit("ERROR", { message: "Play not found" });
        return;
      }

      play.comments.push({ user: socket.user.id, comment });
      await play.save();

      const updatedPlay = await Play.findById(playId).populate("comments.user");

      io.to(playId).emit("stream-comments", updatedPlay.comments);
    });

    socket.on("send-reaction", async ({ playId, reaction }) => {
      const play = await Play.findById(playId);

      if (!play) {
        socket.emit("ERROR", { message: "Play not found" });
        return;
      }

      const reactionData = {
        emoji: reaction,
        timestamp: Date.now(),
      };

      io.to(playId).emit("stream-reactions", reactionData);
    });



  });
};

module.exports = socketService;