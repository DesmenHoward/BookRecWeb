import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { useUserProfileStore } from '../store/userProfileStore';

interface ProfilePhotoModalProps {
  visible: boolean;
  onClose: () => void;
}

// Sample profile pictures from Unsplash
const sampleProfilePictures = [
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1491349174775-aaafddd81942?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
];

export default function ProfilePhotoModal({ visible, onClose }: ProfilePhotoModalProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const { updateProfile } = useUserProfileStore();

  const handlePhotoSelect = (photo: string) => {
    setSelectedPhoto(photo);
  };

  const handleSavePhoto = async () => {
    if (selectedPhoto) {
      try {
        await updateProfile({ profilePicture: selectedPhoto });
        onClose();
      } catch (error) {
        console.error('Error updating profile photo:', error);
        alert('Failed to update profile photo. Please try again.');
      }
    }
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface p-6 rounded-xl max-w-2xl w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text">Change Profile Photo</h2>
          <button
            onClick={onClose}
            className="text-text-light hover:text-text transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
          {sampleProfilePictures.map((photo, index) => (
            <button
              key={index}
              onClick={() => handlePhotoSelect(photo)}
              className={`relative aspect-square rounded-lg overflow-hidden ${
                selectedPhoto === photo ? 'ring-2 ring-accent' : ''
              }`}
            >
              <img
                src={photo}
                alt={`Profile photo option ${index + 1}`}
                className="w-full h-full object-cover"
              />
              {selectedPhoto === photo && (
                <div className="absolute inset-0 bg-accent/20 flex items-center justify-center">
                  <Check className="w-8 h-8 text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-text-light hover:text-text transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSavePhoto}
            disabled={!selectedPhoto}
            className={`px-4 py-2 rounded-lg ${
              selectedPhoto
                ? 'bg-accent text-white hover:bg-accent/90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}