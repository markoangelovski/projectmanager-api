const crypto = require("crypto");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: { type: String, required: true },
  password: { type: String, required: true },
  avatar_url: {
    type: String,
    required: true,
    match: [
      /^(((https?|ftp):\/\/)?([\w\-\.])+(\.)([\w]){2,4}([\w\/+=%&_\.~?\-]*))*$/,
      "Please enter a valid URL."
    ]
  },
  role: {
    type: String,
    enum: ["admin", "user"],
    default: "user"
  }
});

const userSettingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ["admin", "user"]
  },
  services: {
    type: [String],
    enum: ["locale", "scan", "report"]
  },
  service_keys: [
    {
      added_services: {
        type: [String],
        enum: ["locale", "scan", "report"]
      },
      key: String
    }
  ]
});

// Create Hash function
const createHash = key => {
  key = typeof key === "string" ? key : JSON.stringify(key);
  return crypto.createHash("sha256").update(key).digest("hex");
};

// Check if the key for requested services already exists
const checkDuplicates = (user, service_keys, services) => {
  let apiKey = "";
  let added_services = [];
  service_keys.forEach(service_key => {
    if (service_key.added_services.length === services.length) {
      const arr1 = service_key.added_services.sort().toString();
      const arr2 = services.sort().toString();

      if (arr1 === arr2) {
        apiKey = createHash({
          _id: user,
          services: service_key.added_services
        });
        added_services = [...service_key.added_services];
      }
    }
  });
  return { apiKey, added_services };
};

// Generate API keys for accessing services
userSettingsSchema.methods.createApiKey = function (services) {
  services.sort();
  // Check if all of the keys have been created
  if (this.service_keys.length >= 3)
    throw new Error("Maximum number of service keys exceeded.");

  // Check for available allowed services
  const allowedServices = services.filter(service => {
    if (this.services.indexOf(service) > -1) return service;
  });

  if (allowedServices.length > 0) {
    // Check if the requested services already have their key
    let { apiKey, added_services } = checkDuplicates(
      this.user,
      this.service_keys,
      allowedServices
    );
    if (apiKey.length > 0) return { apiKey, added_services };

    // Generate payload
    const payload = {
      _id: this.user,
      services: allowedServices
    };

    // Generate key
    apiKey = createHash(payload);

    // Hash key and store in service_keys array
    const key = createHash(apiKey);

    this.service_keys.push({
      added_services: allowedServices,
      key
    });

    return { apiKey, added_services: allowedServices };
  } else {
    throw new Error("Requested service is not allowed.");
  }
};

// Remove any fully unauthorized keys
userSettingsSchema.pre("save", async function (next) {
  this.services = this.services.sort();

  const approved = {};

  // Remove any keys existing for a service that has been removed
  this.service_keys.forEach(service_key => {
    service_key.added_services.forEach(service => {
      // Select added services that are existing in approved services
      if (this.services.indexOf(service) > -1)
        // Add approved services to an empty object with the same keys in order to remove duplicates
        approved[service_key.added_services.join()] = service_key;
    });
  });
  this.service_keys = Object.values(approved);
  next();
});

const User = mongoose.model("User", userSchema);
const UserSettings = mongoose.model("UserSettings", userSettingsSchema);

module.exports = { User, UserSettings, createHash };
