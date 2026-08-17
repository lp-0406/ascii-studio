const { pool } = require('../../src/config/db');

/**
 * Truncates all app tables between test files/suites so tests are
 * independent and repeatable. FK checks are disabled briefly since
 * artworks/shared_artworks reference users.
 */
async function resetDatabase() {
  await pool.query('SET FOREIGN_KEY_CHECKS = 0');
  await pool.query('TRUNCATE TABLE shared_artworks');
  await pool.query('TRUNCATE TABLE artworks');
  await pool.query('TRUNCATE TABLE users');
  await pool.query('SET FOREIGN_KEY_CHECKS = 1');
}

async function closeDatabase() {
  await pool.end();
}

module.exports = { resetDatabase, closeDatabase };
