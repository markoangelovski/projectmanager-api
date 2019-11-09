const Joi = require("@hapi/joi");

const userSchema = Joi.object({
  email: Joi.string()
    .email()
    .required(),

  password: Joi.string()
    .min(6)
    .required()
});

module.exports = userSchema;
