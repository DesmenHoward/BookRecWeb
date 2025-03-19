import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  FlatList, 
  Image,
  Alert,
  Platform
} from 'react-native';
import { X, Check, Camera, Image as ImageIcon } from 'lucide-react-native';
import { useUserProfileStore } from '../store/userProfileStore';

interface ProfilePhotoModalProps {
  visible: boolean;
  onClose: () => void;
}

// Sample profile pictures from Unsplash
const sampleProfilePictures = [
  'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1552058544-f2b08422138a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1491349174775-aaafddd81942?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1050&q=80',
];

export default function ProfilePhotoModal({ visible, onClose }: ProfilePhotoModalProps) {
  const { profile, updateProfile } = useUserProfileStore();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  
  const handleSelectPhoto = (photoUrl: string) => {
    setSelectedPhoto(photoUrl);
  };
  
  const handleSave = () => {
    if (selectedPhoto) {
      updateProfile({ profilePicture: selectedPhoto });
      onClose();
      
      // Show success message
      Alert.alert(
        'Profile Photo Updated',
        'Your profile photo has been successfully updated.'
      );
    }
  };
  
  const handleTakePicture = () => {
    Alert.alert(
      'Camera Access',
      'This would normally open your camera to take a new profile picture. For this demo, please select from the sample images.'
    );
  };
  
  const handleChooseFromGallery = () => {
    Alert.alert(
      'Gallery Access',
      'This would normally open your photo gallery to choose a profile picture. For this demo, please select from the sample images.'
    );
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
          <Text style={styles.headerTitle}>Change Profile Photo</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={[styles.saveButton, !selectedPhoto && styles.saveButtonDisabled]}
            disabled={!selectedPhoto}
          >
            <Check size={24} color={selectedPhoto ? 'white' : '#666666'} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.currentPhotoContainer}>
          <Image 
            source={{ uri: selectedPhoto || profile.profilePicture }} 
            style={styles.currentPhoto} 
          />
          <Text style={styles.currentPhotoText}>
            {selectedPhoto ? 'Preview' : 'Current Photo'}
          </Text>
        </View>
        
        <View style={styles.optionsContainer}>
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={handleTakePicture}
          >
            <Camera size={24} color="white" />
            <Text style={styles.optionText}>Take Photo</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.optionButton}
            onPress={handleChooseFromGallery}
          >
            <ImageIcon size={24} color="white" />
            <Text style={styles.optionText}>Choose from Gallery</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.sampleContainer}>
          <Text style={styles.sampleTitle}>Sample Profile Pictures</Text>
          <FlatList
            data={sampleProfilePictures}
            keyExtractor={(item) => item}
            numColumns={3}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={[
                  styles.samplePhoto,
                  selectedPhoto === item && styles.selectedPhoto
                ]}
                onPress={() => handleSelectPhoto(item)}
              >
                <Image source={{ uri: item }} style={styles.samplePhotoImage} />
                {selectedPhoto === item && (
                  <View style={styles.selectedOverlay}>
                    <Check size={24} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.sampleList}
          />
        </View>
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
  saveButton: {
    padding: 5,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  currentPhotoContainer: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  currentPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  currentPhotoText: {
    color: '#CCCCCC',
    marginTop: 10,
    fontSize: 14,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  optionButton: {
    alignItems: 'center',
    padding: 10,
  },
  optionText: {
    color: 'white',
    marginTop: 8,
    fontSize: 14,
  },
  sampleContainer: {
    flex: 1,
    padding: 20,
  },
  sampleTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  sampleList: {
    paddingBottom: 20,
  },
  samplePhoto: {
    width: '30%',
    aspectRatio: 1,
    margin: '1.66%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  samplePhotoImage: {
    width: '100%',
    height: '100%',
  },
  selectedPhoto: {
    borderWidth: 2,
    borderColor: '#FF0000',
  },
  selectedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});