const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const jwt = require("jsonwebtoken");

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    userImage: { type: String },
    username: {
      type: String,
      required: true,
      unique: true,
      match: [/^[a-zA-Z0-9_]{3,30}$/, "Please provide a valid username"],
    },
  },
  {
    timestamps: true,
  }
);

userSchema.methods.createAccessToken = function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
      name: this.first_name + this.last_name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
};

userSchema.methods.createRefreshToken = function () {
  return jwt.sign(
    {
      id: this._id,
      username: this.username,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

const User = mongoose.model("User", userSchema);
module.exports = User;
