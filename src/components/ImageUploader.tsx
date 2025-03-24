import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Cropper from 'react-cropper';
import { X, Upload, Check } from 'lucide-react';
import { storage } from '../firebase/config';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuthStore } from '../store/authStore';
import 'cropperjs/dist/cropper.css';

interface ImageUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (url: string) => void;
}

export default function ImageUploader({ isOpen, onClose, onUpload }: ImageUploaderProps) {
  const [image, setImage] = useState<string | null>(null);
  const [cropper, setCropper] = useState<any>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuthStore();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImage(reader.result as string);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg']
    },
    maxFiles: 1,
    multiple: false,
    maxSize: 5 * 1024 * 1024 // 5MB max
  });

  const handleUpload = async () => {
    if (!cropper || !user) return;

    setIsUploading(true);
    setError(null);

    try {
      // Get cropped image as blob
      const canvas = cropper.getCroppedCanvas({
        width: 400, // Limit max dimensions
        height: 400,
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob as Blob), 'image/jpeg', 0.9);
      });

      // Validate file size (max 2MB)
      if (blob.size > 2 * 1024 * 1024) {
        throw new Error('Image size too large. Please choose a smaller image or reduce the dimensions.');
      }

      // Upload to Firebase Storage with correct file name format
      const fileName = `users/${user.uid}/profile/${Date.now()}.jpg`;
      const storageRef = ref(storage, fileName);
      
      await uploadBytes(storageRef, blob, {
        contentType: 'image/jpeg',
        customMetadata: {
          uploadedBy: user.uid,
          uploadedAt: new Date().toISOString()
        }
      });

      const url = await getDownloadURL(storageRef);
      onUpload(url);
    } catch (error: any) {
      console.error('Error uploading image:', error);
      setError(error.message || 'Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-text">Upload Profile Picture</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {!image ? (
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-accent bg-accent/5' : 'border-gray-300 hover:border-accent'}`}
            >
              <input {...getInputProps()} />
              <Upload size={40} className="mx-auto mb-4 text-accent" />
              <p className="text-text font-medium">
                {isDragActive
                  ? 'Drop the image here'
                  : 'Drag & drop an image here, or click to select'}
              </p>
              <p className="text-text-light text-sm mt-2">
                Maximum file size: 2MB
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-[50vh] overflow-hidden">
                <Cropper
                  src={image}
                  style={{ height: 400, width: '100%' }}
                  aspectRatio={1}
                  guides={true}
                  onInitialized={instance => setCropper(instance)}
                />
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => {
                    setImage(null);
                    setError(null);
                  }}
                  className="px-4 py-2 text-text-light hover:text-text transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
                >
                  {isUploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Check size={20} />
                  )}
                  Upload
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}