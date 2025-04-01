import { useEffect, useState } from 'react';
import { useAdminStore } from '../store/adminStore';
import { useAuthStore } from '../store/authStore';
import { X, Shield } from 'lucide-react';
import AdminUserList from './AdminUserList';
import AdminBookList from './AdminBookList';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AdminModal({ isOpen, onClose }: AdminModalProps) {
  const { user } = useAuthStore();
  const { isAdmin, checkAdminStatus, error } = useAdminStore();
  const [showUserList, setShowUserList] = useState(false);
  const [showBookList, setShowBookList] = useState(false);

  useEffect(() => {
    if (user?.email) {
      checkAdminStatus(user.email);
    }
  }, [user?.email, checkAdminStatus]);

  if (!isOpen) return null;

  return (
    <>
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
              <>
                <div className="mt-2">
                  <h3 className="text-lg font-semibold mb-3 text-text">User Settings</h3>
                  <button
                    onClick={() => setShowUserList(true)}
                    className="w-full text-left px-4 py-3 bg-surface-light hover:bg-surface-lighter rounded-lg transition-colors flex items-center gap-2"
                  >
                    View All Users
                  </button>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-semibold mb-3 text-text">Book Settings</h3>
                  <button
                    onClick={() => setShowBookList(true)}
                    className="w-full text-left px-4 py-3 bg-surface-light hover:bg-surface-lighter rounded-lg transition-colors flex items-center gap-2"
                  >
                    View All Books
                  </button>
                </div>
              </>
            ) : (
              <div className="p-4 bg-red-100 border border-red-300 text-red-700 rounded-lg">
                Access denied. This panel is restricted to admin users only.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <AdminUserList 
        isOpen={showUserList} 
        onClose={() => setShowUserList(false)} 
      />

      <AdminBookList
        isOpen={showBookList}
        onClose={() => setShowBookList(false)}
      />
    </>
  );
}
