const Joi = require("@hapi/joi");

const userSchema = Joi.object({
  username: Joi.string()
    .alphanum()
    .min(3)
    .max(30)
    .required(),

  password: Joi.string()
    .min(6)
    .required()
});

module.exports = userSchema;
