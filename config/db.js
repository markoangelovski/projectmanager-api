const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(process.env.DB, { useNewUrlParser: true }, () =>
      console.log("MongoDB Connected!")
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

module.exports = connectDB;
