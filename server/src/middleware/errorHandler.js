const multer = require('multer');
const { nodeEnv } = require('../config/env');

/**
 * Centralized error handler. Operational (AppError) errors return
 * their intended status + message. Multer upload errors are mapped
 * to appropriate HTTP codes. Unexpected errors are logged
 * server-side and a generic 500 is returned to the client - stack
 * traces are never exposed to the caller.
 */
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    const statusCode = err.code === 'LIMIT_FILE_SIZE' ? 413 : 400;
    return res.status(statusCode).json({ status: 'error', message: err.message });
  }

  const statusCode = err.isOperational && err.statusCode ? err.statusCode : 500;
  const message = err.isOperational ? err.message : 'Internal server error';

  if (!err.isOperational) {
    // eslint-disable-next-line no-console
    console.error('Unexpected error:', err);
  }

  const body = { status: 'error', message };
  if (nodeEnv === 'development' && !err.isOperational) {
    body.stack = err.stack;
  }

  res.status(statusCode).json(body);
}

function notFoundHandler(req, res) {
  res.status(404).json({ status: 'error', message: 'Route not found' });
}

module.exports = { errorHandler, notFoundHandler };
