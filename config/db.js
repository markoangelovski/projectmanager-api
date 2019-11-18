const mongoose = require("mongoose");

async function connectDB() {
  try {
    await mongoose.connect(
      process.env.DB,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true
      },
      () => console.log("MongoDB Connected!")
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

async function closeDB() {
  try {
    await mongoose.connection.close(() =>
      console.log("MongoDB connection closed!")
    );
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

module.exports = { connectDB, closeDB };
