import { Document } from 'mongoose';

// User Types
export interface IUser extends Document {
  _id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

// Account Types
export interface IAccount extends Document {
  _id: string;
  userId: string;
  name: string;
  type: 'personal' | 'work' | 'custom';
  apiKey: string; // Encrypted
  isActive: boolean;
  createdAt: Date;
}

// Prompt Types
export interface IPrompt extends Document {
  _id: string;
  userId: string;
  accountId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[];
  version: number;
  usageCount: number;
  lastUsedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// PromptHistory Types
export interface IPromptHistory extends Document {
  _id: string;
  promptId: string;
  version: number;
  content: string;
  createdAt: Date;
}

// Fragment Types
export interface IFragment extends Document {
  _id: string;
  userId: string;
  name: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Request Extensions
export interface AuthRequest extends Request {
  userId?: string;
}
