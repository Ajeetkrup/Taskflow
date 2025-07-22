const Joi = require('joi');

const validateNotificationPreferences = (req, res, next) => {
  const schema = Joi.object({
    emailEnabled: Joi.boolean(),
    dueDateReminder: Joi.boolean(),
    reminderMinutes: Joi.number().min(5).max(1440), // 5 minutes to 24 hours
    dailySummary: Joi.boolean()
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  next();
};

const validateNotificationCreate = (req, res, next) => {
  const schema = Joi.object({
    userId: Joi.number().integer().required(),  
    taskId: Joi.number().integer().positive(),
    type: Joi.string().valid('due_date', 'reminder', 'task_update', 'daily_summary').required(),
    title: Joi.string().max(255).required(),
    message: Joi.string().max(1000),
    scheduledFor: Joi.date().min('now')
  });

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }
  
  next();
};

module.exports = {
  validateNotificationPreferences,
  validateNotificationCreate
};