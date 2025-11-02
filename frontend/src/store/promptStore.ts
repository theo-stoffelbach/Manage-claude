import { create } from 'zustand';
import { Prompt } from '../types';

interface PromptState {
  prompts: Prompt[];
  currentPrompt: Prompt | null;
  isLoading: boolean;
  error: string | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalCount: number;

  // Filters
  filters: {
    category?: string;
    tags?: string;
    search?: string;
  };

  setPrompts: (prompts: Prompt[]) => void;
  setCurrentPrompt: (prompt: Prompt | null) => void;
  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (id: string, updates: Partial<Prompt>) => void;
  removePrompt: (id: string) => void;

  setPagination: (page: number, totalPages: number, totalCount: number) => void;
  setFilters: (filters: { category?: string; tags?: string; search?: string }) => void;
  clearFilters: () => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const usePromptStore = create<PromptState>((set) => ({
  prompts: [],
  currentPrompt: null,
  isLoading: false,
  error: null,

  currentPage: 1,
  totalPages: 1,
  totalCount: 0,

  filters: {},

  setPrompts: (prompts) => set({ prompts }),

  setCurrentPrompt: (prompt) => set({ currentPrompt: prompt }),

  addPrompt: (prompt) =>
    set((state) => ({
      prompts: [prompt, ...state.prompts],
    })),

  updatePrompt: (id, updates) =>
    set((state) => ({
      prompts: state.prompts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      currentPrompt:
        state.currentPrompt?.id === id
          ? { ...state.currentPrompt, ...updates }
          : state.currentPrompt,
    })),

  removePrompt: (id) =>
    set((state) => ({
      prompts: state.prompts.filter((p) => p.id !== id),
      currentPrompt: state.currentPrompt?.id === id ? null : state.currentPrompt,
    })),

  setPagination: (page, totalPages, totalCount) =>
    set({ currentPage: page, totalPages, totalCount }),

  setFilters: (filters) => set({ filters }),
  clearFilters: () => set({ filters: {} }),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
