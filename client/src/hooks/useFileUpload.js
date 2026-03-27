import { useState } from 'react';
import { useAuth } from './useAuth';

export const useFileUpload = () => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const { authFetch } = useAuth();

  const uploadFile = async (key, file, expiry = '1d') => {
    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('key', key);
      formData.append('expiry', expiry);

      const response = await authFetch('/api/file', {
        method: 'POST',
        body: formData,
        headers: {} // Don't set Content-Type for FormData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setUploading(false);
    }
  };

  const downloadFile = async (key) => {
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      window.open(`${API_URL}/api/file/${key}`, '_blank');
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  const deleteFile = async (key) => {
    setError(null);

    try {
      const response = await authFetch(`/api/file/${key}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Delete failed');
      }

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  };

  return {
    uploadFile,
    downloadFile,
    deleteFile,
    uploading,
    error
  };
};