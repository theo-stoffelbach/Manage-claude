import api from './api';
import {
  Account,
  CreateAccountRequest,
  UpdateAccountRequest,
} from '../types';

export const accountService = {
  /**
   * Create a new account
   */
  async createAccount(data: CreateAccountRequest): Promise<{ account: Account; message: string }> {
    const response = await api.post<{ account: Account; message: string }>('/accounts', data);
    return response.data;
  },

  /**
   * Get all accounts
   */
  async getAccounts(): Promise<{ accounts: Account[]; count: number }> {
    const response = await api.get<{ accounts: Account[]; count: number }>('/accounts');
    return response.data;
  },

  /**
   * Get active account
   */
  async getActiveAccount(): Promise<{ account: Account | null }> {
    const response = await api.get<{ account: Account | null }>('/accounts/active');
    return response.data;
  },

  /**
   * Get a specific account
   */
  async getAccount(id: string): Promise<{ account: Account }> {
    const response = await api.get<{ account: Account }>(`/accounts/${id}`);
    return response.data;
  },

  /**
   * Update an account
   */
  async updateAccount(
    id: string,
    data: UpdateAccountRequest
  ): Promise<{ account: Account; message: string }> {
    const response = await api.put<{ account: Account; message: string }>(
      `/accounts/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete an account
   */
  async deleteAccount(id: string): Promise<{ message: string; id: string }> {
    const response = await api.delete<{ message: string; id: string }>(`/accounts/${id}`);
    return response.data;
  },

  /**
   * Set account as active
   */
  async setActiveAccount(id: string): Promise<{ account: Account; message: string }> {
    const response = await api.post<{ account: Account; message: string }>(
      `/accounts/${id}/set-active`
    );
    return response.data;
  },
};
