import React, { useState } from 'react';
import { 
  Users, 
  BookOpen, 
  Database, 
  Hash, 
  MessageCircle, 
  Flag, 
  TrendingUp, 
  Clock, 
  MessageSquare, 
  Users as Users2, 
  Bell, 
  BugPlay, 
  X, 
  Search, 
  Ban, 
  Edit, 
  Trash2, 
  Send 
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import * as BookStorage from '../utils/bookStorage';

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

interface AdminSettingsProps {
  visible: boolean;
  onClose: () => void;
}

type AdminSection = 
  | 'users'
  | 'books'
  | 'moderation'
  | 'analytics'
  | 'system';

export default function AdminSettings({ visible, onClose }: AdminSettingsProps) {
  const { isAdmin } = useAuthStore();
  const [activeSection, setActiveSection] = useState<AdminSection>('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isAdmin) {
    return null;
  }

  const renderUserManagement = () => (
    <div className="section-content">
      <div className="search-container">
        <Search size={20} color={THEME.textLight} />
        <input
          type="text"
          className="search-input"
          placeholder="Search users..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="filter-container">
        <button className="filter-chip">
          <span className="filter-chip-text">All Users</span>
        </button>
        <button className="filter-chip filter-chip-active">
          <span className="filter-chip-text-active">Active</span>
        </button>
        <button className="filter-chip">
          <span className="filter-chip-text">Suspended</span>
        </button>
      </div>

      <div className="user-list">
        <div className="user-item">
          <div className="user-info">
            <span className="user-name">John Doe</span>
            <span className="user-email">john@example.com</span>
          </div>
          <div className="user-actions">
            <button className="action-button">
              <Ban size={18} color={THEME.accent} />
            </button>
            <button className="action-button">
              <Edit size={18} color={THEME.textLight} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBookManagement = () => (
    <div className="section-content">
      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-value">2,345</span>
          <span className="stat-label">API Calls Today</span>
        </div>
        <div className="stat-card">
          <span className="stat-value">85%</span>
          <span className="stat-label">Cache Hit Rate</span>
        </div>
      </div>

      <div className="action-buttons">
        <button 
          className="action-button"
          onClick={() => alert('Add Book', 'This would open the book creation form')}
        >
          <BookOpen size={20} color={THEME.accent} />
          <span className="action-button-text">Add Custom Book</span>
        </button>

        <button 
          className="action-button"
          onClick={() => alert('Manage Genres', 'This would open the genre management interface')}
        >
          <Hash size={20} color={THEME.accent} />
          <span className="action-button-text">Manage Genres</span>
        </button>
      </div>
    </div>
  );

  const renderModeration = () => (
    <div className="section-content">
      <div className="moderation-stats">
        <div className="moderation-stat">
          <Flag size={20} color="#FF9800" />
          <span className="moderation-count">12</span>
          <span className="moderation-label">Pending Reports</span>
        </div>
        <div className="moderation-stat">
          <MessageSquare size={20} color="#F44336" />
          <span className="moderation-count">5</span>
          <span className="moderation-label">Flagged Comments</span>
        </div>
      </div>

      <div className="reports-list">
        <span className="reports-title">Recent Reports</span>
        {/* Sample report items */}
        <div className="report-item">
          <div className="report-info">
            <span className="report-type">Inappropriate Content</span>
            <span className="report-details">Review #1234 - Reported 2h ago</span>
          </div>
          <button className="review-button">
            <span className="review-button-text">Review</span>
          </button>
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="section-content">
      <div className="analytics-grid">
        <div className="analytics-card">
          <div className="analytics-card-content">
            <TrendingUp size={24} color={THEME.accent} />
            <span className="analytics-title">Most Popular Books</span>
            <span className="analytics-value">View Report</span>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-card-content">
            <Clock size={24} color={THEME.accent} />
            <span className="analytics-title">Genre Trends</span>
            <span className="analytics-value">View Report</span>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-card-content">
            <MessageSquare size={24} color={THEME.accent} />
            <span className="analytics-title">Reading Patterns</span>
            <span className="analytics-value">View Report</span>
          </div>
        </div>
        
        <div className="analytics-card">
          <div className="analytics-card-content">
            <BarChart size={24} color={THEME.accent} />
            <span className="analytics-title">Discussion Activity</span>
            <span className="analytics-value">View Report</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystem = () => (
    <div className="section-content">
      <div className="system-actions">
        <div className="system-action">
          <div className="system-action-content">
            <Users2 size={24} color={THEME.accent} />
            <span className="system-action-title">Book Clubs</span>
            <span className="system-action-description">Manage official groups</span>
          </div>
        </div>

        <div className="system-action">
          <div className="system-action-content">
            <Bell size={24} color={THEME.accent} />
            <span className="system-action-title">Notifications</span>
            <span className="system-action-description">Send announcements</span>
          </div>
        </div>

        <div className="system-action">
          <div className="system-action-content">
            <BugPlay size={24} color={THEME.accent} />
            <span className="system-action-title">Bug Reports</span>
            <span className="system-action-description">Track reported issues</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return renderUserManagement();
      case 'books':
        return renderBookManagement();
      case 'moderation':
        return renderModeration();
      case 'analytics':
        return renderAnalytics();
      case 'system':
        return renderSystem();
      default:
        return null;
    }
  };

  return (
    <div className="modal" style={{ display: visible ? 'block' : 'none' }}>
      <div className="container">
        <div className="header">
          <span className="header-title">Admin Dashboard</span>
          <button className="close-button" onClick={onClose}>
            <X size={24} color={THEME.text} />
          </button>
        </div>

        <div className="navigation">
          <div className="navigation-content">
            <button 
              className={`nav-item ${activeSection === 'users' ? 'nav-item-active' : ''}`}
              onClick={() => setActiveSection('users')}
            >
              <Users size={20} color={activeSection === 'users' ? THEME.accent : THEME.text} />
              <span className={`nav-text ${activeSection === 'users' ? 'nav-text-active' : ''}`}>Users</span>
            </button>

            <button 
              className={`nav-item ${activeSection === 'books' ? 'nav-item-active' : ''}`}
              onClick={() => setActiveSection('books')}
            >
              <BookOpen size={20} color={activeSection === 'books' ? THEME.accent : THEME.text} />
              <span className={`nav-text ${activeSection === 'books' ? 'nav-text-active' : ''}`}>Books</span>
            </button>

            <button 
              className={`nav-item ${activeSection === 'moderation' ? 'nav-item-active' : ''}`}
              onClick={() => setActiveSection('moderation')}
            >
              <MessageCircle size={20} color={activeSection === 'moderation' ? THEME.accent : THEME.text} />
              <span className={`nav-text ${activeSection === 'moderation' ? 'nav-text-active' : ''}`}>Moderation</span>
            </button>

            <button 
              className={`nav-item ${activeSection === 'analytics' ? 'nav-item-active' : ''}`}
              onClick={() => setActiveSection('analytics')}
            >
              <BarChart size={20} color={activeSection === 'analytics' ? THEME.accent : THEME.text} />
              <span className={`nav-text ${activeSection === 'analytics' ? 'nav-text-active' : ''}`}>Analytics</span>
            </button>

            <button 
              className={`nav-item ${activeSection === 'system' ? 'nav-item-active' : ''}`}
              onClick={() => setActiveSection('system')}
            >
              <Database size={20} color={activeSection === 'system' ? THEME.accent : THEME.text} />
              <span className={`nav-text ${activeSection === 'system' ? 'nav-text-active' : ''}`}>System</span>
            </button>
          </div>
        </div>

        <div className="content">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: THEME.background,
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: THEME.surface,
    borderBottom: `1px solid ${THEME.border}`,
  },
  headerTitle: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: THEME.text,
  },
  closeButton: {
    padding: '5px',
  },
  navigation: {
    backgroundColor: THEME.surface,
    padding: '10px',
  },
  navigationContent: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    padding: '15px',
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 15px',
    borderRadius: '20px',
    backgroundColor: 'transparent',
    cursor: 'pointer',
  },
  navItemActive: {
    backgroundColor: 'rgba(167, 93, 93, 0.1)',
  },
  navText: {
    marginLeft: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: THEME.text,
  },
  navTextActive: {
    color: THEME.accent,
  },
  content: {
    flex: 1,
    padding: '20px',
  },
  sectionContent: {
    padding: '20px',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: '10px',
    padding: '15px',
    marginBottom: '15px',
  },
  searchInput: {
    flex: 1,
    height: '40px',
    marginLeft: '10px',
    color: THEME.text,
    padding: '10px',
    border: 'none',
    borderRadius: '10px',
    backgroundColor: THEME.surface,
  },
  filterContainer: {
    display: 'flex',
    marginBottom: '20px',
  },
  filterChip: {
    padding: '15px',
    borderRadius: '20px',
    backgroundColor: THEME.surface,
    marginRight: '10px',
    cursor: 'pointer',
  },
  filterChipActive: {
    backgroundColor: 'rgba(167, 93, 93, 0.1)',
  },
  filterChipText: {
    color: THEME.text,
    fontSize: '14px',
  },
  filterChipTextActive: {
    color: THEME.accent,
    fontWeight: '600',
  },
  userList: {
    backgroundColor: THEME.surface,
    borderRadius: '10px',
    padding: '15px',
  },
  userItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: `1px solid ${THEME.border}`,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: '16px',
    fontWeight: '600',
    color: THEME.text,
  },
  userEmail: {
    fontSize: '14px',
    color: THEME.textLight,
  },
  userActions: {
    display: 'flex',
  },
  actionButton: {
    padding: '8px',
    marginLeft: '10px',
    cursor: 'pointer',
  },
  statsGrid: {
    display: 'flex',
    marginBottom: '20px',
  },
  statCard: {
    flex: 1,
    backgroundColor: THEME.surface,
    borderRadius: '10px',
    padding: '15px',
    marginRight: '10px',
    alignItems: 'center',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: THEME.accent,
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '12px',
    color: THEME.textLight,
    textAlign: 'center',
  },
  actionButtons: {
    backgroundColor: THEME.surface,
    borderRadius: '10px',
    padding: '15px',
  },
  actionButton: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 15px',
    borderBottom: `1px solid ${THEME.border}`,
    cursor: 'pointer',
  },
  actionButtonText: {
    marginLeft: '10px',
    fontSize: '16px',
    color: THEME.text,
  },
  moderationStats: {
    display: 'flex',
    marginBottom: '20px',
  },
  moderationStat: {
    flex: 1,
    backgroundColor: THEME.surface,
    borderRadius: '10px',
    padding: '15px',
    marginRight: '10px',
    alignItems: 'center',
  },
  moderationCount: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: THEME.text,
    margin: '5px 0',
  },
  moderationLabel: {
    fontSize: '12px',
    color: THEME.textLight,
    textAlign: 'center',
  },
  reportsList: {
    backgroundColor: THEME.surface,
    borderRadius: '10px',
    padding: '15px',
  },
  reportsTitle: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: '15px',
  },
  reportItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px',
    borderBottom: `1px solid ${THEME.border}`,
  },
  reportInfo: {
    flex: 1,
  },
  reportType: {
    fontSize: '14px',
    fontWeight: '600',
    color: THEME.text,
  },
  reportDetails: {
    fontSize: '12px',
    color: THEME.textLight,
  },
  reviewButton: {
    backgroundColor: 'rgba(167, 93, 93, 0.1)',
    padding: '6px 12px',
    borderRadius: '15px',
    cursor: 'pointer',
  },
  reviewButtonText: {
    color: THEME.accent,
    fontSize: '12px',
    fontWeight: '600',
  },
  analyticsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: '-5px',
  },
  analyticsCard: {
    width: '50%',
    padding: '5px',
  },
  analyticsCardContent: {
    backgroundColor: THEME.surface,
    borderRadius: '10px',
    padding: '15px',
    alignItems: 'center',
  },
  analyticsTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: THEME.text,
    marginTop: '10px',
    marginBottom: '5px',
  },
  analyticsValue: {
    fontSize: '12px',
    color: THEME.accent,
    fontWeight: '600',
  },
  systemActions: {
    display: 'flex',
    flexWrap: 'wrap',
    margin: '-5px',
  },
  systemAction: {
    width: '50%',
    padding: '5px',
  },
  systemActionContent: {
    backgroundColor: THEME.surface,
    borderRadius: '10px',
    padding: '15px',
    alignItems: 'center',
  },
  systemActionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: THEME.text,
    marginTop: '10px',
    marginBottom: '5px',
  },
  systemActionDescription: {
    fontSize: '12px',
    color: THEME.textLight,
    textAlign: 'center',
  },
};