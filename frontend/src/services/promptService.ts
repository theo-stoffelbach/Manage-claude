import api from './api';
import {
  Prompt,
  PromptsResponse,
  PromptHistory,
  CreatePromptRequest,
  UpdatePromptRequest,
  QueryPromptsRequest,
  FillVariablesRequest,
} from '../types';

export const promptService = {
  /**
   * Create a new prompt
   */
  async createPrompt(data: CreatePromptRequest): Promise<{ prompt: Prompt; message: string }> {
    const response = await api.post<{ prompt: Prompt; message: string }>('/prompts', data);
    return response.data;
  },

  /**
   * Get prompts with filters and pagination
   */
  async getPrompts(query: QueryPromptsRequest = {}): Promise<PromptsResponse> {
    const response = await api.get<PromptsResponse>('/prompts', { params: query });
    return response.data;
  },

  /**
   * Get a specific prompt
   */
  async getPrompt(id: string): Promise<{ prompt: Prompt }> {
    const response = await api.get<{ prompt: Prompt }>(`/prompts/${id}`);
    return response.data;
  },

  /**
   * Update a prompt
   */
  async updatePrompt(
    id: string,
    data: UpdatePromptRequest
  ): Promise<{ prompt: Prompt; message: string }> {
    const response = await api.put<{ prompt: Prompt; message: string }>(
      `/prompts/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a prompt
   */
  async deletePrompt(id: string): Promise<{ message: string; id: string }> {
    const response = await api.delete<{ message: string; id: string }>(`/prompts/${id}`);
    return response.data;
  },

  /**
   * Get prompt version history
   */
  async getPromptHistory(id: string): Promise<{
    promptId: string;
    currentVersion: number;
    history: PromptHistory[];
  }> {
    const response = await api.get<{
      promptId: string;
      currentVersion: number;
      history: PromptHistory[];
    }>(`/prompts/${id}/history`);
    return response.data;
  },

  /**
   * Restore a specific version
   */
  async restorePromptVersion(
    id: string,
    version: number
  ): Promise<{ prompt: Prompt; message: string }> {
    const response = await api.post<{ prompt: Prompt; message: string }>(
      `/prompts/${id}/restore`,
      { version }
    );
    return response.data;
  },

  /**
   * Fill variables in a prompt
   */
  async fillPromptVariables(
    id: string,
    data: FillVariablesRequest
  ): Promise<{
    originalContent: string;
    filledContent: string;
    variables: string[];
    usedFragments: string[];
  }> {
    const response = await api.post<{
      originalContent: string;
      filledContent: string;
      variables: string[];
      usedFragments: string[];
    }>(`/prompts/${id}/fill`, data);
    return response.data;
  },
};
