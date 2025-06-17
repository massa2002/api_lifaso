const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limite à 5 tentatives par IP
  message: { 
    error: 'Too many login attempts. Please try again later.', 
    retryAfter: 15 
  },
  headers: true,
  handler: (req, res) => {
    res.status(429).json({ 
      error: 'Too many login attempts. Please try again later.', 
      retryAfter: 15 
    });
  },
});

module.exports = loginLimiter;
