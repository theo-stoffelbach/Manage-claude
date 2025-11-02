import { useEffect, useState } from 'react';
import { Plus, Search, Filter, Copy, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { usePromptStore } from '../store/promptStore';
import { useAccountStore } from '../store/accountStore';
import { promptService, accountService } from '../services';
import { CreatePromptRequest } from '../types';

export default function PromptsPage() {
  const {
    prompts,
    filters,
    currentPage,
    totalPages,
    setPrompts,
    setPagination,
    setFilters,
    addPrompt,
    updatePrompt,
    removePrompt,
  } = usePromptStore();

  const { activeAccount, setAccounts } = useAccountStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTags] = useState('');

  const [formData, setFormData] = useState<CreatePromptRequest>({
    accountId: '',
    title: '',
    content: '',
    category: 'general',
    tags: [],
  });

  useEffect(() => {
    loadAccounts();
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [filters, currentPage]);

  const loadAccounts = async () => {
    try {
      const { accounts } = await accountService.getAccounts();
      setAccounts(accounts);
    } catch (error) {
      toast.error('Failed to load accounts');
    }
  };

  const loadPrompts = async () => {
    setIsLoading(true);
    try {
      const response = await promptService.getPrompts({
        ...filters,
        page: currentPage,
        limit: 12,
      });
      setPrompts(response.prompts);
      setPagination(
        response.pagination.page,
        response.pagination.totalPages,
        response.pagination.total
      );
    } catch (error: any) {
      toast.error('Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    setFilters({
      search: searchTerm || undefined,
      category: selectedCategory || undefined,
      tags: selectedTags || undefined,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.accountId && !activeAccount) {
      toast.error('Please create an account first');
      return;
    }

    const dataToSend = {
      ...formData,
      accountId: formData.accountId || activeAccount!.id,
    };

    setIsLoading(true);

    try {
      if (editingId) {
        const { prompt } = await promptService.updatePrompt(editingId, {
          title: formData.title,
          content: formData.content,
          category: formData.category,
          tags: formData.tags,
        });
        updatePrompt(editingId, prompt);
        toast.success('Prompt updated successfully');
      } else {
        const { prompt } = await promptService.createPrompt(dataToSend);
        addPrompt(prompt);
        toast.success('Prompt created successfully');
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

  const handleEdit = (promptId: string) => {
    const prompt = prompts.find((p) => p.id === promptId);
    if (prompt) {
      setFormData({
        accountId: prompt.accountId,
        title: prompt.title,
        content: prompt.content,
        category: prompt.category,
        tags: prompt.tags,
      });
      setEditingId(promptId);
      setShowModal(true);
    }
  };

  const handleDelete = async (promptId: string) => {
    if (!confirm('Are you sure you want to delete this prompt?')) return;

    try {
      await promptService.deletePrompt(promptId);
      removePrompt(promptId);
      toast.success('Prompt deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete prompt');
    }
  };

  const handleCopy = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Copied to clipboard!');
  };

  const resetForm = () => {
    setFormData({
      accountId: activeAccount?.id || '',
      title: '',
      content: '',
      category: 'general',
      tags: [],
    });
    setEditingId(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (isLoading && prompts.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading prompts...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Prompt Library</h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage your Claude prompts with variables and version history.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Prompt
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="sm:col-span-2">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
          </div>
        </div>
        <div>
          <input
            type="text"
            placeholder="Category"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
        <div>
          <button
            onClick={handleSearch}
            className="w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Filter className="h-4 w-4 mr-2" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Prompts Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900 truncate flex-1">
                {prompt.title}
              </h3>
              <span className="inline-flex items-center rounded-full bg-indigo-100 px-2.5 py-0.5 text-xs font-medium text-indigo-800">
                v{prompt.version}
              </span>
            </div>

            <p className="mt-2 text-sm text-gray-500 line-clamp-3">{prompt.content}</p>

            <div className="mt-4">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                {prompt.category}
              </span>
              {prompt.variables.length > 0 && (
                <span className="ml-2 text-xs text-gray-500">
                  {prompt.variables.length} variable(s)
                </span>
              )}
            </div>

            {prompt.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {prompt.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleCopy(prompt.content)}
                className="flex-1 inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEdit(prompt.id)}
                className="flex-1 inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(prompt.id)}
                className="flex-1 inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {prompts.length === 0 && !isLoading && (
        <div className="text-center mt-12">
          <p className="text-gray-500">No prompts yet. Create your first prompt to get started.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <nav className="flex items-center space-x-2">
            <button
              onClick={() => setPagination(currentPage - 1, totalPages, 0)}
              disabled={currentPage === 1}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setPagination(currentPage + 1, totalPages, 0)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </nav>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg px-6 py-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingId ? 'Edit Prompt' : 'Create New Prompt'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="My Prompt Title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  required
                  rows={8}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="Enter your prompt here. Use {{variable}} for variables and {{fragment:name}} for fragments."
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use `{`{{variable}}`}` for variables and `{`{{fragment:name}}`}` for fragments
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Category</label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="general"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags?.join(', ')}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tags: e.target.value.split(',').map((t) => t.trim()).filter(Boolean),
                      })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                    placeholder="coding, api, documentation"
                  />
                </div>
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
