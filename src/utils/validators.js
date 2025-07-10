const validator = require('validator');

const validateEmail = (email) => {
  return validator.isEmail(email);
};

const validatePhone = (phone) => {
  // Egyptian phone number validation
  const egyptianPhoneRegex = /^(\+20|0)?1[0-9]{9}$/;
  return egyptianPhoneRegex.test(phone);
};

const validatePassword = (password) => {
  // At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

const validateURL = (url) => {
  return validator.isURL(url);
};

const validateMongoId = (id) => {
  return validator.isMongoId(id);
};

const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove HTML tags and dangerous characters
  return validator.escape(input.trim());
};

const validatePrice = (price) => {
  return typeof price === 'number' && price >= 0 && price <= 1000000;
};

const validateFileType = (mimetype, allowedTypes) => {
  return allowedTypes.includes(mimetype);
};

const validateFileSize = (size, maxSize) => {
  return size <= maxSize;
};

const formatEgyptianPhone = (phone) => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Add +20 prefix if not present
  if (digits.startsWith('20')) {
    return '+' + digits;
  } else if (digits.startsWith('1')) {
    return '+20' + digits;
  } else if (digits.startsWith('01')) {
    return '+20' + digits.substring(1);
  }
  
  return phone; // Return original if can't format
};

const validateEgyptianCurrency = (amount) => {
  // Validate EGP amount (should be positive and have max 2 decimal places)
  const regex = /^\d+(\.\d{1,2})?$/;
  return regex.test(amount.toString()) && amount > 0;
};

const validateProductAttributes = (attributes) => {
  if (!attributes || typeof attributes !== 'object') return true;
  
  // Check for common product attributes
  const allowedAttributes = [
    'brand', 'model', 'color', 'size', 'weight', 'dimensions',
    'material', 'warranty', 'features', 'specifications',
    'downloadFormat', 'fileSize', 'duration', 'language',
    'compatibility', 'version', 'license'
  ];
  
  return Object.keys(attributes).every(key => 
    allowedAttributes.includes(key) || key.startsWith('custom_')
  );
};

const validateOrderItems = (items) => {
  if (!Array.isArray(items) || items.length === 0) return false;
  
  return items.every(item => 
    item.product && 
    validateMongoId(item.product) &&
    item.quantity && 
    typeof item.quantity === 'number' && 
    item.quantity > 0
  );
};

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateURL,
  validateMongoId,
  sanitizeInput,
  validatePrice,
  validateFileType,
  validateFileSize,
  formatEgyptianPhone,
  validateEgyptianCurrency,
  validateProductAttributes,
  validateOrderItems
};
