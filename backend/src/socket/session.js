const TerminalSession = require('../models/TerminalSession');
const CommandHistory = require('../models/CommandHistory');
const { getUserId, isAuthenticated } = require('../middleware/socketAuth');

/**
 * Setup terminal session-related Socket.IO event handlers
 * @param {Socket} socket - Socket.IO socket instance
 */
function setupSessionHandlers(socket) {
  console.log('📂 Setting up session handlers for socket:', socket.id);

  /**
   * Create a new terminal session
   * Event: session:create
   * Payload: { title?, projectPath? }
   */
  socket.on('session:create', async ({ title, projectPath } = {}) => {
    try {
      if (!isAuthenticated(socket)) {
        return socket.emit('session:create:error', {
          message: 'You must be logged in to create a session'
        });
      }

      const userId = getUserId(socket);
      const session = await TerminalSession.create(
        userId,
        title || `Session ${new Date().toLocaleString()}`,
        projectPath
      );

      console.log(`✅ Session created: ${session.id} for user ${userId}`);

      socket.emit('session:created', { session });
    } catch (error) {
      console.error('❌ Session creation error:', error.message);
      socket.emit('session:create:error', {
        message: error.message || 'Failed to create session'
      });
    }
  });

  /**
   * List all sessions for the current user
   * Event: session:list
   */
  socket.on('session:list', async () => {
    try {
      if (!isAuthenticated(socket)) {
        return socket.emit('session:list:error', {
          message: 'You must be logged in to list sessions'
        });
      }

      const userId = getUserId(socket);
      const sessions = await TerminalSession.findByUserId(userId);

      socket.emit('session:list:result', { sessions });
    } catch (error) {
      console.error('❌ Session list error:', error.message);
      socket.emit('session:list:error', {
        message: error.message || 'Failed to list sessions'
      });
    }
  });

  /**
   * Load a specific session (with history)
   * Event: session:load
   * Payload: { sessionId }
   */
  socket.on('session:load', async ({ sessionId }) => {
    try {
      if (!isAuthenticated(socket)) {
        return socket.emit('session:load:error', {
          message: 'You must be logged in to load a session'
        });
      }

      if (!sessionId) {
        return socket.emit('session:load:error', {
          message: 'Session ID is required'
        });
      }

      const userId = getUserId(socket);
      const session = await TerminalSession.findById(sessionId);

      if (!session) {
        return socket.emit('session:load:error', {
          message: 'Session not found'
        });
      }

      // Verify ownership
      if (session.user_id !== userId) {
        return socket.emit('session:load:error', {
          message: 'You do not have access to this session'
        });
      }

      // Get command history
      const history = await CommandHistory.findBySessionId(sessionId);

      console.log(`✅ Session loaded: ${sessionId} for user ${userId}`);

      socket.emit('session:loaded', {
        session,
        history
      });
    } catch (error) {
      console.error('❌ Session load error:', error.message);
      socket.emit('session:load:error', {
        message: error.message || 'Failed to load session'
      });
    }
  });

  /**
   * Rename a session
   * Event: session:rename
   * Payload: { sessionId, newTitle }
   */
  socket.on('session:rename', async ({ sessionId, newTitle }) => {
    try {
      if (!isAuthenticated(socket)) {
        return socket.emit('session:rename:error', {
          message: 'You must be logged in to rename a session'
        });
      }

      if (!sessionId || !newTitle) {
        return socket.emit('session:rename:error', {
          message: 'Session ID and new title are required'
        });
      }

      const userId = getUserId(socket);
      const session = await TerminalSession.findById(sessionId);

      if (!session) {
        return socket.emit('session:rename:error', {
          message: 'Session not found'
        });
      }

      // Verify ownership
      if (session.user_id !== userId) {
        return socket.emit('session:rename:error', {
          message: 'You do not have access to this session'
        });
      }

      const updatedSession = await TerminalSession.updateTitle(sessionId, newTitle);

      console.log(`✅ Session renamed: ${sessionId} to "${newTitle}"`);

      socket.emit('session:renamed', {
        session: updatedSession
      });
    } catch (error) {
      console.error('❌ Session rename error:', error.message);
      socket.emit('session:rename:error', {
        message: error.message || 'Failed to rename session'
      });
    }
  });

  /**
   * Delete a session
   * Event: session:delete
   * Payload: { sessionId }
   */
  socket.on('session:delete', async ({ sessionId }) => {
    try {
      if (!isAuthenticated(socket)) {
        return socket.emit('session:delete:error', {
          message: 'You must be logged in to delete a session'
        });
      }

      if (!sessionId) {
        return socket.emit('session:delete:error', {
          message: 'Session ID is required'
        });
      }

      const userId = getUserId(socket);
      const session = await TerminalSession.findById(sessionId);

      if (!session) {
        return socket.emit('session:delete:error', {
          message: 'Session not found'
        });
      }

      // Verify ownership
      if (session.user_id !== userId) {
        return socket.emit('session:delete:error', {
          message: 'You do not have access to this session'
        });
      }

      await TerminalSession.deleteSession(sessionId);

      console.log(`✅ Session deleted: ${sessionId}`);

      socket.emit('session:deleted', { sessionId });
    } catch (error) {
      console.error('❌ Session delete error:', error.message);
      socket.emit('session:delete:error', {
        message: error.message || 'Failed to delete session'
      });
    }
  });
}

module.exports = { setupSessionHandlers };
