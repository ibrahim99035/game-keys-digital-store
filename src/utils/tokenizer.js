const jwt = require('jsonwebtoken');

exports.generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, roles: user.roles },
    process.env.JWT_SECRET,
    { expiresIn: '15m' }
  );
};

exports.generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );
};

exports.verifyToken = (token, secret = process.env.JWT_SECRET) => {
  return jwt.verify(token, secret);
};