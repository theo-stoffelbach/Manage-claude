const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

/**
 * User Model - Manages user accounts
 */

/**
 * Create a new user
 * @param {string} username - User's username
 * @param {string} email - User's email
 * @param {string} password - Plain text password (will be hashed)
 * @returns {Promise<Object>} - Created user object
 */
async function create(username, email, password) {
  try {
    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    const query = `
      INSERT INTO users (username, email, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, email, created_at
    `;

    const result = await pool.query(query, [username, email, passwordHash]);
    return result.rows[0];
  } catch (error) {
    if (error.code === '23505') { // Unique violation
      throw new Error('Username or email already exists');
    }
    throw error;
  }
}

/**
 * Find user by username
 * @param {string} username - Username to search
 * @returns {Promise<Object|null>} - User object or null
 */
async function findByUsername(username) {
  const query = `
    SELECT id, username, email, password_hash, created_at
    FROM users
    WHERE username = $1
  `;

  const result = await pool.query(query, [username]);
  return result.rows[0] || null;
}

/**
 * Find user by ID
 * @param {number} id - User ID
 * @returns {Promise<Object|null>} - User object or null
 */
async function findById(id) {
  const query = `
    SELECT id, username, email, created_at
    FROM users
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

/**
 * Find user by email
 * @param {string} email - Email to search
 * @returns {Promise<Object|null>} - User object or null
 */
async function findByEmail(email) {
  const query = `
    SELECT id, username, email, password_hash, created_at
    FROM users
    WHERE email = $1
  `;

  const result = await pool.query(query, [email]);
  return result.rows[0] || null;
}

/**
 * Verify password
 * @param {string} plainPassword - Plain text password
 * @param {string} hashedPassword - Hashed password from database
 * @returns {Promise<boolean>} - True if password matches
 */
async function verifyPassword(plainPassword, hashedPassword) {
  return bcrypt.compare(plainPassword, hashedPassword);
}

module.exports = {
  create,
  findByUsername,
  findById,
  findByEmail,
  verifyPassword
};
