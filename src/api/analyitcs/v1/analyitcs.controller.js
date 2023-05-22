// Model imports
const { responseTime } = require("../../../middlewares/users/checkUser.js");
const Analytics = require("./analyitcs.model.js");

// @route   POST /track
// @desc    Main analytics route for tracking api and widget behavior
exports.track = (req, res, next) => {
  res.send("1");

  res.on("finish", function () {
    console.log("res.responseTime", res.responseTime);
    // Analytics({
    //   agaId: req.cookies.agaId,
    //   data: {
    //     "user-agent": req.get("user-agent"),
    //     host: req.get("host"),
    //     "content-length": req.get("content-length"),
    //     statusCode: res.statusCode,
    //     statusMessage: res.statusMessage,
    //     responseTime: res.responseTime,
    //     url: req.url,
    //     method: req.method,
    //     baseUrl: req.baseUrl,
    //     originalUrl: req.originalUrl
    //   }
    // }).save();
  });
};

// @route   GET /track
// @desc    Main analytics route for fetching logs
exports.getLogs = (req, res, next) => {
  // Analytics.find().then(logs => res.json(logs));
};
