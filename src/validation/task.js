const Joi = require("@hapi/joi");

// Validate create new Task request body
const taskSchema = Joi.object({
  title: Joi.string().max(150).required(),
  description: Joi.string().empty("").max(350),
  done: Joi.string().empty("").max(5),
  pl: Joi.string().empty("").max(350),
  kanboard: Joi.string().empty("").max(350).uri(),
  nas: Joi.string().empty("").max(350),
  column: Joi.string()
    .empty("")
    .valid("Upcoming", "In Progress", "Completed")
    .default("Upcoming"),
  project: Joi.string().pattern(new RegExp(/^[a-f\d]{24}$/i)),
  dueDate: Joi.string().empty("").max(50)
});

// Validate provided details for task update
const taskUpdateSchema = Joi.array()
  .items(
    Joi.object({
      propName: Joi.string().valid(
        "title",
        "description",
        "done",
        "pl",
        "kanboard",
        "nas",
        "column",
        "project",
        "dueDate"
      ),
      propValue: Joi.string().empty("").max(350)
    })
  )
  .single();

module.exports = {
  taskSchema,
  taskUpdateSchema
};
