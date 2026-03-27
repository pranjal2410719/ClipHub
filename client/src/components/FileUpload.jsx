import { useState, useRef } from 'react';
import { Upload, File, X, Download, Trash2, AlertCircle } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';
import { useAuth } from '../hooks/useAuth';

const FILE_EXPIRY_OPTIONS = [
  { label: '1 hour', value: '1h' },
  { label: '1 day', value: '1d' },
  { label: '7 days', value: '7d' },
  { label: '30 days', value: '30d' },
  { label: 'Never', value: 'never' }
];

export default function FileUpload({ fileKey, onKeyChange }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [expiry, setExpiry] = useState('1d');
  const [dragActive, setDragActive] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef(null);

  const { uploadFile, downloadFile, deleteFile, uploading, error } = useFileUpload();
  const { isAuthenticated } = useAuth();

  const handleFileSelect = (file) => {
    if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
      setSelectedFile(file);
    } else {
      alert('File size must be less than 10MB');
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = async () => {
    if (!fileKey || !selectedFile) return;

    try {
      await uploadFile(fileKey, selectedFile, expiry);
      setUploadSuccess(true);
      setTimeout(() => setUploadSuccess(false), 3000);
      setSelectedFile(null);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleDownload = () => {
    if (fileKey) {
      downloadFile(fileKey);
    }
  };

  const handleDelete = async () => {
    if (!fileKey) return;
    
    try {
      await deleteFile(fileKey);
      setSelectedFile(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isAuthenticated) {
    return (
      <div className="card border-2 border-dashed border-gray-600 text-center py-8">
        <AlertCircle size={32} className="mx-auto text-gray-500 mb-3" />
        <p className="text-gray-400 mb-2">File uploads require authentication</p>
        <p className="text-gray-500 text-sm">Sign in to upload and share files securely</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      
      {/* File Key Input */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <File size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            value={fileKey}
            onChange={(e) => onKeyChange(e.target.value)}
            placeholder="file-key"
            className="input-base pl-9"
          />
        </div>
        <button
          onClick={handleDownload}
          disabled={!fileKey}
          className="btn-ghost text-sm py-2 px-4 disabled:opacity-40"
        >
          <Download size={14} /> Load
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
          <AlertCircle size={16} className="text-red-400" />
          <span className="text-red-400 text-sm">{error}</span>
        </div>
      )}

      {uploadSuccess && (
        <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
          <Upload size={16} className="text-green-400" />
          <span className="text-green-400 text-sm">File uploaded successfully!</span>
        </div>
      )}

      {/* Drop Zone */}
      <div
        className={`
          border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
          ${dragActive 
            ? 'border-brand-500 bg-brand-500/10' 
            : 'border-gray-600 hover:border-gray-500'
          }
        `}
        onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
          accept=".jpg,.jpeg,.png,.gif,.webp,.pdf,.txt,.docx,.xlsx,.pptx,.zip,.json"
        />

        <Upload size={32} className="mx-auto text-gray-500 mb-3" />
        
        {selectedFile ? (
          <div className="space-y-2">
            <p className="text-white font-medium">{selectedFile.name}</p>
            <p className="text-gray-400 text-sm">{formatFileSize(selectedFile.size)}</p>
            <button
              onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
              className="inline-flex items-center gap-1 text-gray-400 hover:text-red-400 text-sm"
            >
              <X size={14} /> Remove
            </button>
          </div>
        ) : (
          <div>
            <p className="text-gray-400 mb-1">
              {dragActive ? 'Drop your file here' : 'Click to select or drag & drop'}
            </p>
            <p className="text-gray-500 text-sm">
              Images, documents, archives up to 10MB
            </p>
          </div>
        )}
      </div>

      {/* Expiry & Upload */}
      {selectedFile && (
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">Expires:</span>
            <div className="flex gap-1">
              {FILE_EXPIRY_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setExpiry(opt.value)}
                  className={`
                    text-xs px-2.5 py-1 rounded-lg transition-all duration-150 
                    ${expiry === opt.value
                      ? 'bg-brand-500/25 text-brand-400 border border-brand-500/40'
                      : 'text-gray-500 hover:text-gray-300 glass-hover'
                    }
                  `}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDelete}
              disabled={!fileKey}
              className="btn-ghost text-sm py-2 px-3 text-red-400 hover:text-red-300 disabled:opacity-40"
            >
              <Trash2 size={14} />
            </button>
            <button
              onClick={handleUpload}
              disabled={!fileKey || uploading}
              className="btn-primary text-sm py-2 px-4 disabled:opacity-40"
            >
              {uploading ? 'Uploading...' : 'Upload file'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}