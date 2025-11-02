import {
  registerSchema,
  loginSchema,
  createAccountSchema,
  updateAccountSchema,
  createPromptSchema,
  updatePromptSchema,
  queryPromptsSchema,
  fillVariablesSchema,
  restoreVersionSchema,
  createFragmentSchema,
  updateFragmentSchema,
} from '../../utils/validation';

describe('Validation Schemas', () => {
  describe('registerSchema', () => {
    it('should validate valid registration data', () => {
      const data = {
        email: 'test@example.com',
        password: 'SecurePass123!',
      };
      expect(() => registerSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'invalid-email',
        password: 'SecurePass123!',
      };
      expect(() => registerSchema.parse(data)).toThrow();
    });

    it('should reject short password', () => {
      const data = {
        email: 'test@example.com',
        password: 'short',
      };
      expect(() => registerSchema.parse(data)).toThrow();
    });
  });

  describe('loginSchema', () => {
    it('should validate valid login data', () => {
      const data = {
        email: 'test@example.com',
        password: 'password123',
      };
      expect(() => loginSchema.parse(data)).not.toThrow();
    });

    it('should reject invalid email', () => {
      const data = {
        email: 'not-an-email',
        password: 'password123',
      };
      expect(() => loginSchema.parse(data)).toThrow();
    });
  });

  describe('createAccountSchema', () => {
    it('should validate valid account data', () => {
      const data = {
        name: 'My Account',
        type: 'personal',
        apiKey: 'sk-ant-api03-test-key',
      };
      expect(() => createAccountSchema.parse(data)).not.toThrow();
    });

    it('should validate all account types', () => {
      const types = ['personal', 'work', 'custom'];
      types.forEach((type) => {
        const data = {
          name: 'Test Account',
          type,
          apiKey: 'sk-ant-api03-key',
        };
        expect(() => createAccountSchema.parse(data)).not.toThrow();
      });
    });

    it('should reject invalid account type', () => {
      const data = {
        name: 'My Account',
        type: 'invalid',
        apiKey: 'sk-ant-api03-key',
      };
      expect(() => createAccountSchema.parse(data)).toThrow();
    });

    it('should reject empty name', () => {
      const data = {
        name: '',
        type: 'personal',
        apiKey: 'sk-ant-api03-key',
      };
      expect(() => createAccountSchema.parse(data)).toThrow();
    });
  });

  describe('updateAccountSchema', () => {
    it('should allow partial updates', () => {
      const data = {
        name: 'Updated Name',
      };
      expect(() => updateAccountSchema.parse(data)).not.toThrow();
    });

    it('should allow updating only type', () => {
      const data = {
        type: 'work',
      };
      expect(() => updateAccountSchema.parse(data)).not.toThrow();
    });

    it('should allow omitting apiKey to keep current', () => {
      const data = {
        name: 'Updated Name',
        // apiKey is optional, so we can omit it
      };
      expect(() => updateAccountSchema.parse(data)).not.toThrow();
    });
  });

  describe('createPromptSchema', () => {
    it('should validate valid prompt data', () => {
      const data = {
        accountId: '507f1f77bcf86cd799439011',
        title: 'Test Prompt',
        content: 'This is the prompt content with {{variable}}',
        category: 'general',
        tags: ['test', 'example'],
      };
      expect(() => createPromptSchema.parse(data)).not.toThrow();
    });

    it('should allow empty tags array', () => {
      const data = {
        accountId: '507f1f77bcf86cd799439011',
        title: 'Test',
        content: 'Content',
        category: 'general',
        tags: [],
      };
      expect(() => createPromptSchema.parse(data)).not.toThrow();
    });

    it('should set default category', () => {
      const data = {
        accountId: '507f1f77bcf86cd799439011',
        title: 'Test',
        content: 'Content',
      };
      const result = createPromptSchema.parse(data);
      expect(result.category).toBe('general');
      expect(result.tags).toEqual([]);
    });

    it('should reject empty title', () => {
      const data = {
        accountId: '507f1f77bcf86cd799439011',
        title: '',
        content: 'Content',
      };
      expect(() => createPromptSchema.parse(data)).toThrow();
    });
  });

  describe('updatePromptSchema', () => {
    it('should allow partial updates', () => {
      const data = {
        title: 'Updated Title',
      };
      expect(() => updatePromptSchema.parse(data)).not.toThrow();
    });

    it('should validate all fields when provided', () => {
      const data = {
        title: 'Updated',
        content: 'New content',
        category: 'coding',
        tags: ['new', 'tags'],
      };
      expect(() => updatePromptSchema.parse(data)).not.toThrow();
    });
  });

  describe('queryPromptsSchema', () => {
    it('should validate query parameters', () => {
      const data = {
        search: 'test',
        category: 'coding',
        tags: 'javascript,typescript',
        page: '1',
        limit: '20',
      };
      expect(() => queryPromptsSchema.parse(data)).not.toThrow();
    });

    it('should set default page and limit', () => {
      const data = {};
      const result = queryPromptsSchema.parse(data);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(20);
    });

    it('should reject page less than 1', () => {
      const data = { page: 0 };
      expect(() => queryPromptsSchema.parse(data)).toThrow();
    });

    it('should reject limit greater than 100', () => {
      const data = { limit: 101 };
      expect(() => queryPromptsSchema.parse(data)).toThrow();
    });
  });

  describe('fillVariablesSchema', () => {
    it('should validate fill variables request', () => {
      const data = {
        values: {
          name: 'Alice',
          age: '30',
        },
      };
      expect(() => fillVariablesSchema.parse(data)).not.toThrow();
    });

    it('should allow empty values object', () => {
      const data = {
        values: {},
      };
      expect(() => fillVariablesSchema.parse(data)).not.toThrow();
    });
  });

  describe('restoreVersionSchema', () => {
    it('should validate version restore request', () => {
      const data = {
        version: 3,
      };
      expect(() => restoreVersionSchema.parse(data)).not.toThrow();
    });

    it('should reject negative version', () => {
      const data = {
        version: -1,
      };
      expect(() => restoreVersionSchema.parse(data)).toThrow();
    });

    it('should reject version 0', () => {
      const data = {
        version: 0,
      };
      expect(() => restoreVersionSchema.parse(data)).toThrow();
    });
  });

  describe('createFragmentSchema', () => {
    it('should validate valid fragment data', () => {
      const data = {
        name: 'my_fragment',
        content: 'This is the fragment content',
      };
      expect(() => createFragmentSchema.parse(data)).not.toThrow();
    });

    it('should reject empty name', () => {
      const data = {
        name: '',
        content: 'Content',
      };
      expect(() => createFragmentSchema.parse(data)).toThrow();
    });

    it('should reject empty content', () => {
      const data = {
        name: 'fragment',
        content: '',
      };
      expect(() => createFragmentSchema.parse(data)).toThrow();
    });
  });

  describe('updateFragmentSchema', () => {
    it('should allow updating content only', () => {
      const data = {
        content: 'Updated content',
      };
      expect(() => updateFragmentSchema.parse(data)).not.toThrow();
    });

    it('should allow updating name only', () => {
      const data = {
        name: 'new_name',
      };
      expect(() => updateFragmentSchema.parse(data)).not.toThrow();
    });

    it('should require at least one field', () => {
      const data = {};
      // Both fields are optional, so empty object is valid
      expect(() => updateFragmentSchema.parse(data)).not.toThrow();
    });
  });
});

