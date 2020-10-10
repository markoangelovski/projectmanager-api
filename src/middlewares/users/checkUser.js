const jwt = require("jsonwebtoken");

function checkUser(req, res, next) {
  try {
    const authCookie = req.cookies.auth;

    if (authCookie) {
      const token = authCookie.split(" ")[1];
      const verified = jwt.verify(token, process.env.JWT);

      if (verified) {
        req.user = verified;
        next();
      } else {
        next();
      }
    } else {
      next();
    }
  } catch (error) {
    // If token is expired, logout user
    res.clearCookie("auth", {
      httpOnly: true,
      sameSite: process.env.NODE_ENV === "development" ? "Lax" : "None",
      secure: process.env.NODE_ENV === "development" ? false : true
    });
    console.warn(error);
    next(error);
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

function isAdmin(req, res, next) {
  const admin = req.user.role === "admin";
  if (admin) {
    next();
  } else {
    const error = new Error(
      "Oops! You need to have admin privileges for that! Naughty!"
    );
    res.status(401);
    next(error);
  }
}

function hasBody(req, res, next) {
  hasBody = JSON.stringify(req.body) !== "{}";
  if (hasBody) {
    next();
  } else {
    const error = new Error(
      "Oops! You're up to no good, aren't ya? Missing something?"
    );
    res.status(422);
    next(error);
  }
}

module.exports = { checkUser, isLoggedIn, isAdmin, hasBody };
