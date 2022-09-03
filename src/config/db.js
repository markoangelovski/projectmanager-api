const mongoose = require("mongoose");

const dbURL =
  process.env.NODE_ENV === "test" ? process.env.TEST_DB : process.env.DB_URI;

//   let dbURL;

// dbURL = process.env.NODE_ENV === "test" ? process.env.TEST_DB : process.env.DB_URI;
// dbURL =
//   process.env.NODE_ENV === "development" ? process.env.DEV_DB : process.env.DB_URI;

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
      () =>
        console.log(
          "MongoDB connected to: ",
          mongoose.connections[0].host.split(".")[0]
        )
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
