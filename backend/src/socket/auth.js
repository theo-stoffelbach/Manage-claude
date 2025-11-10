const User = require('../models/User');

/**
 * Setup authentication-related Socket.IO event handlers
 * @param {Socket} socket - Socket.IO socket instance
 * @param {Server} io - Socket.IO server instance
 */
function setupAuthHandlers(socket, io) {
  console.log('🔐 Setting up auth handlers for socket:', socket.id);

  /**
   * Handle user registration - DISABLED FOR SECURITY
   * Users must be created via CLI command: npm run create-user
   * Event: auth:register
   */
  socket.on('auth:register', async () => {
    socket.emit('auth:register:error', {
      message: 'Registration is disabled. Please contact your administrator to create an account.'
    });
    console.warn('⚠️  Registration attempt blocked - feature disabled for security');
  });

  /**
   * Handle user login
   * Event: auth:login
   * Payload: { username, password }
   */
  socket.on('auth:login', async ({ username, password }) => {
    try {
      // Validate input
      if (!username || !password) {
        return socket.emit('auth:login:error', {
          message: 'Username and password are required'
        });
      }

      // Find user
      const user = await User.findByUsername(username);
      if (!user) {
        return socket.emit('auth:login:error', {
          message: 'Invalid username or password'
        });
      }

      // Verify password
      const isValid = await User.verifyPassword(password, user.password_hash);
      if (!isValid) {
        return socket.emit('auth:login:error', {
          message: 'Invalid username or password'
        });
      }

      // Store user ID in session
      socket.request.session.userId = user.id;
      socket.request.session.username = user.username;

      // Save session
      socket.request.session.save((err) => {
        if (err) {
          console.error('❌ Session save error:', err);
          return socket.emit('auth:login:error', {
            message: 'Login failed - session error'
          });
        }

        console.log(`✅ User logged in: ${user.username} (ID: ${user.id})`);

        // Store user data in socket for quick access
        socket.data.userId = user.id;
        socket.data.username = user.username;

        socket.emit('auth:login:success', {
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        });
      });
    } catch (error) {
      console.error('❌ Login error:', error.message);
      socket.emit('auth:login:error', {
        message: error.message || 'Login failed'
      });
    }
  });

  /**
   * Handle user logout
   * Event: auth:logout
   */
  socket.on('auth:logout', () => {
    const username = socket.data.username;

    socket.request.session.destroy((err) => {
      if (err) {
        console.error('❌ Logout error:', err);
        return socket.emit('auth:logout:error', {
          message: 'Logout failed'
        });
      }

      console.log(`✅ User logged out: ${username}`);

      // Clear socket data
      socket.data.userId = null;
      socket.data.username = null;

      socket.emit('auth:logout:success', {
        message: 'Logged out successfully'
      });
    });
  });

  /**
   * Check if user is authenticated
   * Event: auth:check
   */
  socket.on('auth:check', () => {
    if (socket.request.session.userId) {
      socket.emit('auth:check:result', {
        authenticated: true,
        user: {
          id: socket.request.session.userId,
          username: socket.request.session.username
        }
      });
    } else {
      socket.emit('auth:check:result', {
        authenticated: false
      });
    }
  });
}

module.exports = { setupAuthHandlers };
