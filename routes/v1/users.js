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
// @desc Check if user it authenticated
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
  const userList = users.map(user => {
    return {
      email: user.email
    };
  });
  res.json({
    message: "Success!",
    users: userList
  });
});

// @route /auth/register
// @desc register route
router.post("/register", isLoggedIn, async (req, res, next) => {
  // Validate user input
  const result = validateUser.validate(req.body);

  if (!result.error) {
    // Check if user already exists in DB
    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      try {
        // Hash password
        const hash = await bcrypt.hash(req.body.password.trim(), 12);
        const user = new User({
          email: req.body.email,
          password: hash
        });
        // Save user to db
        const savedUser = await user.save();

        if (savedUser) {
          res.status(201).json({
            message: "User account successfully created!",
            user: savedUser.email
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
  console.log("cookie", req.cookie);
  if (!result.error) {
    try {
      // check if user exists
      const findUser = await User.findOne({ email: req.body.email });
      if (findUser) {
        // Cofirm password
        const hashConfirmed = await bcrypt.compare(
          req.body.password,
          findUser.password
        );
        // If password is confirmed, create token
        if (hashConfirmed) {
          const user = {
            _id: findUser._id,
            email: findUser.email,
            role: findUser.role
          };
          const token = jwt.sign(user, process.env.JWT, { expiresIn: "1d" });
          res.cookie("auth", `Bearer ${token}`, {
            httpOnly: true,
            sameSite: "None",
            secure:
              process.env.NODE_ENV === "production" ||
              process.env.NODE_ENV === "staging"
                ? true
                : false
          });
          res.json({
            user
          });
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

// @route /auth/update-profile
// @desc Update profile route
// router.patch("/update-profile", async (req, res, next) => {
//   const result = validateUser.validate(req.body);
//   if (req.user) {
//     try {
//       const user = await User.findOne({ email: req.user.email });

//       const setValues = {};

//       res.status(200).json(user);
//     } catch (error) {
//       next(error);
//     }
//   } else {
//     const error = new Error("User not found!");
//     res.status(422);
//     next(error);
//   }
// });

module.exports = router;
