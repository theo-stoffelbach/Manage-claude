const { pool } = require('../config/database');

/**
 * TerminalSession Model - Manages terminal sessions
 */

/**
 * Create a new terminal session
 * @param {number} userId - User ID
 * @param {string} title - Session title
 * @param {string} projectPath - Optional project path
 * @returns {Promise<Object>} - Created session object
 */
async function create(userId, title = 'New Session', projectPath = null) {
  const query = `
    INSERT INTO terminal_sessions (user_id, title, project_path)
    VALUES ($1, $2, $3)
    RETURNING id, user_id, title, project_path, created_at, updated_at
  `;

  const result = await pool.query(query, [userId, title, projectPath]);
  return result.rows[0];
}

/**
 * Find all sessions for a user
 * @param {number} userId - User ID
 * @returns {Promise<Array>} - Array of session objects
 */
async function findByUserId(userId) {
  const query = `
    SELECT id, user_id, title, project_path, created_at, updated_at
    FROM terminal_sessions
    WHERE user_id = $1
    ORDER BY updated_at DESC
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
}

/**
 * Find session by ID
 * @param {number} id - Session ID
 * @returns {Promise<Object|null>} - Session object or null
 */
async function findById(id) {
  const query = `
    SELECT id, user_id, title, project_path, created_at, updated_at
    FROM terminal_sessions
    WHERE id = $1
  `;

  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

/**
 * Update session title
 * @param {number} id - Session ID
 * @param {string} title - New title
 * @returns {Promise<Object>} - Updated session object
 */
async function updateTitle(id, title) {
  const query = `
    UPDATE terminal_sessions
    SET title = $1, updated_at = NOW()
    WHERE id = $2
    RETURNING id, user_id, title, project_path, created_at, updated_at
  `;

  const result = await pool.query(query, [title, id]);
  return result.rows[0];
}

/**
 * Update session's last activity timestamp
 * @param {number} id - Session ID
 * @returns {Promise<void>}
 */
async function updateActivity(id) {
  const query = `
    UPDATE terminal_sessions
    SET updated_at = NOW()
    WHERE id = $1
  `;

  await pool.query(query, [id]);
}

/**
 * Delete a session
 * @param {number} id - Session ID
 * @returns {Promise<void>}
 */
async function deleteSession(id) {
  const query = `
    DELETE FROM terminal_sessions
    WHERE id = $1
  `;

  await pool.query(query, [id]);
}

module.exports = {
  create,
  findByUserId,
  findById,
  updateTitle,
  updateActivity,
  deleteSession
};
