import { useEffect, useState } from 'react';
import { Plus, Copy, Edit2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useFragmentStore } from '../store/fragmentStore';
import { fragmentService } from '../services';
import { CreateFragmentRequest } from '../types';

export default function FragmentsPage() {
  const { fragments, setFragments, addFragment, updateFragment, removeFragment } =
    useFragmentStore();

  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<CreateFragmentRequest>({
    name: '',
    content: '',
  });

  useEffect(() => {
    loadFragments();
  }, []);

  const loadFragments = async () => {
    setIsLoading(true);
    try {
      const { fragments } = await fragmentService.getFragments();
      setFragments(fragments);
    } catch (error: any) {
      toast.error('Failed to load fragments');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (editingId) {
        const { fragment } = await fragmentService.updateFragment(editingId, formData);
        updateFragment(editingId, fragment);
        toast.success('Fragment updated successfully');
      } else {
        const { fragment } = await fragmentService.createFragment(formData);
        addFragment(fragment);
        toast.success('Fragment created successfully');
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

  const handleEdit = (fragmentId: string) => {
    const fragment = fragments.find((f) => f.id === fragmentId);
    if (fragment) {
      setFormData({
        name: fragment.name,
        content: fragment.content,
      });
      setEditingId(fragmentId);
      setShowModal(true);
    }
  };

  const handleDelete = async (fragmentId: string) => {
    if (!confirm('Are you sure you want to delete this fragment?')) return;

    try {
      await fragmentService.deleteFragment(fragmentId);
      removeFragment(fragmentId);
      toast.success('Fragment deleted successfully');
    } catch (error: any) {
      toast.error('Failed to delete fragment');
    }
  };

  const handleCopy = (name: string) => {
    const fragmentSyntax = `{{fragment:${name}}}`;
    navigator.clipboard.writeText(fragmentSyntax);
    toast.success('Fragment syntax copied!');
  };

  const resetForm = () => {
    setFormData({ name: '', content: '' });
    setEditingId(null);
  };

  const closeModal = () => {
    setShowModal(false);
    resetForm();
  };

  if (isLoading && fragments.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading fragments...</div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-semibold text-gray-900">Fragments</h1>
          <p className="mt-2 text-sm text-gray-700">
            Reusable text snippets that can be inserted into prompts using{' '}
            <code className="bg-gray-100 px-2 py-0.5 rounded">{`{{fragment:name}}`}</code>
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Fragment
          </button>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {fragments.map((fragment) => (
          <div
            key={fragment.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <h3 className="text-lg font-medium text-gray-900 font-mono">{fragment.name}</h3>
              <code className="text-xs bg-gray-100 px-2 py-1 rounded text-gray-600">
                {`{{fragment:${fragment.name}}}`}
              </code>
            </div>

            <p className="mt-3 text-sm text-gray-600 line-clamp-4 whitespace-pre-wrap">
              {fragment.content}
            </p>

            <div className="mt-4 flex space-x-2">
              <button
                onClick={() => handleCopy(fragment.name)}
                className="flex-1 inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                title="Copy syntax"
              >
                <Copy className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleEdit(fragment.id)}
                className="flex-1 inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleDelete(fragment.id)}
                className="flex-1 inline-flex justify-center items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {fragments.length === 0 && !isLoading && (
        <div className="text-center mt-12">
          <p className="text-gray-500">
            No fragments yet. Create reusable text snippets to use in your prompts.
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg px-6 py-6 max-w-2xl w-full mx-4">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {editingId ? 'Edit Fragment' : 'Create New Fragment'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Fragment Name
                </label>
                <input
                  type="text"
                  required
                  pattern="[a-z0-9_-]+"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value.toLowerCase() })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border font-mono"
                  placeholder="professional_tone"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Use only lowercase letters, numbers, hyphens, and underscores
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Content</label>
                <textarea
                  required
                  rows={6}
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 border"
                  placeholder="Enter the reusable text content here..."
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                <p className="text-sm text-blue-800">
                  <strong>Usage:</strong> After creating this fragment, use it in prompts with{' '}
                  <code className="bg-white px-2 py-0.5 rounded">{`{{fragment:${formData.name || 'name'}}}`}</code>
                </p>
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
