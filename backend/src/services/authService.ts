import bcrypt from 'bcryptjs';
import { User } from '../models';
import { generateToken } from '../middleware/auth';
import { RegisterInput, LoginInput } from '../utils/validation';
import { ValidationError, UnauthorizedError } from '../middleware/errorHandler';

/**
 * Register a new user
 */
export async function registerUser(data: RegisterInput) {
  const { email, password } = data;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ValidationError('Email already in use');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Create user
  const user = await User.create({
    email,
    passwordHash,
  });

  // Generate token
  const token = generateToken(user._id.toString(), user.email);

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
}

/**
 * Login a user
 */
export async function loginUser(data: LoginInput) {
  const { email, password } = data;

  // Find user
  const user = await User.findOne({ email });
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  // Generate token
  const token = generateToken(user._id.toString(), user.email);

  return {
    token,
    user: {
      id: user._id,
      email: user.email,
      createdAt: user.createdAt,
    },
  };
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string) {
  const user = await User.findById(userId);

  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  return {
    id: user._id,
    email: user.email,
    createdAt: user.createdAt,
  };
}
