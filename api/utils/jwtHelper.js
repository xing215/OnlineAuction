const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Generate JWT token
exports.generateToken = (payload, expiresIn = config.jwt.expiresIn) => {
  return jwt.sign(payload, config.jwt.secret, { expiresIn });
};

// Verify JWT token
exports.verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.secret);
  } catch (error) {
    throw new Error('Invalid token');
  }
};

// Decode JWT token without verification
exports.decodeToken = (token) => {
  return jwt.decode(token);
};
