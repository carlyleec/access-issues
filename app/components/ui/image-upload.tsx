import { useRef, useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { useImageUpload } from '../../lib/hooks/useImageUpload';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUploadSuccess?: (url: string, filename: string) => void;
  onUploadError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
  accept?: string;
  maxSizeMB?: number;
}

export function ImageUpload({
  onUploadSuccess,
  onUploadError,
  disabled = false,
  className = '',
  accept = 'image/*',
  maxSizeMB = 5,
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  
  const { uploadImage, isUploading, error, url, filename, reset } = useImageUpload();

  // Handle successful upload
  if (url && filename && !isUploading) {
    onUploadSuccess?.(url, filename);
  }

  // Handle upload error
  if (error && !isUploading) {
    onUploadError?.(error);
  }

  const handleFileSelect = (file: File | null) => {
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    uploadImage(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    handleFileSelect(file || null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const clearUpload = () => {
    setPreview(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      <Input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleInputChange}
        disabled={disabled || isUploading}
        className="hidden"
      />

      {/* Upload Area */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
          transition-colors duration-200
          ${dragActive 
            ? 'border-primary bg-primary/5' 
            : 'border-gray-300 hover:border-gray-400'
          }
          ${disabled || isUploading ? 'opacity-50 cursor-not-allowed' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={disabled || isUploading ? undefined : openFileDialog}
      >
        {preview || url ? (
          <div className="relative">
            <img
              src={preview || url || ''}
              alt="Upload preview"
              className="max-w-full max-h-48 mx-auto rounded-lg"
            />
            {!isUploading && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={(e) => {
                  e.stopPropagation();
                  clearUpload();
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {isUploading && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                <div className="text-white">
                  <Upload className="h-8 w-8 mx-auto mb-2 animate-pulse" />
                  <p>Uploading...</p>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <ImageIcon className="h-12 w-12 mx-auto text-gray-400" />
            <div>
              <p className="text-sm text-gray-600">
                {isUploading ? (
                  'Uploading...'
                ) : (
                  <>
                    <span className="font-medium">Click to upload</span> or drag and drop
                  </>
                )}
              </p>
              <p className="text-xs text-gray-500">
                PNG, JPG, GIF up to {maxSizeMB}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
          {error}
        </div>
      )}

      {/* Success Message */}
      {url && !isUploading && (
        <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
          Image uploaded successfully!
        </div>
      )}

      {/* Manual Upload Button */}
      <Button
        type="button"
        variant="outline"
        onClick={openFileDialog}
        disabled={disabled || isUploading}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Choose Image'}
      </Button>
    </div>
  );
}
