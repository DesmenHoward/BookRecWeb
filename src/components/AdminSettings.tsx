import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView, 
  TextInput,
  Platform,
  Alert,
  ActivityIndicator,
  FlatList
} from 'react-native';
import { Users, BookOpen, Database, Hash, MessageCircle, Flag, ChartBar as BarChart, TrendingUp, Clock, MessageSquare, Users as Users2, Bell, BugPlay, X, Search, Ban, CreditCard as Edit, Trash2, Send } from 'lucide-react-native';
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
    <View style={styles.sectionContent}>
      <View style={styles.searchContainer}>
        <Search size={20} color={THEME.textLight} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search users..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filterContainer}>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>All Users</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={styles.filterChipTextActive}>Active</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterChip}>
          <Text style={styles.filterChipText}>Suspended</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.userList}>
        <View style={styles.userItem}>
          <View style={styles.userInfo}>
            <Text style={styles.userName}>John Doe</Text>
            <Text style={styles.userEmail}>john@example.com</Text>
          </View>
          <View style={styles.userActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ban size={18} color={THEME.accent} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Edit size={18} color={THEME.textLight} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  const renderBookManagement = () => (
    <View style={styles.sectionContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>2,345</Text>
          <Text style={styles.statLabel}>API Calls Today</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>85%</Text>
          <Text style={styles.statLabel}>Cache Hit Rate</Text>
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Add Book', 'This would open the book creation form')}
        >
          <BookOpen size={20} color={THEME.accent} />
          <Text style={styles.actionButtonText}>Add Custom Book</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => Alert.alert('Manage Genres', 'This would open the genre management interface')}
        >
          <Hash size={20} color={THEME.accent} />
          <Text style={styles.actionButtonText}>Manage Genres</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderModeration = () => (
    <View style={styles.sectionContent}>
      <View style={styles.moderationStats}>
        <View style={styles.moderationStat}>
          <Flag size={20} color="#FF9800" />
          <Text style={styles.moderationCount}>12</Text>
          <Text style={styles.moderationLabel}>Pending Reports</Text>
        </View>
        <View style={styles.moderationStat}>
          <MessageSquare size={20} color="#F44336" />
          <Text style={styles.moderationCount}>5</Text>
          <Text style={styles.moderationLabel}>Flagged Comments</Text>
        </View>
      </View>

      <View style={styles.reportsList}>
        <Text style={styles.reportsTitle}>Recent Reports</Text>
        {/* Sample report items */}
        <View style={styles.reportItem}>
          <View style={styles.reportInfo}>
            <Text style={styles.reportType}>Inappropriate Content</Text>
            <Text style={styles.reportDetails}>Review #1234 - Reported 2h ago</Text>
          </View>
          <TouchableOpacity style={styles.reviewButton}>
            <Text style={styles.reviewButtonText}>Review</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.sectionContent}>
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsCardContent}>
            <BarChart size={24} color={THEME.accent} />
            <Text style={styles.analyticsTitle}>Most Popular Books</Text>
            <Text style={styles.analyticsValue}>View Report</Text>
          </View>
        </View>
        
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsCardContent}>
            <TrendingUp size={24} color={THEME.accent} />
            <Text style={styles.analyticsTitle}>Genre Trends</Text>
            <Text style={styles.analyticsValue}>View Report</Text>
          </View>
        </View>
        
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsCardContent}>
            <Clock size={24} color={THEME.accent} />
            <Text style={styles.analyticsTitle}>Reading Patterns</Text>
            <Text style={styles.analyticsValue}>View Report</Text>
          </View>
        </View>
        
        <View style={styles.analyticsCard}>
          <View style={styles.analyticsCardContent}>
            <MessageSquare size={24} color={THEME.accent} />
            <Text style={styles.analyticsTitle}>Discussion Activity</Text>
            <Text style={styles.analyticsValue}>View Report</Text>
          </View>
        </View>
      </View>
    </View>
  );

  const renderSystem = () => (
    <View style={styles.sectionContent}>
      <View style={styles.systemActions}>
        <View style={styles.systemAction}>
          <View style={styles.systemActionContent}>
            <Users2 size={24} color={THEME.accent} />
            <Text style={styles.systemActionTitle}>Book Clubs</Text>
            <Text style={styles.systemActionDescription}>Manage official groups</Text>
          </View>
        </View>

        <View style={styles.systemAction}>
          <View style={styles.systemActionContent}>
            <Bell size={24} color={THEME.accent} />
            <Text style={styles.systemActionTitle}>Notifications</Text>
            <Text style={styles.systemActionDescription}>Send announcements</Text>
          </View>
        </View>

        <View style={styles.systemAction}>
          <View style={styles.systemActionContent}>
            <BugPlay size={24} color={THEME.accent} />
            <Text style={styles.systemActionTitle}>Bug Reports</Text>
            <Text style={styles.systemActionDescription}>Track reported issues</Text>
          </View>
        </View>
      </View>
    </View>
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
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Admin Dashboard</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color={THEME.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.navigation}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.navigationContent}
          >
            <TouchableOpacity 
              style={[styles.navItem, activeSection === 'users' && styles.navItemActive]}
              onPress={() => setActiveSection('users')}
            >
              <Users size={20} color={activeSection === 'users' ? THEME.accent : THEME.text} />
              <Text style={[styles.navText, activeSection === 'users' && styles.navTextActive]}>
                Users
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.navItem, activeSection === 'books' && styles.navItemActive]}
              onPress={() => setActiveSection('books')}
            >
              <BookOpen size={20} color={activeSection === 'books' ? THEME.accent : THEME.text} />
              <Text style={[styles.navText, activeSection === 'books' && styles.navTextActive]}>
                Books
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.navItem, activeSection === 'moderation' && styles.navItemActive]}
              onPress={() => setActiveSection('moderation')}
            >
              <MessageCircle size={20} color={activeSection === 'moderation' ? THEME.accent : THEME.text} />
              <Text style={[styles.navText, activeSection === 'moderation' && styles.navTextActive]}>
                Moderation
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.navItem, activeSection === 'analytics' && styles.navItemActive]}
              onPress={() => setActiveSection('analytics')}
            >
              <BarChart size={20} color={activeSection === 'analytics' ? THEME.accent : THEME.text} />
              <Text style={[styles.navText, activeSection === 'analytics' && styles.navTextActive]}>
                Analytics
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.navItem, activeSection === 'system' && styles.navItemActive]}
              onPress={() => setActiveSection('system')}
            >
              <Database size={20} color={activeSection === 'system' ? THEME.accent : THEME.text} />
              <Text style={[styles.navText, activeSection === 'system' && styles.navTextActive]}>
                System
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>

        <ScrollView style={styles.content}>
          {renderContent()}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: THEME.surface,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.text,
  },
  closeButton: {
    padding: 5,
  },
  navigation: {
    backgroundColor: THEME.surface,
    paddingVertical: 10,
  },
  navigationContent: {
    paddingHorizontal: 15,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    marginRight: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: 'rgba(167, 93, 93, 0.1)',
  },
  navText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
  },
  navTextActive: {
    color: THEME.accent,
  },
  content: {
    flex: 1,
  },
  sectionContent: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.surface,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  searchInput: {
    flex: 1,
    height: 40,
    marginLeft: 10,
    color: THEME.text,
  },
  filterContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: THEME.surface,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: 'rgba(167, 93, 93, 0.1)',
  },
  filterChipText: {
    color: THEME.text,
    fontSize: 14,
  },
  filterChipTextActive: {
    color: THEME.accent,
    fontWeight: '600',
  },
  userList: {
    backgroundColor: THEME.surface,
    borderRadius: 10,
    padding: 15,
  },
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
  },
  userEmail: {
    fontSize: 14,
    color: THEME.textLight,
  },
  userActions: {
    flexDirection: 'row',
  },
  actionButton: {
    padding: 8,
    marginLeft: 10,
  },
  statsGrid: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: THEME.surface,
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.accent,
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: THEME.textLight,
    textAlign: 'center',
  },
  actionButtons: {
    backgroundColor: THEME.surface,
    borderRadius: 10,
    padding: 15,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  actionButtonText: {
    marginLeft: 10,
    fontSize: 16,
    color: THEME.text,
  },
  moderationStats: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  moderationStat: {
    flex: 1,
    backgroundColor: THEME.surface,
    borderRadius: 10,
    padding: 15,
    marginRight: 10,
    alignItems: 'center',
  },
  moderationCount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: THEME.text,
    marginVertical: 5,
  },
  moderationLabel: {
    fontSize: 12,
    color: THEME.textLight,
    textAlign: 'center',
  },
  reportsList: {
    backgroundColor: THEME.surface,
    borderRadius: 10,
    padding: 15,
  },
  reportsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 15,
  },
  reportItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: THEME.border,
  },
  reportInfo: {
    flex: 1,
  },
  reportType: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
  },
  reportDetails: {
    fontSize: 12,
    color: THEME.textLight,
  },
  reviewButton: {
    backgroundColor: 'rgba(167, 93, 93, 0.1)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 15,
  },
  reviewButtonText: {
    color: THEME.accent,
    fontSize: 12,
    fontWeight: '600',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -5,
  },
  analyticsCard: {
    width: '50%',
    padding: 5,
  },
  analyticsCardContent: {
    backgroundColor: THEME.surface,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  analyticsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    marginTop: 10,
    marginBottom: 5,
  },
  analyticsValue: {
    fontSize: 12,
    color: THEME.accent,
    fontWeight: '600',
  },
  systemActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    margin: -5,
  },
  systemAction: {
    width: '50%',
    padding: 5,
  },
  systemActionContent: {
    backgroundColor: THEME.surface,
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  systemActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME.text,
    marginTop: 10,
    marginBottom: 5,
  },
  systemActionDescription: {
    fontSize: 12,
    color: THEME.textLight,
    textAlign: 'center',
  },
});