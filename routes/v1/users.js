const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

// Middleware imports
const { isLoggedIn } = require("../../middleware/checkUser");

// Model imports
const User = require("../../models/user");

// Vlidation imports
const validateUser = require("../../validation/user");

// @route /auth
// @desc Auth root
router.post("/", isLoggedIn, async (req, res) => {
  res.json({
    message: "User authenticated.",
    user: req.user
  });
});

// @route /auth
// @desc Get all users
router.get("/", async (req, res) => {
  const users = await User.find();
  res.json({
    message: "Success!",
    users
  });
});

// @route /auth/register
// @desc register route
router.post("/register", async (req, res, next) => {
  // Validate user input
  const result = validateUser.validate(req.body);

  if (!result.error) {
    // Check if user already exists in DB
    const existingUser = await User.findOne({ username: req.body.username });
    if (!existingUser) {
      try {
        // Hash password
        const hash = await bcrypt.hash(req.body.password.trim(), 12);
        const user = new User({
          username: req.body.username,
          password: hash
        });
        // Save user to db
        const savedUser = await user.save();

        if (savedUser) {
          res.status(201).json({
            message: "User account successfully created!",
            user: savedUser.username
          });
        } else {
          const error = new Error("An error ocurred with the database!");
          next(error);
        }
      } catch (error) {
        next(error);
      }
    } else {
      const error = new Error("Username already exists!");
      res.status(409);
      next(error);
    }
  } else {
    res.status(422);
    next(result.error);
  }
});

// @route /auth/login
// @desc Login route
router.post("/login", async (req, res, next) => {
  // validate user input
  const result = validateUser.validate(req.body);
  if (!result.error) {
    try {
      // check if user exists
      const user = await User.findOne({ username: req.body.username });
      if (user) {
        // Cofirm password
        const hashConfirmed = await bcrypt.compare(
          req.body.password,
          user.password
        );
        // If password is confirmed, create token
        if (hashConfirmed) {
          const payload = {
            _id: user._id,
            username: user.username,
            role: user.role
          };
          const token = jwt.sign(payload, process.env.JWT, { expiresIn: "1d" });

          res.send(token);
        } else {
          const error = new Error("Unable to login");
          res.status(409);
          next(error);
        }
      } else {
        const error = new Error("User not found!");
        res.status(422);
        next(error);
      }
    } catch (error) {
      next(error);
    }
  } else {
    const error = new Error("Unable to login");
    res.status(422);
    next(error);
  }
});

module.exports = router;
