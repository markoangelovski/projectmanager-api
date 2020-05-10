const Joi = require("@hapi/joi");

// Validate Register and Login User
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

// Validate Update User
const userUpdate = Joi.object({
  service: Joi.string()
    .lowercase()
    .trim()
    .pattern(new RegExp("^(add|remove):(locale|scan|report)$")),
  user: Joi.string().email()
});

// Validate provided services for key generation
const servicesValidation = Joi.array()
  .items(Joi.string().valid("locale", "scan", "report"))
  .single();

module.exports = {
  userSchema,
  userUpdate,
  servicesValidation
};
