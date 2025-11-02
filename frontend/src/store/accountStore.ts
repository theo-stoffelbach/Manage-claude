import { create } from 'zustand';
import { Account } from '../types';

interface AccountState {
  accounts: Account[];
  activeAccount: Account | null;
  isLoading: boolean;
  error: string | null;

  setAccounts: (accounts: Account[]) => void;
  setActiveAccount: (account: Account | null) => void;
  addAccount: (account: Account) => void;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  removeAccount: (id: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useAccountStore = create<AccountState>((set) => ({
  accounts: [],
  activeAccount: null,
  isLoading: false,
  error: null,

  setAccounts: (accounts) => {
    const active = accounts.find((acc) => acc.isActive) || null;
    set({ accounts, activeAccount: active });
  },

  setActiveAccount: (account) => {
    set({ activeAccount: account });
  },

  addAccount: (account) => {
    set((state) => ({
      accounts: [...state.accounts, account],
      activeAccount: account.isActive ? account : state.activeAccount,
    }));
  },

  updateAccount: (id, updates) => {
    set((state) => {
      const accounts = state.accounts.map((acc) =>
        acc.id === id ? { ...acc, ...updates } : acc
      );
      const activeAccount = updates.isActive
        ? accounts.find((acc) => acc.id === id) || null
        : state.activeAccount;
      return { accounts, activeAccount };
    });
  },

  removeAccount: (id) => {
    set((state) => ({
      accounts: state.accounts.filter((acc) => acc.id !== id),
      activeAccount: state.activeAccount?.id === id ? null : state.activeAccount,
    }));
  },

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  clearError: () => set({ error: null }),
}));
