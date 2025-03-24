import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { X } from 'lucide-react';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AccountSettingsModal({ isOpen, onClose }: AccountSettingsModalProps) {
  const { updateUserEmail, updateUserPassword, error, isLoading } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [mode, setMode] = useState<'email' | 'password'>('email');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('');

    try {
      if (mode === 'email') {
        await updateUserEmail(currentPassword, newEmail);
        setSuccessMessage('Email updated successfully');
      } else {
        await updateUserPassword(currentPassword, newPassword);
        setSuccessMessage('Password updated successfully');
      }
      setCurrentPassword('');
      setNewEmail('');
      setNewPassword('');
    } catch (err) {
      // Error is handled by the store
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-text">Account Settings</h2>
          <button
            onClick={onClose}
            className="text-text-light hover:text-text transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode('email')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              mode === 'email'
                ? 'bg-accent text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Update Email
          </button>
          <button
            onClick={() => setMode('password')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              mode === 'password'
                ? 'bg-accent text-white'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Update Password
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 text-green-700 rounded-lg">
            {successMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-text mb-1">
              Current Password
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent"
              required
            />
          </div>

          {mode === 'email' ? (
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                New Email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-text mb-1">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent"
                required
                minLength={6}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Updating...' : 'Update'}
          </button>
        </form>
      </div>
    </div>
  );
}
