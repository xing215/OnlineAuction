// Utility functions

// Format date
exports.formatDate = (date) => {
  return new Date(date).toISOString();
};

// Generate random string
exports.generateRandomString = (length = 10) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Validate email format
exports.isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize string (basic example)
exports.sanitizeString = (str) => {
  return str.trim().replace(/[<>]/g, '');
};

// Check if object is empty
exports.isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Calculate time difference
exports.getTimeDifference = (date1, date2) => {
  return Math.abs(new Date(date2) - new Date(date1));
};
