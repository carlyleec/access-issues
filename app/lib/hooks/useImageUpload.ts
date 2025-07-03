import { useState, useCallback } from 'react';
import { useFetcher } from 'react-router';

interface UploadState {
  isUploading: boolean;
  error: string | null;
  url: string | null;
  filename: string | null;
}

interface UploadResult {
  success: boolean;
  url?: string;
  filename?: string;
  error?: string;
}

export function useImageUpload() {
  const fetcher = useFetcher<UploadResult>();
  const [state, setState] = useState<UploadState>({
    isUploading: false,
    error: null,
    url: null,
    filename: null,
  });

  const uploadImage = useCallback(
    async (file: File) => {
      if (!file) {
        setState(prev => ({ ...prev, error: 'No file provided' }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        setState(prev => ({ ...prev, error: 'File must be an image' }));
        return;
      }

      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setState(prev => ({ ...prev, error: 'File size must be less than 5MB' }));
        return;
      }

      setState(prev => ({ 
        ...prev, 
        isUploading: true, 
        error: null,
        url: null,
        filename: null 
      }));

      const formData = new FormData();
      formData.append('image', file);

      fetcher.submit(formData, {
        method: 'POST',
        action: '/api/upload',
        encType: 'multipart/form-data',
      });
    },
    [fetcher]
  );

  // Update state based on fetcher results
  const isUploading = fetcher.state === 'submitting' || state.isUploading;
  
  if (fetcher.data && fetcher.state === 'idle') {
    if (fetcher.data.success && state.url !== fetcher.data.url) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        url: fetcher.data!.url!,
        filename: fetcher.data!.filename!,
        error: null,
      }));
    } else if (!fetcher.data.success && state.error !== fetcher.data.error) {
      setState(prev => ({
        ...prev,
        isUploading: false,
        error: fetcher.data!.error!,
        url: null,
        filename: null,
      }));
    }
  }

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      error: null,
      url: null,
      filename: null,
    });
  }, []);

  return {
    uploadImage,
    isUploading,
    error: state.error,
    url: state.url,
    filename: state.filename,
    reset,
  };
}
