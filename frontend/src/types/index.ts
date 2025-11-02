// User types
export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
  message: string;
}

// Account types
export interface Account {
  id: string;
  userId: string;
  name: string;
  type: 'personal' | 'work' | 'custom';
  isActive: boolean;
  createdAt: string;
}

// Prompt types
export interface Prompt {
  id: string;
  userId: string;
  accountId: string;
  title: string;
  content: string;
  category: string;
  tags: string[];
  variables: string[];
  version: number;
  usageCount: number;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptHistory {
  id: string;
  version: number;
  content: string;
  createdAt: string;
}

export interface PromptsResponse {
  prompts: Prompt[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Fragment types
export interface Fragment {
  id: string;
  userId: string;
  name: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// API Request types
export interface RegisterRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateAccountRequest {
  name: string;
  type: 'personal' | 'work' | 'custom';
  apiKey: string;
}

export interface UpdateAccountRequest {
  name?: string;
  type?: 'personal' | 'work' | 'custom';
  apiKey?: string;
}

export interface CreatePromptRequest {
  accountId: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
}

export interface UpdatePromptRequest {
  title?: string;
  content?: string;
  category?: string;
  tags?: string[];
}

export interface QueryPromptsRequest {
  category?: string;
  tags?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface FillVariablesRequest {
  values: Record<string, string>;
}

export interface CreateFragmentRequest {
  name: string;
  content: string;
}

export interface UpdateFragmentRequest {
  name?: string;
  content?: string;
}
