import api from './api';
import {
  Fragment,
  CreateFragmentRequest,
  UpdateFragmentRequest,
} from '../types';

export const fragmentService = {
  /**
   * Create a new fragment
   */
  async createFragment(
    data: CreateFragmentRequest
  ): Promise<{ fragment: Fragment; message: string }> {
    const response = await api.post<{ fragment: Fragment; message: string }>(
      '/fragments',
      data
    );
    return response.data;
  },

  /**
   * Get all fragments
   */
  async getFragments(): Promise<{ fragments: Fragment[]; count: number }> {
    const response = await api.get<{ fragments: Fragment[]; count: number }>('/fragments');
    return response.data;
  },

  /**
   * Get a specific fragment
   */
  async getFragment(id: string): Promise<{ fragment: Fragment }> {
    const response = await api.get<{ fragment: Fragment }>(`/fragments/${id}`);
    return response.data;
  },

  /**
   * Update a fragment
   */
  async updateFragment(
    id: string,
    data: UpdateFragmentRequest
  ): Promise<{ fragment: Fragment; message: string }> {
    const response = await api.put<{ fragment: Fragment; message: string }>(
      `/fragments/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a fragment
   */
  async deleteFragment(id: string): Promise<{ message: string; id: string }> {
    const response = await api.delete<{ message: string; id: string }>(`/fragments/${id}`);
    return response.data;
  },
};
