import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Platform,
  Alert 
} from 'react-native';
import { X, Check, Plus, BookOpen } from 'lucide-react-native';
import { useBookStore } from '../store/bookStore';
import { useBookClubStore, BookClub } from '../store/bookClubStore';
import { validateBookClub } from '../utils/bookClub';
import { Book } from '../types/book';

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

interface CreateBookClubModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateSuccess?: (club: BookClub) => void;
}

export default function CreateBookClubModal({
  visible,
  onClose,
  onCreateSuccess
}: CreateBookClubModalProps) {
  const { favorites } = useBookStore();
  const { createBookClub } = useBookClubStore();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookSelector, setShowBookSelector] = useState(false);
  
  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setShowBookSelector(false);
    
    // Add book's genres to categories if not already selected
    const newCategories = [...new Set([...selectedCategories, ...book.genres])];
    setSelectedCategories(newCategories);
  };
  
  const handleToggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };
  
  const handleCreate = () => {
    if (!selectedBook) {
      Alert.alert('Error', 'Please select a book for the club');
      return;
    }
    
    const newClub = {
      name,
      description,
      categories: selectedCategories,
      currentBook: selectedBook,
      books: [selectedBook],
      coverImage: selectedBook.coverUrl,
      nextMeeting: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    };
    
    const error = validateBookClub(newClub);
    if (error) {
      Alert.alert('Error', error);
      return;
    }
    
    createBookClub(newClub);
    onCreateSuccess?.(newClub as BookClub);
    
    // Reset form
    setName('');
    setDescription('');
    setSelectedCategories([]);
    setSelectedBook(null);
    
    onClose();
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
          <Text style={styles.headerTitle}>Create Book Club</Text>
          <TouchableOpacity 
            style={[
              styles.createButton,
              (!name || !description || !selectedBook) && styles.createButtonDisabled
            ]}
            onPress={handleCreate}
            disabled={!name || !description || !selectedBook}
          >
            <Check size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Club Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter club name"
              placeholderTextColor="#999999"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe your book club"
              placeholderTextColor="#999999"
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Current Book</Text>
            {selectedBook ? (
              <View style={styles.selectedBook}>
                <BookOpen size={24} color={THEME.accent} />
                <Text style={styles.selectedBookText}>
                  {selectedBook.title}
                </Text>
                <TouchableOpacity 
                  style={styles.changeButton}
                  onPress={() => setShowBookSelector(true)}
                >
                  <Text style={styles.changeButtonText}>Change</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity 
                style={styles.selectBookButton}
                onPress={() => setShowBookSelector(true)}
              >
                <Plus size={20} color={THEME.accent} />
                <Text style={styles.selectBookText}>Select a Book</Text>
              </TouchableOpacity>
            )}
          </View>
          
          {showBookSelector && (
            <View style={styles.bookSelector}>
              <Text style={styles.sectionTitle}>Select from your favorites</Text>
              <ScrollView style={styles.bookList}>
                {favorites.map(book => (
                  <TouchableOpacity
                    key={book.id}
                    style={styles.bookItem}
                    onPress={() => handleSelectBook(book)}
                  >
                    <BookOpen size={20} color={THEME.textLight} />
                    <Text style={styles.bookItemText}>{book.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Categories</Text>
            <View style={styles.categoriesContainer}>
              {selectedBook?.genres.map(genre => (
                <TouchableOpacity
                  key={genre}
                  style={[
                    styles.categoryTag,
                    selectedCategories.includes(genre) && styles.categoryTagSelected
                  ]}
                  onPress={() => handleToggleCategory(genre)}
                >
                  <Text style={[
                    styles.categoryText,
                    selectedCategories.includes(genre) && styles.categoryTextSelected
                  ]}>
                    {genre}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
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
  createButton: {
    backgroundColor: THEME.accent,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: '#666666',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 16,
  },
  textArea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  selectedBook: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 12,
  },
  selectedBookText: {
    flex: 1,
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  changeButton: {
    backgroundColor: THEME.accent,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  selectBookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 12,
  },
  selectBookText: {
    color: THEME.accent,
    fontSize: 16,
    marginLeft: 8,
  },
  bookSelector: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    color: '#CCCCCC',
    marginBottom: 10,
  },
  bookList: {
    maxHeight: 200,
  },
  bookItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
  },
  bookItemText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 10,
  },
  categoriesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  categoryTag: {
    backgroundColor: '#222222',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  categoryTagSelected: {
    backgroundColor: 'rgba(167, 93, 93, 0.2)',
    borderWidth: 1,
    borderColor: THEME.accent,
  },
  categoryText: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  categoryTextSelected: {
    color: THEME.accent,
    fontWeight: '600',
  },
});