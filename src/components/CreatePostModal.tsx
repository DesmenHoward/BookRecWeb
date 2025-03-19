import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Modal, 
  TextInput, 
  ScrollView, 
  Platform,
  Alert,
  Switch,
  ActivityIndicator,
  Image
} from 'react-native';
import { X, Plus, BookOpen, TriangleAlert } from 'lucide-react-native';
import { useBookStore } from '../store/bookStore';
import { useUserProfileStore } from '../store/userProfileStore';
import { useAuthStore } from '../store/authStore';
import { firestore } from '../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

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

interface CreatePostModalProps {
  visible: boolean;
  onClose: () => void;
  onPost: (post: any) => void;
}

export default function CreatePostModal({ visible, onClose, onPost }: CreatePostModalProps) {
  const { user } = useAuthStore();
  const { profile } = useUserProfileStore();
  const { favorites } = useBookStore();
  
  const [content, setContent] = useState('');
  const [selectedBook, setSelectedBook] = useState<any | null>(null);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [containsSpoiler, setContainsSpoiler] = useState(false);
  const [spoilerType, setSpoilerType] = useState<'general' | 'plot' | 'ending' | 'sensitive'>('general');
  const [spoilerWarning, setSpoilerWarning] = useState('This post contains spoilers');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!user || !profile) {
      Alert.alert('Error', 'You must be logged in to create a post');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please write something before posting');
      return;
    }

    setIsLoading(true);

    try {
      const postsRef = collection(firestore, 'posts');
      const newPost = {
        userId: user.uid,
        content: content.trim(),
        timestamp: Timestamp.now(),
        likes: 0,
        comments: 0,
        book: selectedBook,
        containsSpoiler,
        spoilerType: containsSpoiler ? spoilerType : null,
        spoilerWarning: containsSpoiler ? spoilerWarning : null,
        type: selectedBook ? 'book' : 'general'
      };

      await addDoc(postsRef, newPost);
      
      // Clear form
      setContent('');
      setSelectedBook(null);
      setContainsSpoiler(false);
      setSpoilerType('general');
      setSpoilerWarning('This post contains spoilers');
      
      onPost(newPost);
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setIsLoading(false);
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
          <Text style={styles.headerTitle}>Create Post</Text>
          <TouchableOpacity 
            style={[styles.postButton, !content.trim() && styles.postButtonDisabled]}
            onPress={handleSubmit}
            disabled={!content.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.postButtonText}>Post</Text>
            )}
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            placeholderTextColor="#999999"
            multiline
            value={content}
            onChangeText={setContent}
            autoFocus
          />

          {selectedBook ? (
            <View style={styles.selectedBook}>
              <View style={styles.selectedBookHeader}>
                <Text style={styles.selectedBookTitle}>Selected Book</Text>
                <TouchableOpacity onPress={() => setSelectedBook(null)}>
                  <X size={16} color="#AAAAAA" />
                </TouchableOpacity>
              </View>
              <View style={styles.selectedBookContent}>
                <Image 
                  source={{ uri: selectedBook.coverUrl }} 
                  style={styles.selectedBookCover}
                  {...Platform.select({
                    web: {
                      loading: 'lazy',
                      crossOrigin: 'anonymous'
                    }
                  })}
                />
                <View style={styles.selectedBookInfo}>
                  <Text style={styles.selectedBookName}>{selectedBook.title}</Text>
                  <Text style={styles.selectedBookAuthor}>by {selectedBook.author}</Text>
                </View>
              </View>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addBookButton}
              onPress={() => setShowBookSelector(true)}
            >
              <BookOpen size={20} color={THEME.accent} />
              <Text style={styles.addBookText}>Add a Book</Text>
            </TouchableOpacity>
          )}

          {showBookSelector && (
            <View style={styles.bookSelector}>
              <View style={styles.bookSelectorHeader}>
                <Text style={styles.bookSelectorTitle}>Select a Book</Text>
                <TouchableOpacity onPress={() => setShowBookSelector(false)}>
                  <X size={20} color="#AAAAAA" />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.bookList}>
                {favorites.map(book => (
                  <TouchableOpacity
                    key={book.id}
                    style={styles.bookItem}
                    onPress={() => {
                      setSelectedBook(book);
                      setShowBookSelector(false);
                    }}
                  >
                    <Image 
                      source={{ uri: book.coverUrl }} 
                      style={styles.bookItemCover}
                      {...Platform.select({
                        web: {
                          loading: 'lazy',
                          crossOrigin: 'anonymous'
                        }
                      })}
                    />
                    <View style={styles.bookItemInfo}>
                      <Text style={styles.bookItemTitle}>{book.title}</Text>
                      <Text style={styles.bookItemAuthor}>by {book.author}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.spoilerContainer}>
            <View style={styles.spoilerHeader}>
              <View style={styles.spoilerHeaderLeft}>
                <TriangleAlert size={18} color="#FF9800" />
                <Text style={styles.spoilerHeaderText}>Contains Spoilers</Text>
              </View>
              <Switch
                value={containsSpoiler}
                onValueChange={setContainsSpoiler}
                trackColor={{ false: '#444444', true: '#FF9800' }}
                thumbColor={containsSpoiler ? '#FFFFFF' : '#CCCCCC'}
              />
            </View>

            {containsSpoiler && (
              <View style={styles.spoilerOptions}>
                <Text style={styles.spoilerLabel}>Spoiler Type</Text>
                <View style={styles.spoilerTypes}>
                  {[
                    { id: 'general', label: 'General' },
                    { id: 'plot', label: 'Plot' },
                    { id: 'ending', label: 'Ending' },
                    { id: 'sensitive', label: 'Sensitive' }
                  ].map(type => (
                    <TouchableOpacity
                      key={type.id}
                      style={[
                        styles.spoilerType,
                        spoilerType === type.id && styles.spoilerTypeSelected
                      ]}
                      onPress={() => setSpoilerType(type.id as any)}
                    >
                      <Text style={[
                        styles.spoilerTypeText,
                        spoilerType === type.id && styles.spoilerTypeTextSelected
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.spoilerLabel}>Warning Message</Text>
                <TextInput
                  style={styles.spoilerWarningInput}
                  value={spoilerWarning}
                  onChangeText={setSpoilerWarning}
                  placeholder="Enter warning message"
                  placeholderTextColor="#999999"
                />
              </View>
            )}
          </View>
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
  postButton: {
    backgroundColor: THEME.accent,
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#666666',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 15,
  },
  input: {
    color: 'white',
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  addBookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222222',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  addBookText: {
    color: THEME.accent,
    marginLeft: 10,
    fontSize: 16,
  },
  selectedBook: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  selectedBookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedBookTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  selectedBookContent: {
    flexDirection: 'row',
  },
  selectedBookCover: {
    width: 60,
    height: 90,
    borderRadius: 4,
  },
  selectedBookInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  selectedBookName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  selectedBookAuthor: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  bookSelector: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  bookSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  bookSelectorTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bookList: {
    maxHeight: 300,
  },
  bookItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  bookItemCover: {
    width: 40,
    height: 60,
    borderRadius: 4,
  },
  bookItemInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center',
  },
  bookItemTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  bookItemAuthor: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  spoilerContainer: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 15,
  },
  spoilerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spoilerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spoilerHeaderText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  spoilerOptions: {
    marginTop: 15,
  },
  spoilerLabel: {
    color: '#CCCCCC',
    fontSize: 14,
    marginBottom: 10,
  },
  spoilerTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  spoilerType: {
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  spoilerTypeSelected: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#FF9800',
  },
  spoilerTypeText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  spoilerTypeTextSelected: {
    color: '#FF9800',
  },
  spoilerWarningInput: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 14,
  },
});