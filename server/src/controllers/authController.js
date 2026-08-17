const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');
const authService = require('../services/authService');

const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  const user = await authService.registerUser({ name, email, password });
  const token = signToken({ id: user.id, email: user.email });

  res.status(201).json({ status: 'success', data: { user, token } });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await authService.authenticateUser({ email, password });
  const token = signToken({ id: user.id, email: user.email });

  res.status(200).json({ status: 'success', data: { user, token } });
});

// Stateless JWT logout: the client discards the token. This endpoint
// exists for API completeness and to allow future server-side
// token revocation (e.g. a blocklist) without changing the contract.
const logout = asyncHandler(async (req, res) => {
  res.status(200).json({ status: 'success', message: 'Logged out' });
});

const me = asyncHandler(async (req, res) => {
  const user = await authService.findUserById(req.user.id);
  res.status(200).json({ status: 'success', data: { user } });
});

module.exports = { register, login, logout, me };
