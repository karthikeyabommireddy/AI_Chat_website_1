import { useState, useEffect, useCallback } from 'react';
import { 
  FileText, 
  Upload, 
  Trash2, 
  Search, 
  Filter,
  Download,
  Eye,
  X,
  Loader2,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { formatBytes, formatDate } from '../../lib/utils';

const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        page: pagination.page,
        limit: 10,
        ...(searchQuery && { search: searchQuery }),
        ...(filter !== 'all' && { status: filter }),
      });
      
      const { data } = await api.get(`/documents?${params}`);
      setDocuments(data.data.documents);
      setPagination(data.data.pagination);
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, searchQuery, filter]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleUpload = async (files) => {
    setIsUploading(true);
    
    for (const file of files) {
      try {
        const formData = new FormData();
        formData.append('document', file);
        formData.append('title', file.name);
        
        await api.post('/documents/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        
        toast.success(`Uploaded: ${file.name}`);
      } catch (err) {
        toast.error(`Failed to upload: ${file.name}`);
      }
    }
    
    setIsUploading(false);
    setShowUploadModal(false);
    fetchDocuments();
  };

  const handleDelete = async (docId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;

    try {
      await api.delete(`/documents/${docId}`);
      toast.success('Document deleted');
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to delete document');
    }
  };

  const handleToggleStatus = async (doc) => {
    try {
      await api.put(`/documents/${doc._id}`, {
        status: doc.status === 'active' ? 'inactive' : 'active',
      });
      toast.success('Status updated');
      fetchDocuments();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const getStatusBadge = (status) => {
    const styles = {
      active: 'bg-green-500/10 text-green-400',
      processing: 'bg-yellow-500/10 text-yellow-400',
      inactive: 'bg-secondary-500/10 text-secondary-400',
      error: 'bg-red-500/10 text-red-400',
    };
    
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || styles.inactive}`}>
        {status}
      </span>
    );
  };

  const getFileIcon = (type) => {
    return <FileText className="w-5 h-5 text-primary-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Documents</h1>
          <p className="text-secondary-400 mt-1">
            Upload and manage knowledge base documents
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary gap-2"
        >
          <Upload className="w-5 h-5" />
          Upload Document
        </button>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive', 'processing'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm capitalize transition-colors ${
                filter === f
                  ? 'bg-primary-600 text-white'
                  : 'bg-secondary-800 text-secondary-300 hover:bg-secondary-700'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-secondary-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-white mb-2">No documents yet</h3>
            <p className="text-secondary-400 mb-4">
              Upload documents to train your AI assistant
            </p>
            <button
              onClick={() => setShowUploadModal(true)}
              className="btn-primary"
            >
              Upload Document
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-secondary-700">
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">Document</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">Type</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">Size</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">Status</th>
                  <th className="text-left py-4 px-4 text-sm font-medium text-secondary-400">Uploaded</th>
                  <th className="text-right py-4 px-4 text-sm font-medium text-secondary-400">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc) => (
                  <tr key={doc._id} className="border-b border-secondary-800 hover:bg-secondary-800/50">
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-secondary-700 rounded-lg flex items-center justify-center">
                          {getFileIcon(doc.fileType)}
                        </div>
                        <div>
                          <p className="font-medium text-white">{doc.title}</p>
                          <p className="text-xs text-secondary-400">{doc.originalName}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2 py-1 text-xs bg-secondary-700 rounded text-secondary-300 uppercase">
                        {doc.fileType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-secondary-300">
                      {formatBytes(doc.fileSize)}
                    </td>
                    <td className="py-4 px-4">
                      {getStatusBadge(doc.status)}
                    </td>
                    <td className="py-4 px-4 text-secondary-400 text-sm">
                      {formatDate(doc.createdAt)}
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedDoc(doc)}
                          className="p-2 hover:bg-secondary-700 rounded-lg text-secondary-400 hover:text-white"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(doc)}
                          className={`p-2 hover:bg-secondary-700 rounded-lg ${
                            doc.status === 'active' ? 'text-green-400' : 'text-secondary-400'
                          }`}
                          title={doc.status === 'active' ? 'Deactivate' : 'Activate'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(doc._id)}
                          className="p-2 hover:bg-secondary-700 rounded-lg text-secondary-400 hover:text-red-400"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-secondary-800">
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
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUpload}
          isUploading={isUploading}
        />
      )}

      {/* Document Preview Modal */}
      {selectedDoc && (
        <DocumentPreviewModal
          document={selectedDoc}
          onClose={() => setSelectedDoc(null)}
        />
      )}
    </div>
  );
};

// Upload Modal Component
const UploadModal = ({ onClose, onUpload, isUploading }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    setFiles([...files, ...droppedFiles]);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles([...files, ...selectedFiles]);
  };

  const removeFile = (index) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (files.length > 0) {
      onUpload(files);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary-900 rounded-2xl w-full max-w-lg">
        <div className="flex items-center justify-between p-6 border-b border-secondary-800">
          <h2 className="text-xl font-semibold text-white">Upload Documents</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary-800 rounded-lg">
            <X className="w-5 h-5 text-secondary-400" />
          </button>
        </div>

        <div className="p-6">
          {/* Drop Zone */}
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              dragActive
                ? 'border-primary-500 bg-primary-500/10'
                : 'border-secondary-700 hover:border-secondary-600'
            }`}
          >
            <Upload className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-white mb-2">Drag and drop files here</p>
            <p className="text-secondary-400 text-sm mb-4">or</p>
            <label className="btn-primary cursor-pointer">
              Browse Files
              <input
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.txt,.md"
                onChange={handleFileSelect}
                className="hidden"
              />
            </label>
            <p className="text-xs text-secondary-500 mt-4">
              Supported: PDF, DOC, DOCX, TXT, MD (max 10MB each)
            </p>
          </div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-4 space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-secondary-800 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-primary-400" />
                    <div>
                      <p className="text-sm text-white truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-secondary-400">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="p-1 hover:bg-secondary-700 rounded"
                  >
                    <X className="w-4 h-4 text-secondary-400" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 border-t border-secondary-800">
          <button onClick={onClose} className="btn-ghost">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={files.length === 0 || isUploading}
            className="btn-primary gap-2"
          >
            {isUploading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                Upload {files.length > 0 && `(${files.length})`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Document Preview Modal
const DocumentPreviewModal = ({ document, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <div className="bg-secondary-900 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-secondary-800">
          <h2 className="text-xl font-semibold text-white">{document.title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-secondary-800 rounded-lg">
            <X className="w-5 h-5 text-secondary-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-secondary-400">File Type</p>
                <p className="text-white">{document.fileType?.toUpperCase()}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-400">Size</p>
                <p className="text-white">{formatBytes(document.fileSize)}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-400">Status</p>
                <p className="text-white capitalize">{document.status}</p>
              </div>
              <div>
                <p className="text-sm text-secondary-400">Uploaded</p>
                <p className="text-white">{formatDate(document.createdAt)}</p>
              </div>
            </div>

            {document.content && (
              <div className="mt-6">
                <p className="text-sm text-secondary-400 mb-2">Content Preview</p>
                <div className="p-4 bg-secondary-800 rounded-lg">
                  <p className="text-secondary-300 text-sm whitespace-pre-wrap">
                    {document.content.substring(0, 1000)}
                    {document.content.length > 1000 && '...'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end p-6 border-t border-secondary-800">
          <button onClick={onClose} className="btn-secondary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
