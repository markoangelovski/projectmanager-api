// Model imports
const { UserSettings, createHash } = require("../../api/users/v1/users.model");

const nextError = (res, next) => {
  const error = new Error("Un-authorized");
  res.status(401);
  next(error);
};

const checkUserSettings = ({ key, req, res, next }) => {
  let approved = false;
  if (key) {
    // Check if provided key matches requested route
    const doesKeyMatch = req.userSettings.service_keys.find(
      service_key => service_key.key === key
    );
    doesKeyMatch.added_services.forEach(service => {
      const regEx = new RegExp(service);

      if (
        regEx.test(req.baseUrl) &&
        req.userSettings.services.indexOf(service) > -1
      )
        approved = true;
    });
  } else {
    // If key is not provided, check if user is authorized for the requested route
    req.userSettings.service_keys.forEach(service_key => {
      service_key.added_services.forEach(service => {
        const regEx = new RegExp(service);

        if (
          regEx.test(req.baseUrl) &&
          req.userSettings.services.indexOf(service) > -1
        )
          approved = true;
      });
    });
  }

  approved ? next() : nextError(res, next);
};

const checkApiKey = async (req, res, next) => {
  try {
    // Check if user is logged in
    if (req.user) {
      const userSettings = await UserSettings.findOne({
        user: req.user._id
      });
      if (!userSettings) {
        // For logged in user that does not have any services added
        nextError(res, next);
      } else {
        req.userSettings = userSettings;
        checkUserSettings({ req, res, next });
      }
    } else {
      // Check if the key exists, hash the key and find the settings
      const apiKey = req.get("X-Service-Key");
      if (!apiKey) {
        nextError(res, next);
      } else {
        const key = apiKey && createHash(apiKey);
        const userSettings =
          key &&
          (await UserSettings.findOne({
            "service_keys.key": key
          }));
        req.userSettings = userSettings;
        checkUserSettings({ key, req, res, next });
      }
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
