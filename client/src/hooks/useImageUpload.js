import { useState, useCallback } from 'react';
import { uploadFile, API_ENDPOINTS } from '../config/api';

// Validation constants
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

/**
 * Validate an image file before upload
 * @param {File} file - File to validate
 * @returns {{ valid: boolean, error: string | null }}
 */
export function validateImageFile(file) {
  if (!file) {
    return { valid: false, error: 'No file selected' };
  }

  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed: ${ALLOWED_TYPES.map(t => t.split('/')[1]).join(', ')}`,
    };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File too large. Maximum size is ${MAX_FILE_SIZE_MB}MB`,
    };
  }

  if (file.size === 0) {
    return { valid: false, error: 'File is empty' };
  }

  return { valid: true, error: null };
}

/**
 * Hook for handling image uploads with preview and validation
 * @returns {object} Upload state and handlers
 */
export function useImageUpload() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  /**
   * Handle file selection from input
   * @param {Event} e - Input change event
   */
  const handleFileSelect = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    setUploadedUrl(null);

    if (!selectedFile) {
      setFile(null);
      setPreview(null);
      return;
    }

    // Validate file
    const validation = validateImageFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error);
      setFile(null);
      setPreview(null);
      return;
    }

    setFile(selectedFile);

    // Create preview URL
    const previewUrl = URL.createObjectURL(selectedFile);
    setPreview(previewUrl);
  }, []);

  /**
   * Clear selected file and preview
   */
  const clearFile = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setFile(null);
    setPreview(null);
    setError(null);
    setUploadedUrl(null);
  }, [preview]);

  /**
   * Upload the selected file to Cloudinary via backend
   * @returns {Promise<string>} Uploaded image URL
   */
  const upload = useCallback(async () => {
    if (!file) {
      throw new Error('No file selected');
    }

    setUploading(true);
    setError(null);

    try {
      const result = await uploadFile(API_ENDPOINTS.uploads.image, file);
      setUploadedUrl(result.url);
      return result.url;
    } catch (err) {
      const errorMessage = err.message || 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, [file]);

  /**
   * Select and immediately upload a file
   * Useful for avatar uploads where you want instant upload
   * @param {File} selectedFile - File to upload
   * @returns {Promise<string>} Uploaded image URL
   */
  const selectAndUpload = useCallback(async (selectedFile) => {
    setError(null);
    setUploadedUrl(null);

    // Validate
    const validation = validateImageFile(selectedFile);
    if (!validation.valid) {
      setError(validation.error);
      throw new Error(validation.error);
    }

    setFile(selectedFile);
    setPreview(URL.createObjectURL(selectedFile));
    setUploading(true);

    try {
      const result = await uploadFile(API_ENDPOINTS.uploads.image, selectedFile);
      setUploadedUrl(result.url);
      return result.url;
    } catch (err) {
      const errorMessage = err.message || 'Upload failed';
      setError(errorMessage);
      throw err;
    } finally {
      setUploading(false);
    }
  }, []);

  return {
    // State
    file,
    preview,
    uploading,
    error,
    uploadedUrl,
    hasFile: !!file,

    // Actions
    handleFileSelect,
    clearFile,
    upload,
    selectAndUpload,

    // Validation helper
    validateImageFile,
  };
}

export default useImageUpload;
