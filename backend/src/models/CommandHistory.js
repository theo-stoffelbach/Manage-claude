const { pool } = require('../config/database');

/**
 * CommandHistory Model - Manages command history
 */

/**
 * Create a new command history entry
 * @param {number} sessionId - Terminal session ID
 * @param {string} command - Command executed
 * @param {string} output - Command output
 * @returns {Promise<Object>} - Created command history object
 */
async function create(sessionId, command, output = null) {
  const query = `
    INSERT INTO command_history (session_id, command, output)
    VALUES ($1, $2, $3)
    RETURNING id, session_id, command, output, executed_at
  `;

  const result = await pool.query(query, [sessionId, command, output]);
  return result.rows[0];
}

/**
 * Find all commands for a session
 * @param {number} sessionId - Terminal session ID
 * @param {number} limit - Maximum number of commands to return
 * @returns {Promise<Array>} - Array of command history objects
 */
async function findBySessionId(sessionId, limit = 1000) {
  const query = `
    SELECT id, session_id, command, output, executed_at
    FROM command_history
    WHERE session_id = $1
    ORDER BY executed_at ASC
    LIMIT $2
  `;

  const result = await pool.query(query, [sessionId, limit]);
  return result.rows;
}

/**
 * Get recent commands for a session
 * @param {number} sessionId - Terminal session ID
 * @param {number} limit - Number of recent commands to return
 * @returns {Promise<Array>} - Array of recent command history objects
 */
async function getRecent(sessionId, limit = 50) {
  const query = `
    SELECT id, session_id, command, output, executed_at
    FROM command_history
    WHERE session_id = $1
    ORDER BY executed_at DESC
    LIMIT $2
  `;

  const result = await pool.query(query, [sessionId, limit]);
  return result.rows.reverse(); // Return in chronological order
}

/**
 * Delete all commands for a session
 * @param {number} sessionId - Terminal session ID
 * @returns {Promise<void>}
 */
async function deleteBySessionId(sessionId) {
  const query = `
    DELETE FROM command_history
    WHERE session_id = $1
  `;

  await pool.query(query, [sessionId]);
}

/**
 * Count commands in a session
 * @param {number} sessionId - Terminal session ID
 * @returns {Promise<number>} - Number of commands
 */
async function countBySessionId(sessionId) {
  const query = `
    SELECT COUNT(*) as count
    FROM command_history
    WHERE session_id = $1
  `;

  const result = await pool.query(query, [sessionId]);
  return parseInt(result.rows[0].count);
}

module.exports = {
  create,
  findBySessionId,
  getRecent,
  deleteBySessionId,
  countBySessionId
};
