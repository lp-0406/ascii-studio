const { verifyToken } = require('../utils/token');
const AppError = require('../utils/AppError');

/**
 * Protects a route by requiring a valid JWT in the Authorization header.
 * Attaches { id, email } to req.user on success.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(new AppError('Authentication required', 401));
  }

  try {
    const decoded = verifyToken(token);
    req.user = { id: decoded.id, email: decoded.email };
    return next();
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }
}

module.exports = requireAuth;
