const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateUniqueUsername = async (name) => {
  let username;
  let isUnique = false;

  while (!isUnique) {
    username =
      name.replace(/\s/g, "").toLowerCase().substring(0, 6) +
      Math.random().toString(36).substr(2, 6);

    const existingUser = await User.findOne({ username });
    if (!existingUser) {
      isUnique = true;
    }
  }

  return username;
};
