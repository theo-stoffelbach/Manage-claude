const User = require('../User');
const bcrypt = require('bcryptjs');

// Mock the database pool
jest.mock('../../config/database', () => ({
  pool: {
    query: jest.fn()
  }
}));

const { pool } = require('../../config/database');

describe('User Model', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        created_at: new Date()
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.create('testuser', 'test@example.com', 'password123');

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledTimes(1);

      // Verify password was hashed
      const call = pool.query.mock.calls[0];
      expect(call[0]).toContain('INSERT INTO users');
      expect(call[1][0]).toBe('testuser');
      expect(call[1][1]).toBe('test@example.com');
      expect(call[1][2]).not.toBe('password123'); // Should be hashed
    });

    it('should throw error if username or email already exists', async () => {
      pool.query.mockRejectedValue({ code: '23505' });

      await expect(
        User.create('testuser', 'test@example.com', 'password123')
      ).rejects.toThrow('Username or email already exists');
    });

    it('should propagate other database errors', async () => {
      const dbError = new Error('Database connection failed');
      pool.query.mockRejectedValue(dbError);

      await expect(
        User.create('testuser', 'test@example.com', 'password123')
      ).rejects.toThrow('Database connection failed');
    });
  });

  describe('findByUsername', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        created_at: new Date()
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['testuser']
      );
    });

    it('should return null when user not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await User.findByUsername('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return user without password_hash when found', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        created_at: new Date()
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findById(1);

      expect(result).toEqual(mockUser);
      expect(result).not.toHaveProperty('password_hash');
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        [1]
      );
    });

    it('should return null when user not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await User.findById(999);

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should return user when found', async () => {
      const mockUser = {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        password_hash: 'hashedpassword',
        created_at: new Date()
      };

      pool.query.mockResolvedValue({ rows: [mockUser] });

      const result = await User.findByEmail('test@example.com');

      expect(result).toEqual(mockUser);
      expect(pool.query).toHaveBeenCalledWith(
        expect.stringContaining('SELECT'),
        ['test@example.com']
      );
    });

    it('should return null when user not found', async () => {
      pool.query.mockResolvedValue({ rows: [] });

      const result = await User.findByEmail('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('verifyPassword', () => {
    it('should return true for matching password', async () => {
      const plainPassword = 'password123';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const result = await User.verifyPassword(plainPassword, hashedPassword);

      expect(result).toBe(true);
    });

    it('should return false for non-matching password', async () => {
      const plainPassword = 'password123';
      const wrongPassword = 'wrongpassword';
      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const result = await User.verifyPassword(wrongPassword, hashedPassword);

      expect(result).toBe(false);
    });
  });
});
