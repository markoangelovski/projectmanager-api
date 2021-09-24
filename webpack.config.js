const path = require("path");

module.exports = {
  mode: process.env.NODE_ENV,
  entry: "./src/widget/index.js",
  output: {
    path: path.resolve(__dirname, "src/widget/build"),
    filename: "aga.js"
  },
  devServer: {
    port: 8080,
    contentBase: path.resolve(__dirname, "src/widget")
  }
};
