const jwt = require('jsonwebtoken');
const { AppError } = require('../utills/errorHandler');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return next(new AppError('Access token required', 401));
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return next(new AppError('Invalid or expired token', 403));
  }
};

module.exports = { authenticateToken };