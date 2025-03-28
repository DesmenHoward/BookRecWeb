import { useEffect } from 'react';
import { useAdminStore } from '../store/adminStore';
import { useAuthStore } from '../store/authStore';
import { X, Shield } from 'lucide-react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const { user } = useAuthStore();
  const { isAdmin, checkAdminStatus, error } = useAdminStore();

  useEffect(() => {
    if (user?.email) {
      checkAdminStatus(user.email);
    }
  }, [user?.email, checkAdminStatus]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-surface rounded-xl p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-text">Admin Access</h2>
          </div>
          <button
            onClick={onClose}
            className="text-text-light hover:text-text transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {isAdmin ? (
            <div className="p-4 bg-green-100 border border-green-300 text-green-700 rounded-lg">
              You have admin access. Your email ({user?.email}) is registered as an admin account.
            </div>
          ) : (
            <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
              Your email ({user?.email}) is not registered for admin access.
              Please contact the system administrator if you believe this is an error.
            </div>
          )}

          <button
            onClick={onClose}
            className="w-full py-2 px-4 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
