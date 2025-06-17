const jwt = require('jsonwebtoken');

const generateToken = (userId, statut) => {
  return jwt.sign({ userId, statut}, process.env.JWT_SECRET, { expiresIn: '90h' });
};

module.exports = { generateToken };
