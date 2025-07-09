const Joi = require('joi');

/**
 * Usage: validation(schema)
 * schema: Joi validation schema
 */
module.exports = (schema) => {
  return (req, res, next) => {
    const options = { abortEarly: false, allowUnknown: true, stripUnknown: true };
    const { error, value } = schema.validate(req.body, options);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(d => d.message)
      });
    }
    req.body = value;
    next();
  };
};