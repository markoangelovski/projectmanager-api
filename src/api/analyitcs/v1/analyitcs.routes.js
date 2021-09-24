const router = require("express").Router();

// Middlewares
const { hasBody } = require("../../../middlewares/users/checkUser.js");

// Controllers
const { track, getLogs } = require("./analyitcs.controller.js");

// @route   POST /track
// @desc    Main analytics route for tracking api and widget behavior
router.post("/", hasBody, track);

// @route   POST /track
// @desc    Main analytics route for tracking api and widget behavior
router.get("/", getLogs);

module.exports = router;
