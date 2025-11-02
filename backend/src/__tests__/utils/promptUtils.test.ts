import {
  extractVariables,
  extractFragmentReferences,
  fillVariables,
  replaceFragments,
} from '../../utils/promptUtils';

describe('Prompt Utils', () => {
  describe('extractVariables', () => {
    it('should extract variables from prompt content', () => {
      const content = 'Hello {{name}}, your age is {{age}}';
      const variables = extractVariables(content);
      expect(variables).toEqual(['name', 'age']);
    });

    it('should handle prompts with no variables', () => {
      const content = 'This is a simple prompt with no variables';
      const variables = extractVariables(content);
      expect(variables).toEqual([]);
    });

    it('should handle duplicate variables', () => {
      const content = 'Hello {{name}}, nice to meet you {{name}}!';
      const variables = extractVariables(content);
      expect(variables).toEqual(['name']);
    });

    it('should handle variables with underscores and numbers', () => {
      const content = '{{user_name}} and {{var123}} and {{_private}}';
      const variables = extractVariables(content);
      expect(variables).toEqual(['user_name', 'var123', '_private']);
    });

    it('should ignore fragment references', () => {
      const content = 'Variable: {{name}}, Fragment: {{fragment:intro}}';
      const variables = extractVariables(content);
      expect(variables).toEqual(['name']);
    });
  });

  describe('extractFragmentReferences', () => {
    it('should extract fragment references from content', () => {
      const content = 'Start {{fragment:intro}} middle {{fragment:conclusion}} end';
      const fragments = extractFragmentReferences(content);
      expect(fragments).toEqual(['intro', 'conclusion']);
    });

    it('should handle content with no fragments', () => {
      const content = 'Just a regular prompt with {{variable}}';
      const fragments = extractFragmentReferences(content);
      expect(fragments).toEqual([]);
    });

    it('should handle duplicate fragment references', () => {
      const content = '{{fragment:common}} text {{fragment:common}}';
      const fragments = extractFragmentReferences(content);
      expect(fragments).toEqual(['common']);
    });

    it('should handle fragments with underscores', () => {
      const content = '{{fragment:my_fragment}} and {{fragment:another_fragment}}';
      const fragments = extractFragmentReferences(content);
      expect(fragments).toEqual(['my_fragment', 'another_fragment']);
    });
  });

  describe('fillVariables', () => {
    it('should fill variables with provided values', () => {
      const content = 'Hello {{name}}, you are {{age}} years old';
      const variables = { name: 'Alice', age: '30' };
      const result = fillVariables(content, variables);
      expect(result).toBe('Hello Alice, you are 30 years old');
    });

    it('should leave unfilled variables as is when not provided', () => {
      const content = 'Hello {{name}}, you are {{age}} years old';
      const variables = { name: 'Bob' };
      const result = fillVariables(content, variables);
      expect(result).toBe('Hello Bob, you are {{age}} years old');
    });

    it('should handle empty variables object', () => {
      const content = 'Hello {{name}}';
      const variables = {};
      const result = fillVariables(content, variables);
      expect(result).toBe('Hello {{name}}');
    });

    it('should handle content with no variables', () => {
      const content = 'Plain text content';
      const variables = { unused: 'value' };
      const result = fillVariables(content, variables);
      expect(result).toBe('Plain text content');
    });

    it('should handle special characters in variable values', () => {
      const content = 'Message: {{msg}}';
      const variables = { msg: 'Hello $100 & <special> chars!' };
      const result = fillVariables(content, variables);
      expect(result).toBe('Message: Hello $100 & <special> chars!');
    });
  });

  describe('replaceFragments', () => {
    it('should replace fragment references with content', () => {
      const content = 'Start {{fragment:intro}} end';
      const fragments = { intro: 'This is the introduction' };
      const result = replaceFragments(content, fragments);
      expect(result).toBe('Start This is the introduction end');
    });

    it('should handle multiple fragments', () => {
      const content = '{{fragment:header}} body {{fragment:footer}}';
      const fragments = {
        header: 'HEADER',
        footer: 'FOOTER',
      };
      const result = replaceFragments(content, fragments);
      expect(result).toBe('HEADER body FOOTER');
    });

    it('should leave unreplaced fragments as is', () => {
      const content = '{{fragment:intro}} {{fragment:outro}}';
      const fragments = { intro: 'START' };
      const result = replaceFragments(content, fragments);
      expect(result).toBe('START {{fragment:outro}}');
    });

    it('should handle content with no fragments', () => {
      const content = 'No fragments here';
      const fragments = { unused: 'value' };
      const result = replaceFragments(content, fragments);
      expect(result).toBe('No fragments here');
    });

    it('should handle empty fragments object', () => {
      const content = '{{fragment:test}}';
      const fragments = {};
      const result = replaceFragments(content, fragments);
      expect(result).toBe('{{fragment:test}}');
    });

    it('should replace multiple instances of same fragment', () => {
      const content = '{{fragment:common}} middle {{fragment:common}}';
      const fragments = { common: 'REPLACED' };
      const result = replaceFragments(content, fragments);
      expect(result).toBe('REPLACED middle REPLACED');
    });
  });

  describe('combined operations', () => {
    it('should handle content with both variables and fragments', () => {
      let content = 'Hello {{name}}, {{fragment:intro}}';
      
      // First replace fragments
      const fragments = { intro: 'welcome to the system' };
      content = replaceFragments(content, fragments);
      expect(content).toBe('Hello {{name}}, welcome to the system');

      // Then fill variables
      const variables = { name: 'Alice' };
      content = fillVariables(content, variables);
      expect(content).toBe('Hello Alice, welcome to the system');
    });

    it('should extract both variables and fragments correctly', () => {
      const content = '{{variable1}} text {{fragment:frag1}} more {{variable2}} {{fragment:frag2}}';
      
      const vars = extractVariables(content);
      expect(vars).toEqual(['variable1', 'variable2']);

      const frags = extractFragmentReferences(content);
      expect(frags).toEqual(['frag1', 'frag2']);
    });
  });
});

