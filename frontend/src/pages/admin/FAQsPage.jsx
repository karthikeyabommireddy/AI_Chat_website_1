import { useState, useEffect, useCallback } from 'react';
import { 
  HelpCircle, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X,
  Loader2,
  CheckCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

const FAQsPage = () => {
  const [faqs, setFaqs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingFaq, setEditingFaq] = useState(null);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchFaqs = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...(searchQuery && { search: searchQuery }),
        ...(selectedCategory !== 'all' && { category: selectedCategory }),
      });
      
      const { data } = await api.get(`/faqs/admin/all?${params}`);
      setFaqs(data.data.faqs || []);
      setPagination(data.data.pagination || { page: 1, totalPages: 1 });
      
      // Extract unique categories
      const uniqueCategories = [...new Set((data.data.faqs || []).map(f => f.category).filter(Boolean))];
      setCategories(uniqueCategories);
    } catch (err) {
      toast.error('Failed to load FAQs');
      setFaqs([]);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, searchQuery, selectedCategory]);

  useEffect(() => {
    fetchFaqs();
  }, [fetchFaqs]);

  const handleCreate = () => {
    setEditingFaq(null);
    setShowModal(true);
  };

  const handleEdit = (faq) => {
    setEditingFaq(faq);
    setShowModal(true);
  };

  const handleDelete = async (faqId) => {
    if (!window.confirm('Are you sure you want to delete this FAQ?')) return;

    try {
      await api.delete(`/faqs/${faqId}`);
      toast.success('FAQ deleted');
      fetchFaqs();
    } catch (err) {
      toast.error('Failed to delete FAQ');
    }
  };

  const handleToggleStatus = async (faq) => {
    try {
      await api.put(`/faqs/${faq._id}`, {
        isActive: !faq.isActive,
      });
      toast.success('Status updated');
      fetchFaqs();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSave = async (faqData) => {
    try {
      if (editingFaq) {
        await api.put(`/faqs/${editingFaq._id}`, faqData);
        toast.success('FAQ updated');
      } else {
        await api.post('/faqs', faqData);
        toast.success('FAQ created');
      }
      setShowModal(false);
      fetchFaqs();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save FAQ');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">FAQs</h1>
          <p className="text-secondary-400 mt-1">
            Manage frequently asked questions
          </p>
        </div>
        <button onClick={handleCreate} className="btn-primary gap-2">
          <Plus className="w-5 h-5" />
          Add FAQ
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="input max-w-[200px]"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* FAQs List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        ) : faqs.length === 0 ? (
          <div className="card text-center py-12">
            <HelpCircle className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No FAQs yet</h3>
            <p className="text-secondary-400 mb-4">
              Add frequently asked questions to help users
            </p>
            <button onClick={handleCreate} className="btn-primary">
              Add FAQ
            </button>
          </div>
        ) : (
          faqs.map((faq) => (
            <div key={faq._id} className="card">
              <div className="flex items-start gap-4">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq._id ? null : faq._id)}
                  className="p-2 hover:bg-secondary-700 rounded-lg mt-1"
                >
                  {expandedFaq === faq._id ? (
                    <ChevronUp className="w-5 h-5 text-secondary-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-secondary-400" />
                  )}
                </button>

                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-medium text-white">{faq.question}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        {faq.category && (
                          <span className="px-2 py-1 text-xs bg-primary-500/10 text-primary-400 rounded">
                            {faq.category}
                          </span>
                        )}
                        <span className={`px-2 py-1 text-xs rounded ${
                          faq.isActive
                            ? 'bg-green-500/10 text-green-400'
                            : 'bg-secondary-500/10 text-secondary-400'
                        }`}>
                          {faq.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="text-xs text-secondary-500">
                          {formatDate(faq.createdAt)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleStatus(faq)}
                        className={`p-2 hover:bg-secondary-700 rounded-lg ${
                          faq.isActive ? 'text-green-400' : 'text-secondary-400'
                        }`}
                        title={faq.isActive ? 'Deactivate' : 'Activate'}
                      >
                        <CheckCircle className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleEdit(faq)}
                        className="p-2 hover:bg-secondary-700 rounded-lg text-secondary-400 hover:text-white"
                        title="Edit"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(faq._id)}
                        className="p-2 hover:bg-secondary-700 rounded-lg text-secondary-400 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  {expandedFaq === faq._id && (
                    <div className="mt-4 p-4 bg-secondary-800 rounded-lg">
                      <p className="text-secondary-300 whitespace-pre-wrap">{faq.answer}</p>
                      {faq.tags && faq.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-4">
                          {faq.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-secondary-700 text-secondary-300 rounded"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-secondary-400">
            Page {pagination.page} of {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Previous
            </button>
            <button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.totalPages}
              className="btn-secondary px-3 py-1.5 text-sm disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <FAQModal
          faq={editingFaq}
          categories={categories}
          onClose={() => setShowModal(false)}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

// FAQ Modal Component
const FAQModal = ({ faq, categories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    question: faq?.question || '',
    answer: faq?.answer || '',
    category: faq?.category || '',
    tags: faq?.tags?.join(', ') || '',
    isActive: faq?.isActive ?? true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.question.trim()) newErrors.question = 'Question is required';
    if (!formData.answer.trim()) newErrors.answer = 'Answer is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await onSave({
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
    });
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary-900 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-secondary-800">
          <h2 className="text-xl font-semibold text-white">
            {faq ? 'Edit FAQ' : 'Add FAQ'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary-800 rounded-lg">
            <X className="w-5 h-5 text-secondary-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="label">Question *</label>
            <input
              type="text"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              className={`input ${errors.question ? 'border-red-500' : ''}`}
              placeholder="Enter the question"
            />
            {errors.question && (
              <p className="text-red-400 text-sm mt-1">{errors.question}</p>
            )}
          </div>

          <div>
            <label className="label">Answer *</label>
            <textarea
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              rows={5}
              className={`input resize-none ${errors.answer ? 'border-red-500' : ''}`}
              placeholder="Enter the answer"
            />
            {errors.answer && (
              <p className="text-red-400 text-sm mt-1">{errors.answer}</p>
            )}
          </div>

          <div>
            <label className="label">Category</label>
            <input
              type="text"
              list="categories"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="input"
              placeholder="Select or enter category"
            />
            <datalist id="categories">
              {categories.map((cat) => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>

          <div>
            <label className="label">Tags (comma-separated)</label>
            <input
              type="text"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="input"
              placeholder="e.g., billing, account, support"
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="w-4 h-4 rounded border-secondary-600 bg-secondary-800 text-primary-600"
            />
            <label htmlFor="isActive" className="text-sm text-secondary-300">
              Active (visible to AI)
            </label>
          </div>
        </form>

        <div className="flex justify-end gap-3 p-6 border-t border-secondary-800">
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="btn-primary gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Saving...
              </>
            ) : (
              'Save FAQ'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FAQsPage;
