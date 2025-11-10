const { setupAuthHandlers } = require('../auth');
const User = require('../../models/User');

// Mock User model
jest.mock('../../models/User');

describe('Auth Socket Handlers', () => {
  let mockSocket;
  let mockIo;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock socket
    mockSocket = {
      id: 'test-socket-id',
      on: jest.fn(),
      emit: jest.fn(),
      data: {},
      request: {
        session: {
          userId: null,
          username: null,
          save: jest.fn((callback) => callback(null)),
          destroy: jest.fn((callback) => callback(null))
        }
      }
    };

    // Mock io
    mockIo = {
      emit: jest.fn()
    };

    // Setup handlers
    setupAuthHandlers(mockSocket, mockIo);
  });

  describe('auth:register', () => {
    const getRegisterHandler = () => {
      const registerCall = mockSocket.on.mock.calls.find(
        call => call[0] === 'auth:register'
      );
      return registerCall ? registerCall[1] : null;
    };

    it('should register handler on socket', () => {
      expect(mockSocket.on).toHaveBeenCalledWith('auth:register', expect.any(Function));
    });

    it('should successfully register a valid user', async () => {
      const handler = getRegisterHandler();
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        created_at: new Date()
      };

      User.create.mockResolvedValue(mockUser);

      await handler({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(User.create).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
      expect(mockSocket.emit).toHaveBeenCalledWith('auth:register:success', {
        message: 'Registration successful! Please login.',
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        }
      });
    });

    it('should reject registration with missing username', async () => {
      const handler = getRegisterHandler();

      await handler({
        email: 'test@example.com',
        password: 'password123'
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('auth:register:error', {
        message: 'Username, email, and password are required'
      });
      expect(User.create).not.toHaveBeenCalled();
    });

    it('should reject registration with missing email', async () => {
      const handler = getRegisterHandler();

      await handler({
        username: 'testuser',
        password: 'password123'
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('auth:register:error', {
        message: 'Username, email, and password are required'
      });
    });

    it('should reject registration with missing password', async () => {
      const handler = getRegisterHandler();

      await handler({
        username: 'testuser',
        email: 'test@example.com'
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('auth:register:error', {
        message: 'Username, email, and password are required'
      });
    });

    it('should reject registration with invalid username format', async () => {
      const handler = getRegisterHandler();

      const invalidUsernames = ['ab', 'user@name', 'user name', 'u'.repeat(21)];

      for (const username of invalidUsernames) {
        mockSocket.emit.mockClear();

        await handler({
          username,
          email: 'test@example.com',
          password: 'password123'
        });

        expect(mockSocket.emit).toHaveBeenCalledWith('auth:register:error', {
          message: 'Username must be 3-20 characters (letters, numbers, _ or -)'
        });
      }
    });

    it('should accept valid username formats', async () => {
      const handler = getRegisterHandler();
      User.create.mockResolvedValue({
        id: 1,
        username: 'test_user-123',
        email: 'test@example.com'
      });

      const validUsernames = ['test', 'test_user', 'test-user', 'test123', 'test_user-123'];

      for (const username of validUsernames) {
        mockSocket.emit.mockClear();
        User.create.mockClear();

        await handler({
          username,
          email: 'test@example.com',
          password: 'password123'
        });

        expect(User.create).toHaveBeenCalled();
        expect(mockSocket.emit).toHaveBeenCalledWith('auth:register:success', expect.any(Object));
      }
    });

    it('should reject registration with invalid email format', async () => {
      const handler = getRegisterHandler();

      const invalidEmails = ['invalid', 'invalid@', '@example.com', 'invalid@.com'];

      for (const email of invalidEmails) {
        mockSocket.emit.mockClear();

        await handler({
          username: 'testuser',
          email,
          password: 'password123'
        });

        expect(mockSocket.emit).toHaveBeenCalledWith('auth:register:error', {
          message: 'Invalid email format'
        });
      }
    });

    it('should reject registration with short password', async () => {
      const handler = getRegisterHandler();

      await handler({
        username: 'testuser',
        email: 'test@example.com',
        password: '12345'
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('auth:register:error', {
        message: 'Password must be at least 6 characters'
      });
    });

    it('should handle duplicate username/email error', async () => {
      const handler = getRegisterHandler();

      User.create.mockRejectedValue(new Error('Username or email already exists'));

      await handler({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('auth:register:error', {
        message: 'Username or email already exists'
      });
    });

    it('should handle database errors', async () => {
      const handler = getRegisterHandler();

      User.create.mockRejectedValue(new Error('Database connection failed'));

      await handler({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('auth:register:error', {
        message: 'Database connection failed'
      });
    });
  });

  describe('auth:login', () => {
    const getLoginHandler = () => {
      const loginCall = mockSocket.on.mock.calls.find(
        call => call[0] === 'auth:login'
      );
      return loginCall ? loginCall[1] : null;
    };

    it('should register handler on socket', () => {
      expect(mockSocket.on).toHaveBeenCalledWith('auth:login', expect.any(Function));
    });

    it('should successfully login with valid credentials', async () => {
      const handler = getLoginHandler();
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword'
      };

      User.findByUsername.mockResolvedValue(mockUser);
      User.verifyPassword.mockResolvedValue(true);

      await handler({
        username: 'testuser',
        password: 'password123'
      });

      expect(User.findByUsername).toHaveBeenCalledWith('testuser');
      expect(User.verifyPassword).toHaveBeenCalledWith('password123', 'hashedpassword');
      expect(mockSocket.request.session.userId).toBe(1);
      expect(mockSocket.request.session.username).toBe('testuser');
      expect(mockSocket.data.userId).toBe(1);
      expect(mockSocket.data.username).toBe('testuser');
      expect(mockSocket.emit).toHaveBeenCalledWith('auth:login:success', {
        user: {
          id: 1,
          username: 'testuser',
          email: 'test@example.com'
        }
      });
    });

    it('should reject login with missing username', async () => {
      const handler = getLoginHandler();

      await handler({
        password: 'password123'
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('auth:login:error', {
        message: 'Username and password are required'
      });
    });

    it('should reject login with missing password', async () => {
      const handler = getLoginHandler();

      await handler({
        username: 'testuser'
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('auth:login:error', {
        message: 'Username and password are required'
      });
    });

    it('should reject login with non-existent user', async () => {
      const handler = getLoginHandler();

      User.findByUsername.mockResolvedValue(null);

      await handler({
        username: 'nonexistent',
        password: 'password123'
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('auth:login:error', {
        message: 'Invalid username or password'
      });
    });

    it('should reject login with incorrect password', async () => {
      const handler = getLoginHandler();
      const mockUser = {
        id: 1,
        username: 'testuser',
        password_hash: 'hashedpassword'
      };

      User.findByUsername.mockResolvedValue(mockUser);
      User.verifyPassword.mockResolvedValue(false);

      await handler({
        username: 'testuser',
        password: 'wrongpassword'
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('auth:login:error', {
        message: 'Invalid username or password'
      });
    });

    it('should handle session save errors', async () => {
      const handler = getLoginHandler();
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword'
      };

      User.findByUsername.mockResolvedValue(mockUser);
      User.verifyPassword.mockResolvedValue(true);
      mockSocket.request.session.save.mockImplementation((callback) => {
        callback(new Error('Session save failed'));
      });

      await handler({
        username: 'testuser',
        password: 'password123'
      });

      expect(mockSocket.emit).toHaveBeenCalledWith('auth:login:error', {
        message: 'Login failed - session error'
      });
    });
  });

  describe('auth:logout', () => {
    const getLogoutHandler = () => {
      const logoutCall = mockSocket.on.mock.calls.find(
        call => call[0] === 'auth:logout'
      );
      return logoutCall ? logoutCall[1] : null;
    };

    it('should register handler on socket', () => {
      expect(mockSocket.on).toHaveBeenCalledWith('auth:logout', expect.any(Function));
    });

    it('should successfully logout user', () => {
      const handler = getLogoutHandler();

      mockSocket.data.username = 'testuser';
      mockSocket.data.userId = 1;

      handler();

      expect(mockSocket.request.session.destroy).toHaveBeenCalled();
      expect(mockSocket.data.userId).toBeNull();
      expect(mockSocket.data.username).toBeNull();
      expect(mockSocket.emit).toHaveBeenCalledWith('auth:logout:success', {
        message: 'Logged out successfully'
      });
    });

    it('should handle session destroy errors', () => {
      const handler = getLogoutHandler();

      mockSocket.request.session.destroy.mockImplementation((callback) => {
        callback(new Error('Session destroy failed'));
      });

      handler();

      expect(mockSocket.emit).toHaveBeenCalledWith('auth:logout:error', {
        message: 'Logout failed'
      });
    });
  });

  describe('auth:check', () => {
    const getCheckHandler = () => {
      const checkCall = mockSocket.on.mock.calls.find(
        call => call[0] === 'auth:check'
      );
      return checkCall ? checkCall[1] : null;
    };

    it('should register handler on socket', () => {
      expect(mockSocket.on).toHaveBeenCalledWith('auth:check', expect.any(Function));
    });

    it('should return authenticated true for logged in user', () => {
      const handler = getCheckHandler();

      mockSocket.request.session.userId = 1;
      mockSocket.request.session.username = 'testuser';

      handler();

      expect(mockSocket.emit).toHaveBeenCalledWith('auth:check:result', {
        authenticated: true,
        user: {
          id: 1,
          username: 'testuser'
        }
      });
    });

    it('should return authenticated false for non-logged in user', () => {
      const handler = getCheckHandler();

      handler();

      expect(mockSocket.emit).toHaveBeenCalledWith('auth:check:result', {
        authenticated: false
      });
    });
  });
});
