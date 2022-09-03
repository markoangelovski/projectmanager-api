const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Models
const { User, UserSettings, createHash } = require("./users.model");

// Validation
const {
  userSchema,
  userUpdate,
  servicesValidation
} = require("../../../validation/user");

// Helper functions
const getAvatar = require("../../../lib/Helpers/getAvatar");

// @route POST /auth
// @desc Check if user it authenticated
exports.checkAuth = async (req, res) => {
  res.json({
    message: "User authenticated.",
    user: req.user
  });
};

// @route GET /auth
// @desc Get all users
exports.getAllUsers = async (req, res) => {
  const users = await User.find();
  const userList = users.map(user => {
    return {
      email: user.email,
      avatar_url: user.avatar_url
    };
  });
  res.json({
    message: "Success!",
    users: userList
  });
};

// @route POST /auth/register
// @desc register route
exports.register = async (req, res, next) => {
  // Validate user input
  const result = userSchema.validate(req.body);

  if (!result.error) {
    // Check if user already exists in DB
    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      try {
        // Hash password
        const hash = await bcrypt.hash(req.body.password.trim(), 12);
        const user = new User({
          email: req.body.email,
          password: hash,
          avatar_url: await getAvatar()
        });
        // Save user to db
        const savedUser = await user.save();

        if (savedUser) {
          res.status(201).json({
            message: "User account successfully created!",
            user: savedUser
          });
        } else {
          const error = new Error("An error ocurred with the database!");
          next(error);
        }
      } catch (error) {
        console.warn(error);
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
};

// @route POST /auth/login
// @desc Login route
exports.login = async (req, res, next) => {
  // validate user input
  const result = userSchema.validate(req.body);

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
            avatar_url: findUser.avatar_url,
            role: findUser.role
          };
          const token = jwt.sign(user, process.env.JWT_KEY, {
            expiresIn: "1d"
          });
          res.cookie("auth", `Bearer ${token}`, {
            httpOnly: true,
            sameSite: process.env.NODE_ENV === "development" ? "Lax" : "None",
            secure: process.env.NODE_ENV === "development" ? false : true
          });
          res.json({
            message: "Login successful!",
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
      console.warn(error);
      next(error);
    }
  } else {
    const error = new Error("Unable to login");
    res.status(422);
    next(error);
  }
};

// @route GET /auth/logout
// @desc Logout route
exports.logout = async (req, res, next) => {
  res.clearCookie("auth", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "development" ? "Lax" : "None",
    secure: process.env.NODE_ENV === "development" ? false : true
  });
  res.json({
    message: "Logout successful!"
  });
};

// @route PATCH /auth/update?service=(add|remove):(locale|report|scan)&user=otherUserEmail
// @desc Update user settings
exports.updateService = async (req, res, next) => {
  // Check if any action is selected
  if (!req.query.service) return next(new Error("Please select an action."));
  // Check if only one action is selected and sanitize input
  if (req.query.service && typeof req.query.service !== "string")
    return next(new Error("Please select one action at a time."));

  try {
    // Validate query params
    const query = await userUpdate.validateAsync(req.query);

    // Check if another User needs to be updated. If not, update requestor.
    let user, role;
    if (query.user) {
      const newUser = await User.findOne({ email: query.user });
      if (newUser) {
        user = newUser._id;
        role = newUser.role;
      }
    }
    user = user ? user : req.user._id;
    role = role ? role : req.user.role;

    // Fetch settings for selected user
    const userSettings = await UserSettings.findOne({ user });

    const [action, service] = query.service.split(":");

    const handleResponse = async userSettings => {
      // Check if the service is already present
      const index = userSettings.services.indexOf(service);

      if (action === "add" && index === -1) userSettings.services.push(service);
      if (action === "remove" && index > -1)
        userSettings.services.splice(index, 1);

      const savedSettngs = await userSettings.save();

      res.status(201).json({
        message: "Settings successfully stored.",
        available_services: savedSettngs.services
      });
    };

    if (userSettings) {
      handleResponse(userSettings);
    } else {
      // If User Settings are not available, create new settings
      const userSettings = new UserSettings({
        user,
        role
      });
      handleResponse(userSettings);
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
};

// @route POST /auth/api-key?services=scan,report,locale
// @desc Create a new API key for requested service
exports.createApiKey = async (req, res, next) => {
  // Check if services have been sent
  if (!req.query.services) {
    res.status(422);
    return next(new Error("Please select at least one service."));
  }

  try {
    const arr = req.query.services && req.query.services.split(",");
    const services = await servicesValidation.validateAsync(arr);
    const userSettings = await UserSettings.findOne({ user: req.user._id });

    if (userSettings) {
      // Generate new key for selected services
      const { added_services, apiKey } = userSettings.createApiKey(services);

      // Save settings
      userSettings.save();

      res.status(201).json({
        message: "API key created successfully!",
        services: added_services,
        key: apiKey
      });
    } else {
      res.status(404).json({
        error: "ERR_SETTINGS_NOT_FOUND",
        message: "User settings not found."
      });
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
};

// @route GET /auth/api-key
// @desc Get all API keys
exports.getApiKeys = async (req, res, next) => {
  try {
    let keys = [];
    const userSettings = await UserSettings.findOne({ user: req.user._id });

    if (userSettings) {
      keys = userSettings.service_keys.map(service_key => {
        return {
          services: service_key.added_services,
          key: createHash({
            _id: req.user._id,
            services: service_key.added_services
          })
        };
      });
    }

    if (keys.length) {
      res.json({
        message: "Keys successfully fetched!",
        keys,
        services: userSettings.services
      });
    } else {
      res.status(404).json({
        error: "ERR_KEYS_NOT_FOUND",
        message: "No Keys available."
      });
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
};

// @route DELETE /auth/api-key?key=123456
// @desc Delete API keys
exports.deleteApiKeys = async (req, res, next) => {
  if (!req.query.key) return next(new Error("Please select a key."));
  try {
    // Hash the key and find the settings
    const key = createHash(req.query.key);

    const userSettings = await UserSettings.updateOne(
      { "service_keys.key": key },
      { $pull: { service_keys: { key } } }
    );

    if (userSettings.nModified) {
      res.json({
        message: "API Key successfully deleted."
      });
    } else {
      res.status(404).json({
        error: "ERR_KEY_NOT_FOUND",
        message: "Requested Key not found."
      });
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
};
