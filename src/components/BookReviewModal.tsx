import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Modal, 
  TouchableOpacity, 
  TextInput, 
  ScrollView, 
  Platform,
  Image,
  Alert,
  Switch
} from 'react-native';
import { X, Check, Star, BookOpen, TriangleAlert } from 'lucide-react-native';
import { useBookStore } from '../store/bookStore';
import { Book } from '../types/book';
import { Review } from '../types/review';
import SpoilerBlock from './SpoilerBlock';

interface BookReviewModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (review: any) => void;
  initialBook?: Book | null;
  initialReview?: Review | null;
}

export default function BookReviewModal({ 
  visible, 
  onClose, 
  onSubmit,
  initialBook = null,
  initialReview = null
}: BookReviewModalProps) {
  const { favorites } = useBookStore();
  
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  
  // Spoiler settings
  const [containsSpoiler, setContainsSpoiler] = useState(false);
  const [spoilerType, setSpoilerType] = useState<'general' | 'plot' | 'ending' | 'sensitive'>('general');
  const [spoilerWarning, setSpoilerWarning] = useState('This review contains spoilers');
  const [showSpoilerOptions, setShowSpoilerOptions] = useState(false);
  
  // Reset form when modal opens/closes or when initialReview changes
  useEffect(() => {
    if (visible) {
      if (initialReview) {
        // Editing an existing review
        setSelectedBook(initialReview.book);
        setReviewText(initialReview.text);
        setRating(initialReview.rating);
        setIsPublic(initialReview.isPublic);
        setContainsSpoiler(initialReview.containsSpoiler || false);
        setSpoilerType(initialReview.spoilerType || 'general');
        setSpoilerWarning(initialReview.spoilerWarning || 'This review contains spoilers');
      } else {
        // Creating a new review
        setSelectedBook(initialBook);
        setReviewText('');
        setRating(0);
        setIsPublic(true);
        setContainsSpoiler(false);
        setSpoilerType('general');
        setSpoilerWarning('This review contains spoilers');
      }
      setShowBookSelector(false);
      setShowSpoilerOptions(false);
    }
  }, [visible, initialBook, initialReview]);
  
  const handleSelectBook = (book: Book) => {
    setSelectedBook(book);
    setShowBookSelector(false);
  };
  
  const handleRating = (value: number) => {
    setRating(value);
  };
  
  const handleSubmit = () => {
    if (!selectedBook) {
      Alert.alert('Missing Book', 'Please select a book to review.');
      return;
    }
    
    if (rating === 0) {
      Alert.alert('Missing Rating', 'Please rate the book before submitting.');
      return;
    }
    
    if (reviewText.trim() === '') {
      Alert.alert('Missing Review', 'Please write a review before submitting.');
      return;
    }
    
    const review = {
      id: initialReview ? initialReview.id : `review-${Date.now()}`,
      bookId: selectedBook.id,
      book: selectedBook,
      rating,
      text: reviewText,
      date: initialReview ? initialReview.date : new Date().toISOString(),
      isPublic,
      containsSpoiler,
      spoilerType: containsSpoiler ? spoilerType : null,
      spoilerWarning: containsSpoiler ? spoilerWarning : null
    };
    
    onSubmit(review);
    onClose();
  };
  
  const renderStars = () => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleRating(star)}
            style={styles.starButton}
          >
            <Star
              size={32}
              color="#FFD700"
              fill={rating >= star ? '#FFD700' : 'transparent'}
            />
          </TouchableOpacity>
        ))}
        <Text style={styles.ratingText}>
          {rating > 0 ? `${rating}/5` : 'Tap to rate'}
        </Text>
      </View>
    );
  };
  
  const renderBookSelector = () => {
    return (
      <View style={styles.bookSelectorContainer}>
        <View style={styles.bookSelectorHeader}>
          <Text style={styles.bookSelectorTitle}>Select a Book to Review</Text>
          <TouchableOpacity onPress={() => setShowBookSelector(false)}>
            <X size={20} color="#AAAAAA" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.bookList}>
          {favorites.length > 0 ? (
            favorites.map(book => (
              <TouchableOpacity
                key={book.id}
                style={styles.bookItem}
                onPress={() => handleSelectBook(book)}
              >
                <Image source={{ uri: book.coverUrl }} style={styles.bookCover} />
                <View style={styles.bookInfo}>
                  <Text style={styles.bookTitle}>{book.title}</Text>
                  <Text style={styles.bookAuthor}>by {book.author}</Text>
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyBookList}>
              <Text style={styles.emptyBookListText}>
                You haven't added any favorite books yet.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    );
  };
  
  const renderSpoilerOptions = () => {
    if (!showSpoilerOptions) return null;
    
    return (
      <View style={styles.spoilerOptionsContainer}>
        <Text style={styles.spoilerOptionsTitle}>Spoiler Settings</Text>
        
        <Text style={styles.spoilerLabel}>Spoiler Type</Text>
        <View style={styles.spoilerTypesContainer}>
          <TouchableOpacity
            style={[
              styles.spoilerTypeButton,
              spoilerType === 'general' && { 
                backgroundColor: 'rgba(33, 150, 243, 0.2)', 
                borderColor: '#2196F3',
                borderWidth: 1
              }
            ]}
            onPress={() => setSpoilerType('general')}
          >
            <Text style={[
              styles.spoilerTypeText,
              spoilerType === 'general' && { color: '#2196F3' }
            ]}>
              General Spoiler
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.spoilerTypeButton,
              spoilerType === 'plot' && { 
                backgroundColor: 'rgba(255, 152, 0, 0.2)', 
                borderColor: '#FF9800',
                borderWidth: 1
              }
            ]}
            onPress={() => setSpoilerType('plot')}
          >
            <Text style={[
              styles.spoilerTypeText,
              spoilerType === 'plot' && { color: '#FF9800' }
            ]}>
              Plot Spoiler
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.spoilerTypeButton,
              spoilerType === 'ending' && { 
                backgroundColor: 'rgba(244, 67, 54, 0.2)', 
                borderColor: '#F44336',
                borderWidth: 1
              }
            ]}
            onPress={() => setSpoilerType('ending')}
          >
            <Text style={[
              styles.spoilerTypeText,
              spoilerType === 'ending' && { color: '#F44336' }
            ]}>
              Ending Spoiler
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.spoilerTypeButton,
              spoilerType === 'sensitive' && { 
                backgroundColor: 'rgba(156, 39, 176, 0.2)', 
                borderColor: '#9C27B0',
                borderWidth: 1
              }
            ]}
            onPress={() => setSpoilerType('sensitive')}
          >
            <Text style={[
              styles.spoilerTypeText,
              spoilerType === 'sensitive' && { color: '#9C27B0' }
            ]}>
              Sensitive Content
            </Text>
          </TouchableOpacity>
        </View>
        
        <Text style={styles.spoilerLabel}>Spoiler Warning</Text>
        <TextInput
          style={styles.spoilerWarningInput}
          placeholder="Enter a warning message"
          placeholderTextColor="#999999"
          value={spoilerWarning}
          onChangeText={setSpoilerWarning}
        />
        
        <Text style={styles.spoilerPreviewTitle}>Preview</Text>
        <SpoilerBlock
          content={
            <Text style={styles.previewContent}>
              {reviewText || "Your review will appear here"}
            </Text>
          }
          warningText={spoilerWarning}
          spoilerType={spoilerType}
        />
      </View>
    );
  };
  
  const isEditing = !!initialReview;
  
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
            {isEditing ? 'Edit Review' : 'Write a Review'}
          </Text>
          <TouchableOpacity 
            onPress={handleSubmit}
            style={[
              styles.submitButton,
              (!selectedBook || rating === 0 || reviewText.trim() === '') && styles.submitButtonDisabled
            ]}
            disabled={!selectedBook || rating === 0 || reviewText.trim() === ''}
          >
            <Check size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        <ScrollView style={styles.scrollView}>
          {/* Book Selection */}
          {showBookSelector ? (
            renderBookSelector()
          ) : (
            <>
              {selectedBook ? (
                <View style={styles.selectedBookContainer}>
                  <View style={styles.selectedBookHeader}>
                    <Text style={styles.selectedBookTitle}>Book</Text>
                    {!isEditing && (
                      <TouchableOpacity onPress={() => setSelectedBook(null)}>
                        <X size={16} color="#AAAAAA" />
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.selectedBookContent}>
                    <Image source={{ uri: selectedBook.coverUrl }} style={styles.selectedBookCover} />
                    <View style={styles.selectedBookInfo}>
                      <Text style={styles.selectedBookName}>{selectedBook.title}</Text>
                      <Text style={styles.selectedBookAuthor}>by {selectedBook.author}</Text>
                    </View>
                  </View>
                </View>
              ) : (
                <TouchableOpacity 
                  style={styles.selectBookButton}
                  onPress={() => setShowBookSelector(true)}
                >
                  <BookOpen size={24} color="#FF0000" />
                  <Text style={styles.selectBookText}>Select a Book to Review</Text>
                </TouchableOpacity>
              )}
              
              {/* Rating */}
              {renderStars()}
              
              {/* Spoiler Toggle */}
              <View style={styles.spoilerToggleContainer}>
                <View style={styles.spoilerToggleHeader}>
                  <View style={styles.spoilerToggleLeft}>
                    <TriangleAlert size={18} color="#FF9800" />
                    <Text style={styles.spoilerToggleText}>Contains Spoilers</Text>
                  </View>
                  <Switch
                    value={containsSpoiler}
                    onValueChange={(value) => {
                      setContainsSpoiler(value);
                      if (value && !showSpoilerOptions) {
                        setShowSpoilerOptions(true);
                      }
                    }}
                    trackColor={{ false: '#444444', true: '#FF9800' }}
                    thumbColor={containsSpoiler ? '#FFFFFF' : '#CCCCCC'}
                  />
                </View>
                
                {containsSpoiler && (
                  <TouchableOpacity 
                    style={styles.spoilerOptionsButton}
                    onPress={() => setShowSpoilerOptions(!showSpoilerOptions)}
                  >
                    <Text style={styles.spoilerOptionsButtonText}>
                      {showSpoilerOptions ? 'Hide Spoiler Options' : 'Configure Spoiler Options'}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
              
              {/* Spoiler Options */}
              {containsSpoiler && renderSpoilerOptions()}
              
              {/* Review Text */}
              <View style={styles.reviewContainer}>
                <Text style={styles.reviewLabel}>Your Review</Text>
                <TextInput
                  style={styles.reviewInput}
                  placeholder="Share your thoughts about this book..."
                  placeholderTextColor="#999999"
                  multiline
                  value={reviewText}
                  onChangeText={setReviewText}
                />
              </View>
              
              {/* Privacy Setting */}
              <View style={styles.privacyContainer}>
                <Text style={styles.privacyLabel}>Review Privacy</Text>
                <View style={styles.privacyOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.privacyOption,
                      isPublic && styles.privacyOptionSelected
                    ]}
                    onPress={() => setIsPublic(true)}
                  >
                    <Text style={[
                      styles.privacyOptionText,
                      isPublic && styles.privacyOptionTextSelected
                    ]}>Public</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[
                      styles.privacyOption,
                      !isPublic && styles.privacyOptionSelected
                    ]}
                    onPress={() => setIsPublic(false)}
                  >
                    <Text style={[
                      styles.privacyOptionText,
                      !isPublic && styles.privacyOptionTextSelected
                    ]}>Private</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.privacyDescription}>
                  {isPublic 
                    ? 'Your review will be visible to other users in your feed.'
                    : 'Your review will only be visible to you.'}
                </Text>
              </View>
            </>
          )}
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
  submitButton: {
    backgroundColor: '#FF0000',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitButtonDisabled: {
    backgroundColor: '#666666',
  },
  scrollView: {
    flex: 1,
  },
  selectBookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111111',
    padding: 20,
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  selectBookText: {
    color: '#FF0000',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  starsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#111111',
    padding: 20,
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 10,
    flexWrap: 'wrap',
  },
  starButton: {
    padding: 5,
  },
  ratingText: {
    color: '#CCCCCC',
    fontSize: 16,
    marginTop: 10,
    width: '100%',
    textAlign: 'center',
  },
  spoilerToggleContainer: {
    backgroundColor: '#111111',
    padding: 15,
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  spoilerToggleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  spoilerToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  spoilerToggleText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 10,
  },
  spoilerOptionsButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  spoilerOptionsButtonText: {
    color: '#FF9800',
    fontSize: 14,
  },
  spoilerOptionsContainer: {
    backgroundColor: '#222222',
    padding: 15,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 8,
  },
  spoilerOptionsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  spoilerLabel: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
  },
  spoilerTypesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  spoilerTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: '#333333',
  },
  spoilerTypeText: {
    color: '#CCCCCC',
    fontSize: 12,
    fontWeight: '600',
  },
  spoilerWarningInput: {
    backgroundColor: '#333333',
    borderRadius: 8,
    padding: 12,
    color: 'white',
    fontSize: 14,
    marginBottom: 15,
  },
  spoilerPreviewTitle: {
    color: 'white',
    fontSize: 14,
    marginBottom: 8,
  },
  previewContent: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
  },
  reviewContainer: {
    backgroundColor: '#111111',
    padding: 20,
    marginTop: 20,
    marginHorizontal: 15,
    borderRadius: 10,
  },
  reviewLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  reviewInput: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 15,
    color: 'white',
    fontSize: 16,
    minHeight: 150,
    textAlignVertical: 'top',
  },
  privacyContainer: {
    backgroundColor: '#111111',
    padding: 20,
    marginTop: 20,
    marginHorizontal: 15,
    marginBottom: 30,
    borderRadius: 10,
  },
  privacyLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  privacyOptions: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  privacyOption: {
    flex: 1,
    padding: 10,
    alignItems: 'center',
    backgroundColor: '#222222',
    marginRight: 10,
    borderRadius: 5,
  },
  privacyOptionSelected: {
    backgroundColor: 'rgba(255, 0, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  privacyOptionText: {
    color: '#CCCCCC',
    fontWeight: '600',
  },
  privacyOptionTextSelected: {
    color: '#FF0000',
  },
  privacyDescription: {
    color: '#999999',
    fontSize: 14,
    fontStyle: 'italic',
  },
  bookSelectorContainer: {
    padding: 15,
    marginTop: 15,
  },
  bookSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  bookSelectorTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  bookList: {
    maxHeight: 400,
  },
  bookItem: {
    flexDirection: 'row',
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  bookCover: {
    width: 40,
    height: 60,
    borderRadius: 4,
  },
  bookInfo: {
    marginLeft: 10,
    justifyContent: 'center',
  },
  bookTitle: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  bookAuthor: {
    color: '#CCCCCC',
    fontSize: 12,
  },
  emptyBookList: {
    padding: 20,
    alignItems: 'center',
  },
  emptyBookListText: {
    color: '#AAAAAA',
    textAlign: 'center',
  },
  selectedBookContainer: {
    margin: 15,
    backgroundColor: '#111111',
    borderRadius: 8,
    padding: 12,
  },
  selectedBookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  selectedBookTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  selectedBookContent: {
    flexDirection: 'row',
  },
  selectedBookCover: {
    width: 50,
    height: 75,
    borderRadius: 4,
  },
  selectedBookInfo: {
    marginLeft: 12,
    justifyContent: 'center',
  },
  selectedBookName: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  selectedBookAuthor: {
    color: '#CCCCCC',
    fontSize: 12,
  },
});