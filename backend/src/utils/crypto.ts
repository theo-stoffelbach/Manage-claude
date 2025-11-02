import CryptoJS from 'crypto-js';

const ENCRYPTION_SECRET = process.env.ENCRYPTION_SECRET;

if (!ENCRYPTION_SECRET) {
  throw new Error('ENCRYPTION_SECRET environment variable is not set');
}

/**
 * Encrypts an API key using AES encryption
 * @param apiKey - The plain text API key to encrypt
 * @returns The encrypted API key as a string
 */
export function encryptApiKey(apiKey: string): string {
  if (!apiKey) {
    throw new Error('API key cannot be empty');
  }

  return CryptoJS.AES.encrypt(apiKey, ENCRYPTION_SECRET).toString();
}

/**
 * Decrypts an encrypted API key
 * @param encryptedKey - The encrypted API key
 * @returns The decrypted plain text API key
 */
export function decryptApiKey(encryptedKey: string): string {
  if (!encryptedKey) {
    throw new Error('Encrypted key cannot be empty');
  }

  const bytes = CryptoJS.AES.decrypt(encryptedKey, ENCRYPTION_SECRET);
  const decrypted = bytes.toString(CryptoJS.enc.Utf8);

  if (!decrypted) {
    throw new Error('Failed to decrypt API key');
  }

  return decrypted;
}
