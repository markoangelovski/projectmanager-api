// Model imports
const { UserSettings, createHash } = require("../api/users/v1/users.model");

const nextError = (res, next) => {
  const error = new Error("Un-authorized");
  res.status(401);
  next(error);
};

const checkUserSettings = (userSettings, req, res, next) => {
  let approved = false;
  // Check if user has access to requested Service route
  userSettings.service_keys.forEach(service_key => {
    service_key.added_services.forEach(service => {
      const regEx = new RegExp(service);

      if (
        regEx.test(req.baseUrl) &&
        userSettings.services.indexOf(service) > -1
      )
        approved = true;
    });
  });

  approved ? next() : nextError(res, next);
};

const handleUserSettings = (userSettings, req, res, next) => {
  if (userSettings) {
    req.userSettings = userSettings;
    checkUserSettings(userSettings, req, res, next);
  } else {
    nextError(res, next);
  }
};

const checkApiKey = async (req, res, next) => {
  try {
    // Check if user is logged in
    if (req.user) {
      const userSettings = await UserSettings.findOne({
        user: req.user._id
      });

      handleUserSettings(userSettings, req, res, next);
    } else {
      // Hash the key and find the settings
      const apiKey = req.get("X-Service-Key");
      const key = apiKey && createHash(apiKey);
      const userSettings =
        key &&
        (await UserSettings.findOne({
          "service_keys.key": key
        }));

      handleUserSettings(userSettings, req, res, next);
    }
  } catch (error) {
    console.warn(error);
    next(error);
  }
};

const isApiAdmin = (req, res, next) => {
  // Check if API user has Admin privileges
  const role =
    (req.user && req.user.role) || (req.userSettings && req.userSettings.role);
  if (role === "admin") {
    next();
  } else {
    const error = new Error("Forbidden");
    res.status(403);
    next(error);
  }
};

module.exports = { checkApiKey, isApiAdmin };
