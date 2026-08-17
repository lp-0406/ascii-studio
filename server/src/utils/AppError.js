/**
 * Operational error carrying an HTTP status code.
 * Thrown deliberately by controllers/services for expected
 * failure cases (bad input, not found, unauthorized, etc.)
 */
class AppError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;
