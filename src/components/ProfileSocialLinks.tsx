import { Instagram, BookOpen, Twitter } from 'lucide-react';
import { useUserProfileStore } from '../store/userProfileStore';

export default function ProfileSocialLinks() {
  const { profile } = useUserProfileStore();
  
  // Early return if profile or socialLinks is not initialized
  if (!profile || !profile.socialLinks) {
    return null;
  }

  const { twitter = '', instagram = '', goodreads = '' } = profile.socialLinks;
  
  const openLink = (type: 'twitter' | 'instagram' | 'goodreads') => {
    let url = '';
    
    switch (type) {
      case 'twitter':
        if (twitter) {
          url = `https://x.com/${twitter.replace('@', '')}`;
        }
        break;
      case 'instagram':
        if (instagram) {
          url = `https://instagram.com/${instagram.replace('@', '')}`;
        }
        break;
      case 'goodreads':
        if (goodreads) {
          url = `https://goodreads.com/${goodreads}`;
        }
        break;
    }
    
    if (url) {
      window.open(url, '_blank');
    }
  };

  // Only render the component if there are social links to display
  if (!twitter && !instagram && !goodreads) {
    return null;
  }
  
  return (
    <div className="bg-surface mt-4 rounded-lg p-4 shadow-sm">
      <div className="text-lg font-bold mb-4">Connect</div>
      
      <div className="flex flex-row justify-around items-center gap-4">
        {twitter && (
          <button
            onClick={() => openLink('twitter')}
            className="flex flex-col items-center p-2 hover:opacity-80"
          >
            <Twitter className="w-6 h-6 text-accent" />
            <span className="text-sm text-textLight mt-1">@{twitter.replace('@', '')}</span>
          </button>
        )}
        
        {instagram && (
          <button
            onClick={() => openLink('instagram')}
            className="flex flex-col items-center p-2 hover:opacity-80"
          >
            <Instagram className="w-6 h-6 text-accent" />
            <span className="text-sm text-textLight mt-1">{instagram}</span>
          </button>
        )}
        
        {goodreads && (
          <button
            onClick={() => openLink('goodreads')}
            className="flex flex-col items-center p-2 hover:opacity-80"
          >
            <BookOpen className="w-6 h-6 text-accent" />
            <span className="text-sm text-textLight mt-1">goodreads.com/{goodreads}</span>
          </button>
        )}
      </div>
    </div>
  );
}