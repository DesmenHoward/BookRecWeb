import React, { useState, useEffect } from 'react';
import { useUserProfileStore } from '../store/userProfileStore';
import { X, Camera, Check } from 'lucide-react';
import ImageUploader from './ImageUploader';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EditProfileModal({ isOpen, onClose }: EditProfileModalProps) {
  const { profile, updateProfile, isLoading } = useUserProfileStore();
  const [formData, setFormData] = useState({
    displayName: '',
    username: '',
    bio: '',
    location: '',
    socialLinks: {
      twitter: '',
      instagram: '',
      goodreads: ''
    }
  });
  const [showImageUploader, setShowImageUploader] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        displayName: profile.displayName,
        username: profile.username,
        bio: profile.bio || '',
        location: profile.location || '',
        socialLinks: {
          twitter: profile.socialLinks?.twitter || '',
          instagram: profile.socialLinks?.instagram || '',
          goodreads: profile.socialLinks?.goodreads || ''
        }
      });
    }
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('social.')) {
      const [, network] = name.split('.');
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [network]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateProfile(formData);
    onClose();
  };

  const handleImageUpload = async (imageUrl: string) => {
    await updateProfile({ profilePicture: imageUrl });
    setShowImageUploader(false);
  };

  if (!isOpen || !profile) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-bold text-text">Edit Profile</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="flex items-center justify-center mb-8">
            <div className="relative">
              <img 
                src={profile.profilePicture} 
                alt={profile.displayName}
                className="w-32 h-32 rounded-full object-cover"
              />
              <button
                onClick={() => setShowImageUploader(true)}
                className="absolute bottom-0 right-0 p-2 bg-accent text-white rounded-full hover:bg-accent/90 transition-colors"
              >
                <Camera size={20} />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Display Name
              </label>
              <input
                type="text"
                name="displayName"
                value={formData.displayName}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-accent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-accent"
                rows={4}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text mb-1">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-accent"
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-text">Social Links</h3>
              
              <div>
                <label className="block text-sm text-text-light mb-1">
                  X
                </label>
                <input
                  type="text"
                  name="social.twitter"
                  value={formData.socialLinks.twitter}
                  onChange={handleChange}
                  placeholder="@username"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-text-light mb-1">
                  Instagram
                </label>
                <input
                  type="text"
                  name="social.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleChange}
                  placeholder="@username"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm text-text-light mb-1">
                  Goodreads
                </label>
                <input
                  type="text"
                  name="social.goodreads"
                  value={formData.socialLinks.goodreads}
                  onChange={handleChange}
                  placeholder="username"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={20} />
                )}
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>

      <ImageUploader
        isOpen={showImageUploader}
        onClose={() => setShowImageUploader(false)}
        onUpload={handleImageUpload}
      />
    </div>
  );
}