import { useState, useEffect } from 'react';
import { X, User, Ban, Trash2 } from 'lucide-react';
import { deleteUser } from 'firebase/auth';
import { auth } from '../firebase/config';

interface UserData {
  uid: string;
  email: string;
  displayName?: string;
  dateJoined: string;
  banned?: boolean;
}

const REGISTERED_USERS_KEY = 'registered-users';

export default function AdminUserList({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingUser, setDeletingUser] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Get all registered users from storage
        const storedUsers = localStorage.getItem(REGISTERED_USERS_KEY);
        let registeredUsers: UserData[] = storedUsers ? JSON.parse(storedUsers) : [];

        // Ensure admin is always in the list
        const adminEmail = 'desmenhoward23@gmail.com';
        if (!registeredUsers.some(u => u.email.toLowerCase() === adminEmail.toLowerCase())) {
          registeredUsers.unshift({
            uid: 'admin-1',
            email: adminEmail,
            displayName: 'Admin',
            dateJoined: new Date(2024, 0, 1).toISOString(),
            banned: false
          });
          // Save updated list back to storage
          localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(registeredUsers));
        }

        // Sort users by join date (newest first)
        registeredUsers.sort((a, b) => 
          new Date(b.dateJoined).getTime() - new Date(a.dateJoined).getTime()
        );

        setUsers(registeredUsers);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen) {
      fetchUsers();
    }
  }, [isOpen]);

  const handleBanUser = (uid: string) => {
    setUsers(prevUsers => {
      const updatedUsers = prevUsers.map(user => {
        if (user.uid === uid) {
          // Don't allow banning the admin
          if (user.email.toLowerCase() === 'desmenhoward23@gmail.com') {
            return user;
          }
          return { ...user, banned: !user.banned };
        }
        return user;
      });
      
      // Save to localStorage
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
      return updatedUsers;
    });
  };

  const handleDeleteUser = async (uid: string, email: string) => {
    if (email.toLowerCase() === 'desmenhoward23@gmail.com') {
      return; // Don't allow deleting admin
    }

    try {
      setDeletingUser(uid);
      
      // Remove from localStorage first
      const updatedUsers = users.filter(u => u.uid !== uid);
      localStorage.setItem(REGISTERED_USERS_KEY, JSON.stringify(updatedUsers));
      setUsers(updatedUsers);

      // Then attempt to delete from Firebase
      // Note: This will only work if the user is currently signed in
      // For a complete solution, you'd need admin SDK access
      const currentUser = auth.currentUser;
      if (currentUser?.email === email) {
        await deleteUser(currentUser);
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      // If Firebase deletion fails, at least the user is removed from local storage
    } finally {
      setDeletingUser(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg w-full max-w-4xl h-[80vh] flex flex-col p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <User className="w-6 h-6 text-accent" />
            <h2 className="text-xl font-bold text-text">All Users ({users.length})</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-surface-hover rounded-full transition-colors"
          >
            <X className="w-6 h-6 text-text" />
          </button>
        </div>

        {loading ? (
          <div className="text-center py-4">Loading users...</div>
        ) : (
          <div className="overflow-y-auto flex-1">
            {users.length === 0 ? (
              <div className="text-center text-text-secondary py-8">
                No registered users found
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {users.map((user) => (
                  <div
                    key={user.uid}
                    className={`bg-surface-hover p-4 rounded-lg relative ${
                      user.banned ? 'opacity-75' : ''
                    }`}
                  >
                    <div className="font-medium text-text">
                      {user.displayName || 'Anonymous'}
                      {user.email.toLowerCase() === 'desmenhoward23@gmail.com' && (
                        <span className="ml-2 text-xs bg-accent text-white px-2 py-1 rounded">Admin</span>
                      )}
                      {user.banned && (
                        <span className="ml-2 text-xs bg-red-500 text-white px-2 py-1 rounded">Banned</span>
                      )}
                    </div>
                    <div className="text-sm text-text-secondary">{user.email}</div>
                    <div className="text-xs text-text-secondary mt-1">
                      Joined: {new Date(user.dateJoined).toLocaleDateString()}
                    </div>
                    {user.email.toLowerCase() !== 'desmenhoward23@gmail.com' && (
                      <div className="absolute top-2 right-2 flex gap-2">
                        <button
                          onClick={() => handleBanUser(user.uid)}
                          className={`p-2 rounded-full transition-colors ${
                            user.banned 
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500' 
                              : 'hover:bg-surface text-text-secondary hover:text-red-500'
                          }`}
                          title={user.banned ? 'Unban User' : 'Ban User'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Are you sure you want to delete ${user.email}'s account? This action cannot be undone.`)) {
                              handleDeleteUser(user.uid, user.email);
                            }
                          }}
                          className={`p-2 rounded-full transition-colors hover:bg-surface text-text-secondary hover:text-red-500 ${
                            deletingUser === user.uid ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                          disabled={deletingUser === user.uid}
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
