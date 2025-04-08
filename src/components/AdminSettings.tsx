import { useState } from 'react';
import {
  Settings,
  Users,
  Book,
  Tag,
  BarChart3,
  Plus
} from 'lucide-react';
import { useAdminStore } from '../store/adminStore';

interface AdminSettingsProps {
  onClose: () => void;
}

export default function AdminSettings({ onClose }: AdminSettingsProps) {
  const { isAdmin } = useAdminStore();
  const [activeSection, setActiveSection] = useState('general');

  if (!isAdmin) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
        <p className="text-gray-600">You do not have admin privileges.</p>
        <button
          onClick={onClose}
          className="mt-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      <nav className="w-64 border-r border-gray-200 bg-gray-50 p-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Admin Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            ×
          </button>
        </div>
        <ul className="space-y-2">
          <li>
            <button
              onClick={() => setActiveSection('general')}
              className={`flex items-center w-full p-3 rounded-lg ${
                activeSection === 'general' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
              }`}
            >
              <Settings size={20} className="mr-3" />
              <span>General</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection('users')}
              className={`flex items-center w-full p-3 rounded-lg ${
                activeSection === 'users' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
              }`}
            >
              <Users size={20} className="mr-3" />
              <span>Users</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection('books')}
              className={`flex items-center w-full p-3 rounded-lg ${
                activeSection === 'books' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
              }`}
            >
              <Book size={20} className="mr-3" />
              <span>Books</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection('genres')}
              className={`flex items-center w-full p-3 rounded-lg ${
                activeSection === 'genres' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
              }`}
            >
              <Tag size={20} className="mr-3" />
              <span>Genres</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => setActiveSection('analytics')}
              className={`flex items-center w-full p-3 rounded-lg ${
                activeSection === 'analytics' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
              }`}
            >
              <BarChart3 size={20} className="mr-3" />
              <span>Analytics</span>
            </button>
          </li>
        </ul>
      </nav>

      <main className="flex-1 p-6 overflow-auto">
        {activeSection === 'general' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">General Settings</h2>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-semibold mb-2">Site Configuration</h3>
                <p className="text-gray-600 text-sm">Configure global site settings and preferences.</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'users' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">User Management</h2>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-semibold mb-2">Active Users</h3>
                <p className="text-gray-600 text-sm">View and manage user accounts.</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'books' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Book Management</h2>
            <div className="space-y-4">
              <button
                onClick={() => alert('Add a new book')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                <span>Add New Book</span>
              </button>
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-semibold mb-2">Book Catalog</h3>
                <p className="text-gray-600 text-sm">Manage your book collection and metadata.</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'genres' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Genre Management</h2>
            <div className="space-y-4">
              <button
                onClick={() => alert('Add a new genre')}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} className="mr-2" />
                <span>Add New Genre</span>
              </button>
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-semibold mb-2">Genre Categories</h3>
                <p className="text-gray-600 text-sm">Organize and manage book genres.</p>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'analytics' && (
          <div>
            <h2 className="text-2xl font-bold mb-6">Analytics</h2>
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg shadow">
                <h3 className="font-semibold mb-2">Usage Statistics</h3>
                <p className="text-gray-600 text-sm">View site analytics and user engagement metrics.</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}