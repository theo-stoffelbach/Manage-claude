import { z } from 'zod';

// ========== Auth Schemas ==========

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password too long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ========== Account Schemas ==========

export const createAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100, 'Name too long'),
  type: z.enum(['personal', 'work', 'custom']).default('personal'),
  apiKey: z.string().min(1, 'API key is required'),
});

export const updateAccountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100, 'Name too long').optional(),
  type: z.enum(['personal', 'work', 'custom']).optional(),
  apiKey: z.string().min(1, 'API key is required').optional(),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export type UpdateAccountInput = z.infer<typeof updateAccountSchema>;

// ========== Prompt Schemas ==========

export const createPromptSchema = z.object({
  accountId: z.string().min(1, 'Account ID is required'),
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  content: z.string().min(1, 'Content is required'),
  category: z.string().max(50, 'Category too long').default('general'),
  tags: z.array(z.string().max(30)).default([]),
});

export const updatePromptSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  content: z.string().min(1, 'Content is required').optional(),
  category: z.string().max(50, 'Category too long').optional(),
  tags: z.array(z.string().max(30)).optional(),
});

export const queryPromptsSchema = z.object({
  category: z.string().optional(),
  tags: z.string().optional(), // Comma-separated tags
  search: z.string().optional(),
  page: z.string().optional().transform(Number).default('1'),
  limit: z.string().optional().transform(Number).default('20'),
});

export const fillVariablesSchema = z.object({
  values: z.record(z.string(), z.string()),
});

export const restoreVersionSchema = z.object({
  version: z.number().int().positive(),
});

export type CreatePromptInput = z.infer<typeof createPromptSchema>;
export type UpdatePromptInput = z.infer<typeof updatePromptSchema>;
export type QueryPromptsInput = z.infer<typeof queryPromptsSchema>;
export type FillVariablesInput = z.infer<typeof fillVariablesSchema>;
export type RestoreVersionInput = z.infer<typeof restoreVersionSchema>;

// ========== Fragment Schemas ==========

export const createFragmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Fragment name is required')
    .max(50, 'Name too long')
    .regex(/^[a-z0-9_-]+$/, 'Name must contain only lowercase letters, numbers, hyphens, and underscores'),
  content: z.string().min(1, 'Content is required'),
});

export const updateFragmentSchema = z.object({
  name: z
    .string()
    .min(1, 'Fragment name is required')
    .max(50, 'Name too long')
    .regex(/^[a-z0-9_-]+$/, 'Name must contain only lowercase letters, numbers, hyphens, and underscores')
    .optional(),
  content: z.string().min(1, 'Content is required').optional(),
});

export type CreateFragmentInput = z.infer<typeof createFragmentSchema>;
export type UpdateFragmentInput = z.infer<typeof updateFragmentSchema>;
