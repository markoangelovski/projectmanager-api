const rateLimit = require("express-rate-limit");

// Limit access to Docs to one request per 10 minutes
module.exports = {
  checkRateLimit: rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 1, // limit each IP to 1 requests per windowMs,
    keyGenerator: function (req /*, res*/) {
      // Switched from default req.ip to req._ip to bypass proxy's ip
      return req._ip;
    },
    message: {
      error: "ERR_RATE_LIMIT_REACHED",
      message: `Rate limit reached, please try again later.`
    }
  })
};
