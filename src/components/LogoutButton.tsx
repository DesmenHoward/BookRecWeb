import React from 'react';
import { LogOut } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import LogoutSplashScreen from './LogoutSplashScreen';

// Theme colors
const THEME = {
  primary: '#7D6E83',
  accent: '#A75D5D',
  background: '#F9F5EB',
  surface: '#EFE3D0',
  text: '#4F4557',
  textLight: '#7D6E83',
  border: '#D0B8A8'
};

interface LogoutButtonProps {
  variant?: 'icon' | 'text' | 'full';
}

export default function LogoutButton({ variant = 'full' }: LogoutButtonProps) {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = React.useState(false);
  
  const handleLogoutConfirm = async () => {
    try {
      await logout();
      // Reset navigation state and redirect to login
      navigate('/login');
    } catch (error) {
      // If there's an error, hide the splash screen and show an error message
      setShowSplash(false);
      window.alert('Failed to log out. Please try again.');
    }
  };
  
  if (variant === 'icon') {
    return (
      <>
        <button 
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          onClick={() => setShowSplash(true)}
        >
          <LogOut size={24} color={THEME.accent} />
        </button>
        <LogoutSplashScreen
          visible={showSplash}
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowSplash(false)}
        />
      </>
    );
  }
  
  if (variant === 'text') {
    return (
      <>
        <button
          className="text-base font-bold hover:opacity-80 transition-opacity"
          style={{ color: THEME.accent }}
          onClick={() => setShowSplash(true)}
        >
          Log Out
        </button>
        <LogoutSplashScreen
          visible={showSplash}
          onConfirm={handleLogoutConfirm}
          onCancel={() => setShowSplash(false)}
        />
      </>
    );
  }
  
  return (
    <>
      <button
        className="flex items-center justify-center py-3 px-5 rounded-full text-white hover:opacity-90 transition-opacity"
        style={{ backgroundColor: THEME.accent }}
        onClick={() => setShowSplash(true)}
      >
        <LogOut size={20} className="mr-2" />
        <span className="font-bold">Log Out</span>
      </button>
      <LogoutSplashScreen
        visible={showSplash}
        onConfirm={handleLogoutConfirm}
        onCancel={() => setShowSplash(false)}
      />
    </>
  );
}