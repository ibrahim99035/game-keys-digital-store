const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        error: 'Validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

const validateQuery = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.query);
    if (error) {
      return res.status(400).json({
        error: 'Query validation error',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }
    next();
  };
};

// Common validation schemas
const userValidation = {
  register: Joi.object({
    email: Joi.string().email().required(),
    phone: Joi.string().pattern(/^(\+20|0)?1[0-9]{9}$/).required(),
    password: Joi.string().min(8).required(),
    firstName: Joi.string().trim().required(),
    lastName: Joi.string().trim().required()
  }),
  
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  
  update: Joi.object({
    email: Joi.string().email(),
    phone: Joi.string().pattern(/^(\+20|0)?1[0-9]{9}$/),
    firstName: Joi.string().trim(),
    lastName: Joi.string().trim()
  })
};

const productValidation = {
  create: Joi.object({
    name: Joi.string().trim().required(),
    description: Joi.string().trim().required(),
    price: Joi.number().min(0).required(),
    currency: Joi.string().valid('EGP', 'USD', 'EUR').default('EGP'),
    category: Joi.string().trim().required(),
    subcategory: Joi.string().trim(),
    tags: Joi.array().items(Joi.string().trim()),
    attributes: Joi.object()
  }),
  
  update: Joi.object({
    name: Joi.string().trim(),
    description: Joi.string().trim(),
    price: Joi.number().min(0),
    currency: Joi.string().valid('EGP', 'USD', 'EUR'),
    category: Joi.string().trim(),
    subcategory: Joi.string().trim(),
    tags: Joi.array().items(Joi.string().trim()),
    attributes: Joi.object(),
    isActive: Joi.boolean(),
    isFeatured: Joi.boolean()
  }),
  
  query: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(10),
    category: Joi.string().trim(),
    minPrice: Joi.number().min(0),
    maxPrice: Joi.number().min(0),
    search: Joi.string().trim(),
    tags: Joi.alternatives().try(
      Joi.string(),
      Joi.array().items(Joi.string())
    ),
    sortBy: Joi.string().valid('name', 'price', 'createdAt', 'rating').default('createdAt'),
    sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
    isActive: Joi.boolean(),
    isFeatured: Joi.boolean()
  })
};

const orderValidation = {
  create: Joi.object({
    products: Joi.array().items(
      Joi.object({
        product: Joi.string().hex().length(24).required(),
        quantity: Joi.number().min(1).default(1)
      })
    ).required(),
    paymentMethod: Joi.string().valid('fawry', 'vodafone_cash', 'orange_money', 'instapay', 'credit_card', 'bank_transfer').required(),
    customerInfo: Joi.object({
      email: Joi.string().email().required(),
      phone: Joi.string().pattern(/^(\+20|0)?1[0-9]{9}$/).required(),
      firstName: Joi.string().trim().required(),
      lastName: Joi.string().trim().required()
    }),
    notes: Joi.string().trim()
  })
};

module.exports = {
  validateRequest,
  validateQuery,
  userValidation,
  productValidation,
  orderValidation
};