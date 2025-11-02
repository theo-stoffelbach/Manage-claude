import { Account } from '../models';
import { encryptApiKey, decryptApiKey } from '../utils/crypto';
import { CreateAccountInput, UpdateAccountInput } from '../utils/validation';
import { ValidationError, NotFoundError } from '../middleware/errorHandler';

/**
 * Create a new account for a user
 */
export async function createAccount(userId: string, data: CreateAccountInput) {
  const { name, type, apiKey } = data;

  // Encrypt API key before storing
  const encryptedApiKey = encryptApiKey(apiKey);

  // If this is set as active, we need to deactivate others
  // By default, first account is active
  const accountCount = await Account.countDocuments({ userId });
  const isActive = accountCount === 0;

  const account = await Account.create({
    userId,
    name,
    type,
    apiKey: encryptedApiKey,
    isActive,
  });

  return {
    id: account._id,
    userId: account.userId,
    name: account.name,
    type: account.type,
    isActive: account.isActive,
    createdAt: account.createdAt,
  };
}

/**
 * Get all accounts for a user
 */
export async function getAccountsByUserId(userId: string) {
  const accounts = await Account.find({ userId }).sort({ createdAt: -1 });

  return accounts.map((account) => ({
    id: account._id,
    userId: account.userId,
    name: account.name,
    type: account.type,
    isActive: account.isActive,
    createdAt: account.createdAt,
  }));
}

/**
 * Get a specific account by ID
 */
export async function getAccountById(accountId: string, userId: string) {
  const account = await Account.findOne({ _id: accountId, userId });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  return {
    id: account._id,
    userId: account.userId,
    name: account.name,
    type: account.type,
    isActive: account.isActive,
    createdAt: account.createdAt,
  };
}

/**
 * Update an account
 */
export async function updateAccount(
  accountId: string,
  userId: string,
  data: UpdateAccountInput
) {
  const account = await Account.findOne({ _id: accountId, userId });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  // Update fields
  if (data.name !== undefined) {
    account.name = data.name;
  }
  if (data.type !== undefined) {
    account.type = data.type;
  }
  if (data.apiKey !== undefined) {
    // Encrypt new API key
    account.apiKey = encryptApiKey(data.apiKey);
  }

  await account.save();

  return {
    id: account._id,
    userId: account.userId,
    name: account.name,
    type: account.type,
    isActive: account.isActive,
    createdAt: account.createdAt,
  };
}

/**
 * Delete an account
 */
export async function deleteAccount(accountId: string, userId: string) {
  const account = await Account.findOne({ _id: accountId, userId });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  // If deleting active account, activate another one
  if (account.isActive) {
    const otherAccount = await Account.findOne({
      userId,
      _id: { $ne: accountId },
    }).sort({ createdAt: 1 });

    if (otherAccount) {
      otherAccount.isActive = true;
      await otherAccount.save();
    }
  }

  await Account.deleteOne({ _id: accountId });

  return {
    message: 'Account deleted successfully',
    id: accountId,
  };
}

/**
 * Set an account as active
 */
export async function setActiveAccount(accountId: string, userId: string) {
  const account = await Account.findOne({ _id: accountId, userId });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  if (account.isActive) {
    throw new ValidationError('Account is already active');
  }

  // Deactivate all other accounts
  await Account.updateMany({ userId, _id: { $ne: accountId } }, { isActive: false });

  // Activate this account
  account.isActive = true;
  await account.save();

  return {
    id: account._id,
    userId: account.userId,
    name: account.name,
    type: account.type,
    isActive: account.isActive,
    createdAt: account.createdAt,
  };
}

/**
 * Get active account for a user
 */
export async function getActiveAccount(userId: string) {
  const account = await Account.findOne({ userId, isActive: true });

  if (!account) {
    return null;
  }

  return {
    id: account._id,
    userId: account.userId,
    name: account.name,
    type: account.type,
    isActive: account.isActive,
    createdAt: account.createdAt,
  };
}

/**
 * Get decrypted API key for an account (internal use only)
 * NEVER expose this to the client
 */
export async function getDecryptedApiKey(accountId: string, userId: string): Promise<string> {
  const account = await Account.findOne({ _id: accountId, userId });

  if (!account) {
    throw new NotFoundError('Account not found');
  }

  return decryptApiKey(account.apiKey);
}
