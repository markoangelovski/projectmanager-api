const Joi = require("@hapi/joi");

// Validate Register and Login User
const projectSchema = Joi.object({
  title: Joi.string().max(150),
  description: Joi.string().empty("").max(350),
  done: Joi.string().empty("").max(5),
  pl: Joi.string().empty("").max(350),
  kanboard: Joi.string().empty("").max(350).uri(),
  dev: Joi.string().empty("").max(350).uri(),
  stage: Joi.string().empty("").max(350).uri(),
  prod: Joi.string().empty("").max(350).uri(),
  live: Joi.string().empty("").max(350).uri(),
  nas: Joi.string().empty("").max(350)
});

module.exports = {
  projectSchema
};
