const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const commentSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  comment: { type: String, required: true, trim: true, maxlength: 200 },
  timestamp: { type: Date, default: Date.now },
});

const playSchema = new Schema(
  {
    title: { type: String, required: true },
    description: String,
    genre: String,

    likes: { type: Number, default: 0 },
    starred: { type: Number, default: 0 },
    rating: { type: Number, min: 0, max: 10 },

    liked_by: [{ type: Schema.Types.ObjectId, ref: "User", index: true }],
    starred_by: [{ type: Schema.Types.ObjectId, ref: "User" }],

    comments: [commentSchema],

    thumbnail_url: { type: String, required: true },
    stream_url: String,
    is_live: { type: Boolean, default: false, index: true },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Play", playSchema);
