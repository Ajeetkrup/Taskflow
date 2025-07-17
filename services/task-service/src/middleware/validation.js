const Joi = require('joi');

const taskSchema = Joi.object({
  title: Joi.string().required().min(1).max(255),
  description: Joi.string().allow('').max(1000),
  category: Joi.string().allow('').max(100),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  status: Joi.string().valid('pending', 'in-progress', 'completed').default('pending'),
  due_date: Joi.date().iso().allow(null)
});

const validation = {
  validateTask: (req, res, next) => {
    const { error } = taskSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }
    next();
  }
};

module.exports = validation;
