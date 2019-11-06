const jwt = require("jsonwebtoken");

function checkUser(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    if (token) {
      const verified = jwt.verify(token, process.env.JWT);
      req.user = verified;
      next();
    } else {
      next();
    }
  } else {
    next();
  }
}

function isLoggedIn(req, res, next) {
  if (req.user) {
    next();
  } else {
    const error = new Error("Un-authorized");
    res.status(401);
    next(error);
  }
}

module.exports = { checkUser, isLoggedIn };
