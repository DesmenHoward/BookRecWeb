import React, { useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Image, 
  TouchableOpacity, 
  Modal,
  FlatList,
  Platform,
  Alert
} from 'react-native';
import { Mountain, Plus, X, Search } from 'lucide-react-native';
import { useBookStore } from '../store/bookStore';

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

interface MountRushmoreBooksProps {
  mountRushmoreBooks?: any[];
  onUpdateMountRushmore: (books: any[]) => void;
}

export default function MountRushmoreBooks({ 
  mountRushmoreBooks = [null, null, null, null], 
  onUpdateMountRushmore 
}: MountRushmoreBooksProps) {
  const [selectBookModalVisible, setSelectBookModalVisible] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState<number | null>(null);
  const { favorites } = useBookStore();

  const handleSelectBook = (position: number) => {
    setSelectedPosition(position);
    setSelectBookModalVisible(true);
  };

  const handleBookSelected = (book: any) => {
    if (selectedPosition === null) return;

    // Check if book is already in Mount Rushmore
    if (mountRushmoreBooks.some(b => b?.id === book.id)) {
      Alert.alert(
        'Book Already Selected',
        'This book is already in your Mount Rushmore. Please choose another book.'
      );
      return;
    }

    const newBooks = [...mountRushmoreBooks];
    newBooks[selectedPosition] = book;
    onUpdateMountRushmore(newBooks);
    setSelectBookModalVisible(false);
    setSelectedPosition(null);
  };

  const handleRemoveBook = (position: number) => {
    Alert.alert(
      'Remove Book',
      'Are you sure you want to remove this book from your Mount Rushmore?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            const newBooks = [...mountRushmoreBooks];
            newBooks[position] = null;
            onUpdateMountRushmore(newBooks);
          }
        }
      ]
    );
  };

  const renderBookSlot = (position: number) => {
    const book = mountRushmoreBooks[position];

    return (
      <View style={styles.bookSlotWrapper}>
        {!book ? (
          <TouchableOpacity 
            style={styles.emptySlot}
            onPress={() => handleSelectBook(position)}
          >
            <Plus size={24} color={THEME.accent} />
            <Text style={styles.emptySlotText}>Add Book</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.bookSlot}>
            <Image source={{ uri: book.coverUrl }} style={styles.bookCover} />
            <View style={styles.bookInfo}>
              <Text style={styles.bookTitle} numberOfLines={2}>{book.title}</Text>
              <Text style={styles.bookAuthor} numberOfLines={1}>{book.author}</Text>
            </View>
            <View style={styles.bookActions}>
              <TouchableOpacity 
                style={styles.removeButton}
                onPress={() => handleRemoveBook(position)}
              >
                <X size={16} color={THEME.accent} />
              </TouchableOpacity>
            </View>
          </View>
        )}
        <View style={styles.positionLabelContainer}>
          <Text style={styles.positionLabel}>
            <Text style={styles.positionNumber}>{position + 1}</Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Mountain size={24} color={THEME.accent} />
          <Text style={styles.title}>Mount Rushmore</Text>
        </View>
        <Text style={styles.subtitle}>Your all-time favorite books</Text>
      </View>

      <View style={styles.booksContainer}>
        {[0, 1, 2, 3].map((position) => (
          <View key={position} style={styles.bookSlotContainer}>
            {renderBookSlot(position)}
          </View>
        ))}
      </View>

      <Modal
        visible={selectBookModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectBookModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setSelectBookModalVisible(false)}
              style={styles.closeButton}
            >
              <X size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Book</Text>
            <View style={styles.modalHeaderSpacer} />
          </View>

          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity 
                style={styles.bookListItem}
                onPress={() => handleBookSelected(item)}
              >
                <Image source={{ uri: item.coverUrl }} style={styles.listBookCover} />
                <View style={styles.listBookInfo}>
                  <Text style={styles.listBookTitle}>{item.title}</Text>
                  <Text style={styles.listBookAuthor}>{item.author}</Text>
                </View>
              </TouchableOpacity>
            )}
            contentContainerStyle={styles.bookList}
            ListEmptyComponent={
              <View style={styles.emptyListContainer}>
                <Search size={50} color="#CCCCCC" />
                <Text style={styles.emptyListText}>
                  Add some books to your favorites first
                </Text>
              </View>
            }
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 20,
    marginTop: 15,
    marginHorizontal: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  header: {
    marginBottom: 20,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: THEME.text,
    marginLeft: 10,
  },
  subtitle: {
    fontSize: 14,
    color: THEME.textLight,
  },
  booksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  bookSlotContainer: {
    width: '48%',
    marginBottom: 15,
  },
  bookSlotWrapper: {
    flex: 1,
  },
  emptySlot: {
    height: 200,
    backgroundColor: 'rgba(167, 93, 93, 0.1)',
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: THEME.accent,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySlotText: {
    color: THEME.accent,
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
  },
  bookSlot: {
    height: 200,
    backgroundColor: THEME.background,
    borderRadius: 8,
    overflow: 'hidden',
  },
  bookCover: {
    width: '100%',
    height: 120,
    resizeMode: 'cover',
  },
  bookInfo: {
    padding: 8,
  },
  bookTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME.text,
    marginBottom: 2,
  },
  bookAuthor: {
    fontSize: 12,
    color: THEME.textLight,
  },
  bookActions: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 12,
  },
  removeButton: {
    padding: 4,
  },
  positionLabelContainer: {
    alignItems: 'center',
    marginTop: 4,
  },
  positionLabel: {
    color: THEME.textLight,
    fontSize: 12,
  },
  positionNumber: {
    color: THEME.textLight,
    fontSize: 12,
    fontWeight: '600',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  modalHeader: {
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
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  modalHeaderSpacer: {
    width: 24,
  },
  closeButton: {
    padding: 5,
  },
  bookList: {
    padding: 15,
  },
  bookListItem: {
    flexDirection: 'row',
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  listBookCover: {
    width: 60,
    height: 90,
    borderRadius: 4,
  },
  listBookInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  listBookTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  listBookAuthor: {
    color: '#CCCCCC',
    fontSize: 14,
  },
  emptyListContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  emptyListText: {
    color: '#CCCCCC',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 15,
  },
});