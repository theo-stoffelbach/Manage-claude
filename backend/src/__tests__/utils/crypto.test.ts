import { encryptApiKey, decryptApiKey } from '../../utils/crypto';

describe('Crypto Utils', () => {
  const testApiKey = 'sk-ant-api03-test-key-12345';

  describe('encryptApiKey', () => {
    it('should encrypt an API key', () => {
      const encrypted = encryptApiKey(testApiKey);
      expect(encrypted).toBeDefined();
      expect(encrypted).not.toBe(testApiKey);
      expect(typeof encrypted).toBe('string');
    });

    it('should throw error for empty API key', () => {
      expect(() => encryptApiKey('')).toThrow('API key cannot be empty');
    });

    it('should produce different encrypted values for same input (due to salt)', () => {
      const encrypted1 = encryptApiKey(testApiKey);
      const encrypted2 = encryptApiKey(testApiKey);
      // AES encryption with random IV produces different outputs
      expect(encrypted1).not.toBe(encrypted2);
    });
  });

  describe('decryptApiKey', () => {
    it('should decrypt an encrypted API key', () => {
      const encrypted = encryptApiKey(testApiKey);
      const decrypted = decryptApiKey(encrypted);
      expect(decrypted).toBe(testApiKey);
    });

    it('should throw error for empty encrypted key', () => {
      expect(() => decryptApiKey('')).toThrow('Encrypted key cannot be empty');
    });

    it('should throw error for invalid encrypted key', () => {
      expect(() => decryptApiKey('invalid-encrypted-data')).toThrow(
        'Failed to decrypt API key'
      );
    });
  });

  describe('round-trip encryption/decryption', () => {
    it('should correctly encrypt and decrypt various API keys', () => {
      const testKeys = [
        'sk-ant-api03-short',
        'sk-ant-api03-with-special-chars-!@#$%^&*()',
        'sk-ant-api03-very-long-key-with-many-characters-1234567890-abcdefghijklmnopqrstuvwxyz',
      ];

      testKeys.forEach((key) => {
        const encrypted = encryptApiKey(key);
        const decrypted = decryptApiKey(encrypted);
        expect(decrypted).toBe(key);
      });
    });
  });
});

