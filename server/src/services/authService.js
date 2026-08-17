const bcrypt = require('bcrypt');
const { pool } = require('../config/db');
const AppError = require('../utils/AppError');

const SALT_ROUNDS = 10;

async function findUserByEmail(email) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, password_hash, created_at FROM users WHERE email = :email LIMIT 1',
    { email },
  );
  return rows[0] || null;
}

async function findUserById(id) {
  const [rows] = await pool.execute(
    'SELECT id, name, email, created_at FROM users WHERE id = :id LIMIT 1',
    { id },
  );
  return rows[0] || null;
}

async function registerUser({ name, email, password }) {
  const existing = await findUserByEmail(email);
  if (existing) {
    throw new AppError('An account with this email already exists', 409);
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const [result] = await pool.execute(
    'INSERT INTO users (name, email, password_hash) VALUES (:name, :email, :passwordHash)',
    { name: name.trim(), email: email.toLowerCase().trim(), passwordHash },
  );

  return findUserById(result.insertId);
}

async function authenticateUser({ email, password }) {
  const user = await findUserByEmail(email.toLowerCase().trim());
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw new AppError('Invalid email or password', 401);
  }

  const { password_hash: _omit, ...safeUser } = user;
  return safeUser;
}

module.exports = { registerUser, authenticateUser, findUserById, findUserByEmail };
