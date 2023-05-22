exports.checkSource = (req, res, next) => {
  const isPostmanToken = req.get("postman-token");

  if (req.cookies.agaId) {
    next();
  } // Check if the request is coming from Postman and set the agaId
  else if (isPostmanToken) {
    res.cookie("agaId", isPostmanToken, {
      sameSite: process.env.NODE_ENV === "development" ? "Lax" : "None",
      secure: process.env.NODE_ENV === "development" ? false : true,
      expires: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
    });
    next();
  } else {
    next();
  }
};
