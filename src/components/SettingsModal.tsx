import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  ScrollView,
  Switch,
  Platform,
  TextInput,
  ActivityIndicator,
  Alert
} from 'react-native';
import { X, ChevronRight } from 'lucide-react-native';
import { useUserProfileStore } from '../store/userProfileStore';

interface SettingsModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'settings' | 'privacy' | 'notifications' | 'appearance' | 'help';
}

export default function SettingsModal({ visible, onClose, type }: SettingsModalProps) {
  const { profile, updateProfile } = useUserProfileStore();
  
  // Form state with default values
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    displayName: '',
    location: '',
    website: '',
    language: 'English',
    socialLinks: {
      Twitter: '',
      instagram: '',
      goodreads: ''
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize form data when modal opens or profile changes
  useEffect(() => {
    if (visible && profile) {
      setFormData({
        email: profile.id || '',
        username: profile.username || '',
        displayName: profile.displayName || '',
        location: profile.location || '',
        website: profile.website || '',
        language: 'English',
        socialLinks: {
          twitter: profile.socialLinks?.twitter || '',
          instagram: profile.socialLinks?.instagram || '',
          goodreads: profile.socialLinks?.goodreads || ''
        }
      });
      setError(null);
    }
  }, [visible, profile]);

  // Early return if profile is not loaded
  if (!profile) {
    return null;
  }
  
  const handleInputChange = (field: string, value: string) => {
    if (field.includes('.')) {
      // Handle nested fields (e.g., socialLinks.twitter)
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('Username is required');
      return false;
    }
    if (!formData.displayName.trim()) {
      setError('Display name is required');
      return false;
    }
    if (formData.website && !formData.website.includes('.')) {
      setError('Please enter a valid website');
      return false;
    }
    return true;
  };

  const handleSaveSettings = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      await updateProfile({
        username: formData.username,
        displayName: formData.displayName,
        location: formData.location,
        website: formData.website,
        socialLinks: formData.socialLinks
      });

      Alert.alert(
        'Settings Saved',
        'Your account settings have been updated successfully.',
        [{ text: 'OK', onPress: onClose }]
      );
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Render different content based on settings type
  const renderContent = () => {
    switch (type) {
      case 'settings':
      default:
        return (
          <View style={styles.settingsContainer}>
            <Text style={styles.sectionTitle}>Account Settings</Text>

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                value={formData.email}
                editable={false}
                placeholderTextColor="#666666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.input}
                value={formData.username}
                onChangeText={(value) => handleInputChange('username', value)}
                placeholder="Enter username"
                placeholderTextColor="#666666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Display Name</Text>
              <TextInput
                style={styles.input}
                value={formData.displayName}
                onChangeText={(value) => handleInputChange('displayName', value)}
                placeholder="Enter display name"
                placeholderTextColor="#666666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Location</Text>
              <TextInput
                style={styles.input}
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholder="Enter location"
                placeholderTextColor="#666666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Website</Text>
              <TextInput
                style={styles.input}
                value={formData.website}
                onChangeText={(value) => handleInputChange('website', value)}
                placeholder="Enter website"
                placeholderTextColor="#666666"
                keyboardType="url"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Language</Text>
              <TextInput
                style={styles.input}
                value={formData.language}
                editable={false}
                placeholderTextColor="#666666"
              />
            </View>

            <Text style={styles.sectionTitle}>Social Links</Text>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>X</Text>
              <TextInput
                style={styles.input}
                value={formData.socialLinks.twitter}
                onChangeText={(value) => handleInputChange('socialLinks.twitter', value)}
                placeholder="@username"
                placeholderTextColor="#666666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Instagram</Text>
              <TextInput
                style={styles.input}
                value={formData.socialLinks.instagram}
                onChangeText={(value) => handleInputChange('socialLinks.instagram', value)}
                placeholder="@username"
                placeholderTextColor="#666666"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Goodreads</Text>
              <TextInput
                style={styles.input}
                value={formData.socialLinks.goodreads}
                onChangeText={(value) => handleInputChange('socialLinks.goodreads', value)}
                placeholder="username"
                placeholderTextColor="#666666"
              />
            </View>

            <TouchableOpacity 
              style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
              onPress={handleSaveSettings}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Save Changes</Text>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.settingOption, styles.dangerOption]}
              onPress={() => Alert.alert(
                'Delete Account',
                'Are you sure you want to delete your account? This action cannot be undone.',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Delete', style: 'destructive', onPress: () => Alert.alert('Account Deleted', 'Your account would be deleted.') }
                ]
              )}
            >
              <Text style={styles.dangerText}>Delete Account</Text>
            </TouchableOpacity>
          </View>
        );
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
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <X size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {type === 'settings' && 'Account Settings'}
            {type === 'privacy' && 'Privacy'}
            {type === 'notifications' && 'Notifications'}
            {type === 'appearance' && 'Appearance'}
            {type === 'help' && 'Help & Support'}
          </Text>
          <View style={styles.placeholder} />
        </View>
        
        <ScrollView style={styles.scrollView}>
          {renderContent()}
        </ScrollView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 15,
    backgroundColor: '#111111',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    padding: 5,
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  settingsContainer: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 20,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#FF0000',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  settingOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  dangerOption: {
    marginTop: 30,
    justifyContent: 'center',
    borderBottomWidth: 0,
  },
  dangerText: {
    color: '#FF3B30',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SettingsModal