const axios = require("axios");

async function avatar() {
  // Create avatar
  const avatar = await axios.get("https://source.unsplash.com/150x150?face");
  return avatar.request.res.responseUrl;
}

module.exports = avatar;
