import { useEffect, useState } from 'react';
import { Plus, Trash2, Check, Edit2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAccountStore } from '../store/accountStore';
import { accountService } from '../services';
import { CreateAccountRequest, UpdateAccountRequest } from '../types';

export default function AccountsPage() {
  const { accounts, activeAccount, setAccounts, addAccount, updateAccount, removeAccount } =
    useAccountStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateAccountRequest>({
    name: '',
    type: 'personal',
    apiKey: '',
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setIsLoading(true);
    try {
      const { accounts } = await accountService.getAccounts();
      setAccounts(accounts);
    } catch (error: any) {
      toast.error('Failed to load accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingId) {
        const { account } = await accountService.updateAccount(editingId, formData);
        updateAccount(editingId, account);
        toast.success('Account updated successfully');
      } else {
        const { account } = await accountService.createAccount(formData);
        addAccount(account);
        toast.success('Account created successfully');
      }
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      const message = error.response?.data?.error || 'Operation failed';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId);
    if (account) {
      setFormData({
        name: account.name,
        type: account.type,
        apiKey: '',
      });
      setEditingId(accountId);
      setShowModal(true);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this account?')) return;

    try {
      await accountService.deleteAccount(accountId);
      removeAccount(accountId);
      toast.success('Account deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete account');
    }
  };

  const handleSetActive = async (accountId: string) => {
    try {
      const { account } = await accountService.setActiveAccount(accountId);
      // Update all accounts - deactivate others
      setAccounts(
        accounts.map((a) => ({
          ...a,
          isActive: a.id === accountId,
        }))
      );
      toast.success('Account activated successfully');
    } catch (error: any) {
      toast.error('Failed to activate account');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', type: 'personal', apiKey: '' });
    setEditingId(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (isLoading && accounts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Claude Accounts</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your Claude API accounts. The active account will be used for prompt operations.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Account
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <div
            key={account.id}
            className={`relative rounded-lg border-2 ${
              account.isActive
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-200 bg-white'
            } px-6 py-5 shadow-sm hover:border-gray-400`}
          >
            {account.isActive && (
              <div className="absolute top-2 right-2">
                <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                  <Check className="h-3 w-3 mr-1" />
                  Active
                </span>
              </div>
            )}

            <div className="mt-2">
              <h3 className="text-lg font-medium text-gray-900">{account.name}</h3>
              <p className="mt-1 text-sm text-gray-500 capitalize">{account.type}</p>
            </div>

            <div className="mt-4 flex space-x-2">
              {!account.isActive && (
                <button
                  onClick={() => handleSetActive(account.id)}
                  className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                >
                  Set Active
                </button>
              )}
              <button
                onClick={() => handleEdit(account.id)}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(account.id)}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {accounts.length === 0 && (
        <div className="text-center mt-12">
          <p className="text-gray-500">No accounts yet. Create your first Claude account to get started.</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-6 py-6 max-w-md w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingId ? 'Edit Account' : 'Add New Account'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Account Name
                </label>
                <input
                  type="text"
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="My Claude Account"
                />
              </div>

              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <select
                  id="type"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      type: e.target.value as 'personal' | 'work' | 'custom',
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                >
                  <option value="personal">Personal</option>
                  <option value="work">Work</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700">
                  API Key {editingId && '(leave empty to keep current)'}
                </label>
                <input
                  type="password"
                  id="apiKey"
                  required={!editingId}
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="sk-ant-..."
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isLoading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
