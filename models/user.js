const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  avatar_url: {
    type: String,
    required: true,
    match: [
      /^(((https?|ftp):\/\/)?([\w\-\.])+(\.)([\w]){2,4}([\w\/+=%&_\.~?\-]*))*$/,
      "Please enter a valid URL."
    ]
  },
  role: { type: String, default: "user" }
});

module.exports = mongoose.model("User", userSchema);
