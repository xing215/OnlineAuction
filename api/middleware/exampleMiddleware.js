/**
 * EXAMPLE MIDDLEWARE
 * 
 * This is an example middleware to demonstrate the architecture.
 * Use this as a template when creating your own middleware.
 * 
 * Middleware functions have access to the request and response objects,
 * and can modify them or terminate the request-response cycle.
 */

/**
 * Example middleware that checks if a specific header is present
 */
const checkCustomHeader = (req, res, next) => {
  const customHeader = req.header('X-Custom-Header');

  if (!customHeader) {
    return res.status(400).json({
      success: false,
      message: 'Missing required custom header'
    });
  }

  // Add the header value to the request object for later use
  req.customHeaderValue = customHeader;
  
  next();
};

/**
 * Example middleware that validates request body
 */
const validateBody = (req, res, next) => {
  const { name, description } = req.body;

  const errors = [];

  if (!name || typeof name !== 'string') {
    errors.push('Name is required and must be a string');
  }

  if (!description || typeof description !== 'string') {
    errors.push('Description is required and must be a string');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

/**
 * Example middleware that adds timing information
 */
const requestTimer = (req, res, next) => {
  req.startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - req.startTime;
    console.log(`Request to ${req.method} ${req.url} took ${duration}ms`);
  });

  next();
};

module.exports = {
  checkCustomHeader,
  validateBody,
  requestTimer
};
