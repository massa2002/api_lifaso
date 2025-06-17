const express = require('express');
const AuthController = require('../controllers/authController');
const validateLogin = require('../middlewares/validateLogin');
const loginLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

router.post('/login', loginLimiter, validateLogin, AuthController.login);
router.post('/request-reset-password', AuthController.requestPasswordReset);
router.post('/reset-password', AuthController.resetPassword);

module.exports = router;
