const AppError = require('../utils/AppError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validateRegister(req, res, next) {
  const { name, email, password } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return next(new AppError('Name must be at least 2 characters', 400));
  }
  if (!email || !EMAIL_REGEX.test(email)) {
    return next(new AppError('A valid email is required', 400));
  }
  if (!password || typeof password !== 'string' || password.length < 8) {
    return next(new AppError('Password must be at least 8 characters', 400));
  }
  return next();
}

function validateLogin(req, res, next) {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError('Email and password are required', 400));
  }
  return next();
}

module.exports = { validateRegister, validateLogin };
