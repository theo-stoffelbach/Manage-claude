import { create } from 'zustand';
import { Fragment } from '../types';

interface FragmentState {
  fragments: Fragment[];
  currentFragment: Fragment | null;
  isLoading: boolean;
  error: string | null;

  setFragments: (fragments: Fragment[]) => void;
  setCurrentFragment: (fragment: Fragment | null) => void;
  addFragment: (fragment: Fragment) => void;
  updateFragment: (id: string, updates: Partial<Fragment>) => void;
  removeFragment: (id: string) => void;

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useFragmentStore = create<FragmentState>((set) => ({
  fragments: [],
  currentFragment: null,
  isLoading: false,
  error: null,

  setFragments: (fragments) => set({ fragments }),

  setCurrentFragment: (fragment) => set({ currentFragment: fragment }),

  addFragment: (fragment) =>
    set((state) => ({
      fragments: [...state.fragments, fragment].sort((a, b) =>
        a.name.localeCompare(b.name)
      ),
    })),

  updateFragment: (id, updates) =>
    set((state) => ({
      fragments: state.fragments
        .map((f) => (f.id === id ? { ...f, ...updates } : f))
        .sort((a, b) => a.name.localeCompare(b.name)),
      currentFragment:
        state.currentFragment?.id === id
          ? { ...state.currentFragment, ...updates }
          : state.currentFragment,
    })),

  removeFragment: (id) =>
    set((state) => ({
      fragments: state.fragments.filter((f) => f.id !== id),
      currentFragment: state.currentFragment?.id === id ? null : state.currentFragment,
    })),

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
