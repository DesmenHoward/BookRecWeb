import { Edit, Camera, Award, MapPin, Link } from 'lucide-react';
import { Icon } from './ui/Icon';
import type { UserProfile } from '@/types/user';
import { THEME } from '@/theme';

interface ProfileHeaderProps {
  profile: UserProfile | null;
  onEditProfile: () => void;
  onPhotoChange: () => void;
}

export default function ProfileHeader({ profile, onEditProfile, onPhotoChange }: ProfileHeaderProps) {
  if (!profile) {
    return null;
  }

  return (
    <div className="relative bg-surface rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onEditProfile}
          className="p-2 rounded-full bg-accent hover:bg-accent/90 transition-colors"
        >
          <Icon icon={Edit} size={18} color="white" />
        </button>
      </div>

      <div className="relative w-24 h-24 mx-auto mb-4">
        <img
          src={profile.profilePicture}
          alt={profile.displayName}
          className="w-full h-full rounded-full object-cover"
        />
        <button
          onClick={onPhotoChange}
          className="absolute bottom-0 right-0 p-2 rounded-full bg-accent hover:bg-accent/90 transition-colors"
        >
          <Icon icon={Camera} size={18} color="white" />
        </button>
      </div>

      <div className="text-center mb-4">
        <h2 className="text-2xl font-bold text-text">{profile.displayName}</h2>
        <p className="text-text-light">@{profile.username}</p>
      </div>

      {profile.nickname && (
        <div className="flex items-center justify-center mb-4">
          <Icon icon={Award} size={16} color={THEME.accent} className="mr-2" />
          <span className="text-text-light">{profile.nickname}</span>
        </div>
      )}

      <p className="text-text text-center mb-4">{profile.bio}</p>

      <div className="flex flex-col items-center gap-2">
        {profile.location && (
          <div className="flex items-center">
            <Icon icon={MapPin} size={16} color={THEME.textLight} className="mr-2" />
            <span className="text-text-light">{profile.location}</span>
          </div>
        )}

        {profile.website && (
          <div className="flex items-center">
            <Icon icon={Link} size={16} color={THEME.textLight} className="mr-2" />
            <a
              href={profile.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-light hover:text-accent transition-colors"
            >
              {profile.website}
            </a>
          </div>
        )}

        <p className="text-text-light text-sm mt-2">
          Joined {new Date(profile.joinDate).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}