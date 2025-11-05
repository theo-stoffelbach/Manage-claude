/**
 * Socket.IO authentication middleware
 * Verifies that the user is authenticated before allowing certain events
 */

/**
 * Check if user is authenticated
 * @param {Socket} socket - Socket.IO socket instance
 * @param {Function} next - Next middleware function
 */
function requireAuth(socket, next) {
  if (socket.request.session && socket.request.session.userId) {
    // User is authenticated, attach user data to socket
    socket.data.userId = socket.request.session.userId;
    socket.data.username = socket.request.session.username;
    next();
  } else {
    // User is not authenticated
    next(new Error('Unauthorized - Please login first'));
  }
}

/**
 * Check if user is authenticated (for specific events)
 * Returns true if authenticated, false otherwise
 * @param {Socket} socket - Socket.IO socket instance
 * @returns {boolean}
 */
function isAuthenticated(socket) {
  return !!(socket.request.session && socket.request.session.userId);
}

/**
 * Get authenticated user ID from socket
 * @param {Socket} socket - Socket.IO socket instance
 * @returns {number|null} - User ID or null
 */
function getUserId(socket) {
  return socket.request.session?.userId || socket.data.userId || null;
}

module.exports = {
  requireAuth,
  isAuthenticated,
  getUserId
};
