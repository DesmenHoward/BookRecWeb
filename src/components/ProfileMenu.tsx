import React, { useEffect, useState } from 'react';
import { Settings, MessageCircle, ShieldCheck } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAdminStore } from '../store/adminStore';
import { shallow } from 'zustand/shallow';

interface ProfileMenuProps {
  onPressMenuItem: (menuItem: string) => void;
}

export default function ProfileMenu({ onPressMenuItem }: ProfileMenuProps) {
  const { user } = useAuthStore();
  const [adminChecked, setAdminChecked] = useState(false);

  // Subscribe to admin store with proper memoization
  const { isAdmin, checkAdminStatus } = useAdminStore(
    (state) => ({
      isAdmin: state.isAdmin,
      checkAdminStatus: state.checkAdminStatus,
    }),
    shallow
  );

  // Debug log
  console.log('ProfileMenu Debug:', {
    userEmail: user?.email,
    isAdmin,
    adminChecked,
    user
  });

  useEffect(() => {
    if (user?.email && !adminChecked) {
      console.log('Checking admin status for:', user.email);
      checkAdminStatus(user.email);
      setAdminChecked(true);
      
      // Force a re-check after a moment
      setTimeout(() => {
        checkAdminStatus(user.email);
        console.log('Re-checking admin state:', useAdminStore.getState().isAdmin);
      }, 500);
    }
  }, [user?.email, checkAdminStatus, adminChecked]);

  const handleContactPress = () => {
    window.alert('For any questions, concerns, or reports please contact, BookRecHelp@Outlook.com');
  };

  return (
    <div className="bg-surface mt-4 rounded-lg shadow-md overflow-hidden">
      {/* Debug info - always visible */}
      <div className="px-5 py-2 text-sm text-gray-600 border-b border-border/20">
        <div>Email: {user?.email || 'Not logged in'}</div>
        <div>Admin: {isAdmin ? '✅' : '❌'}</div>
        <div>Checked: {adminChecked ? '✅' : '❌'}</div>
      </div>

      <button
        onClick={() => onPressMenuItem('settings')}
        className="w-full flex items-center px-5 py-4 hover:bg-accent/10 border-b border-border/20"
      >
        <Settings className="w-5 h-5 text-text" />
        <span className="ml-4 text-text">Account Settings</span>
      </button>

      {isAdmin && (
        <button
          onClick={() => onPressMenuItem('admin')}
          className="w-full flex items-center px-5 py-4 hover:bg-accent/10 border-b border-border/20"
        >
          <ShieldCheck className="w-5 h-5 text-accent" />
          <span className="ml-4 font-semibold text-accent">Admin Panel</span>
        </button>
      )}

      <button
        onClick={handleContactPress}
        className="w-full flex items-center px-5 py-4 hover:bg-accent/10 border-b border-border/20"
      >
        <MessageCircle className="w-5 h-5 text-text" />
        <span className="ml-4 text-text">Contact Us</span>
      </button>

      <div className="px-5 py-4">
        <button
          onClick={() => onPressMenuItem('logout')}
          className="w-full bg-red-50 text-red-500 py-2 rounded-lg hover:bg-red-100 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
