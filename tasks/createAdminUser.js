const bcrypt = require("bcryptjs");
const connectDB = require("../config/db");

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
      if (savedAdmin) {
        console.log("Admin successfully set!");
      } else {
        console.log("An error ocurred. Please try again later.");
      }
    } else {
      console.log("Admin already exists!");
    }
  } catch (error) {
    console.error(error);
  }
};

setAdminUser();
