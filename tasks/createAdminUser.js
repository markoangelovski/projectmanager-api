const bcrypt = require("bcryptjs");
const { connectDB, closeDB } = require("../config/db");

// DB connection
connectDB();

// Model imports
const User = require("../models/user");

const setAdminUser = async () => {
  try {
    const user = await User.findOne({ role: "admin" });
    if (!user) {
      const admin = new User({
        email: "marko@angelovski.ga",
        role: "admin",
        password: await bcrypt.hash(process.env.DEFAULT_ADMIN_PASSWORD, 12)
      });
      const savedAdmin = await admin.save();
      closeDB();
      if (savedAdmin) {
        console.log("Admin successfully set!");
        closeDB();
      } else {
        console.log("An error ocurred. Please try again later.");
        closeDB();
      }
    } else {
      console.log("Admin already exists!");
      closeDB();
    }
  } catch (error) {
    console.error(error);
    closeDB();
  }
};

setAdminUser();
