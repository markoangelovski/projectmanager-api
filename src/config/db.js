const mongoose = require("mongoose");

const dbURL =
  process.env.NODE_ENV === "test" ? process.env.TEST_DB : process.env.DB;

async function connectDB() {
  try {
    await mongoose.connect(
      dbURL,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
        useFindAndModify: false
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
