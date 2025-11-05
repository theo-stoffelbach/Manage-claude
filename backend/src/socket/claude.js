const claudeService = require('../services/claudeService');
const { getUserId, isAuthenticated } = require('../middleware/socketAuth');
const ptyService = require('../services/ptyService');

/**
 * Setup Claude Code-related Socket.IO event handlers
 * @param {Socket} socket - Socket.IO socket instance
 */
function setupClaudeHandlers(socket) {
  console.log('🤖 Setting up Claude handlers for socket:', socket.id);

  /**
   * Launch Claude Code in the current terminal
   * Event: claude:launch
   * Payload: { projectPath }
   */
  socket.on('claude:launch', async ({ projectPath }) => {
    try {
      if (!isAuthenticated(socket)) {
        return socket.emit('claude:launch:error', {
          message: 'You must be logged in to use Claude Code'
        });
      }

      if (!projectPath) {
        return socket.emit('claude:launch:error', {
          message: 'Project path is required'
        });
      }

      // Get the terminal instance for this socket
      const terminal = ptyService.getTerminal(socket.id);
      if (!terminal) {
        return socket.emit('claude:launch:error', {
          message: 'No active terminal found. Please create a session first.'
        });
      }

      // Validate project path
      const validation = claudeService.validateProjectPath(projectPath);
      if (!validation.valid) {
        return socket.emit('claude:launch:error', {
          message: validation.error
        });
      }

      // Launch Claude
      await claudeService.launchClaude(terminal, projectPath);

      const userId = getUserId(socket);
      console.log(`✅ Claude launched for user ${userId} in ${projectPath}`);

      socket.emit('claude:launched', {
        message: 'Claude Code launched successfully',
        projectPath
      });
    } catch (error) {
      console.error('❌ Claude launch error:', error.message);
      socket.emit('claude:launch:error', {
        message: error.message || 'Failed to launch Claude Code'
      });
    }
  });

  /**
   * Check if Claude Code is installed
   * Event: claude:check
   */
  socket.on('claude:check', async () => {
    try {
      const terminal = ptyService.getTerminal(socket.id);
      if (!terminal) {
        return socket.emit('claude:check:result', {
          installed: false,
          message: 'No active terminal'
        });
      }

      const installed = await claudeService.isClaudeInstalled(terminal);

      socket.emit('claude:check:result', {
        installed,
        message: installed
          ? 'Claude Code is installed'
          : 'Claude Code is not installed. Install with: npm install -g @anthropic-ai/claude-code'
      });
    } catch (error) {
      console.error('❌ Claude check error:', error.message);
      socket.emit('claude:check:result', {
        installed: false,
        message: 'Error checking Claude installation'
      });
    }
  });
}

module.exports = { setupClaudeHandlers };
