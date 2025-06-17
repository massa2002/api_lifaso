const { check, validationResult } = require('express-validator');

const validateLogin = [
  check('email').isEmail().withMessage('Email is invalid'),
  check('mot_de_passe').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = validateLogin;
