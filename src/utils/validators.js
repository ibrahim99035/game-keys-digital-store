const Joi = require('joi');

// Example: User registration validation
exports.registerSchema = Joi.object({
  email: Joi.string().email().required(),
  phone: Joi.string().required(),
  password: Joi.string().min(6).required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required()
});

// Example: Product creation validation
exports.productSchema = Joi.object({
  name: Joi.string().required(),
  description: Joi.string().allow(''),
  price: Joi.number().positive().required(),
  category: Joi.string().required(),
  digitalAsset: Joi.string().required()
});

// Add more schemas as needed