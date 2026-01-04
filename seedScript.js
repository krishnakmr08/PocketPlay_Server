require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./src/config/connectDB");
const Play = require("./src/models/Play");
const {contentData}= require("./seedData");

async function seedDB() {
  try {
    await connectDB(process.env.MONGO_URI);

    await Play.deleteMany({});

    console.log("Cleared Video collection 🗑️");

    await Play.insertMany(contentData);

    console.log("Video data seeded successfully! ✅");

    mongoose.connection.close();
    
    console.log("Database connection closed. 🚀");
  } catch (error) {
    console.error("Error seeding database:❌", error);
  }
}

seedDB();
