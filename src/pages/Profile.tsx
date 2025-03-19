import { useState, useEffect } from 'react';
import { useUserProfileStore } from '../store/userProfileStore';
import { useBookStore } from '../store/bookStore';
import { Settings, LogOut, Edit } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import LoadingIndicator from '../components/LoadingIndicator';
import EditProfileModal from '../components/EditProfileModal';

export default function Profile() {
  const { profile, initializeProfile, isLoading } = useUserProfileStore();
  const { favorites, userNickname } = useBookStore();
  const { logout } = useAuthStore();
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    initializeProfile();
  }, []);

  if (isLoading || !profile) {
    return <LoadingIndicator message="Loading profile..." />;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-surface rounded-xl p-6 mb-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-6">
            <img 
              src={profile.profilePicture} 
              alt={profile.displayName}
              className="w-24 h-24 rounded-full object-cover"
            />
            
            <div>
              <h1 className="text-2xl font-bold text-text">{profile.displayName}</h1>
              <p className="text-text-light">@{profile.username}</p>
              {userNickname && (
                <span className="inline-block mt-2 px-3 py-1 bg-accent/10 text-accent rounded-full text-sm">
                  {userNickname}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={() => setShowEditModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            <Edit size={20} />
            Edit Profile
          </button>
        </div>

        {profile.bio && (
          <p className="mt-6 text-text">{profile.bio}</p>
        )}

        <div className="mt-6 flex flex-wrap gap-4">
          {profile.location && (
            <span className="text-text-light">📍 {profile.location}</span>
          )}
          {profile.website && (
            <a 
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              🌐 {profile.website}
            </a>
          )}
          <span className="text-text-light">
            📅 Joined {profile.joinDate}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-surface rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-accent">{favorites.length}</div>
          <div className="text-text-light">Favorite Books</div>
        </div>
        
        <div className="bg-surface rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-accent">
            {Object.keys(profile.socialLinks || {}).filter(key => profile.socialLinks[key]).length}
          </div>
          <div className="text-text-light">Connected Accounts</div>
        </div>
        
        <div className="bg-surface rounded-xl p-6 text-center">
          <div className="text-2xl font-bold text-accent">
            {profile.joinDate}
          </div>
          <div className="text-text-light">Member Since</div>
        </div>
      </div>

      <div className="bg-surface rounded-xl p-6">
        <h2 className="text-xl font-bold text-text mb-4">Recent Activity</h2>
        <p className="text-text-light">No recent activity to show.</p>
      </div>

      <EditProfileModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
      />
    </div>
  );
}