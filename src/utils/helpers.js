exports.pick = (obj, keys) => {
  return keys.reduce((acc, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      acc[key] = obj[key];
    }
    return acc;
  }, {});
};

exports.generateRandomCode = (length = 6) => {
  return Math.random().toString().slice(2, 2 + length);
};

// Add more helper functions as needed