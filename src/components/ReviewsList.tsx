import React, { useState } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useReviewStore } from '../store/reviewStore';
import ReviewCard from './ReviewCard';
import { BookOpen, Plus, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import BookReviewModal from './BookReviewModal';

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

interface ReviewsListProps {
  onAddReview: () => void;
  showOnlyPublic?: boolean;
}

export default function ReviewsList({ onAddReview, showOnlyPublic = false }: ReviewsListProps) {
  const { reviews, toggleReviewVisibility, deleteReview, updateReview } = useReviewStore();
  const [editReviewModalVisible, setEditReviewModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any | null>(null);
  
  // Filter reviews based on showOnlyPublic prop
  const filteredReviews = showOnlyPublic 
    ? reviews.filter(review => review.isPublic)
    : reviews;
  
  const handleToggleVisibility = (reviewId: string) => {
    toggleReviewVisibility(reviewId);
  };
  
  const handleEditReview = (review: any) => {
    setSelectedReview(review);
    setEditReviewModalVisible(true);
  };
  
  const handleUpdateReview = (updatedReview: any) => {
    updateReview(updatedReview.id, updatedReview);
    setEditReviewModalVisible(false);
    setSelectedReview(null);
    
    // Show success message
    Alert.alert(
      'Review Updated',
      'Your book review has been successfully updated!',
      [{ text: 'OK' }]
    );
  };
  
  const handleDeleteReview = (reviewId: string) => {
    Alert.alert(
      'Delete Review',
      'Are you sure you want to delete this review? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            deleteReview(reviewId);
            Alert.alert('Review Deleted', 'Your review has been deleted.');
          },
        },
      ]
    );
  };
  
  if (filteredReviews.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <BookOpen size={50} color={THEME.textLight} />
        <Text style={styles.emptyTitle}>No Reviews Yet</Text>
        <Text style={styles.emptyMessage}>
          {showOnlyPublic 
            ? 'There are no public reviews to show.'
            : 'You haven\'t written any book reviews yet.'}
        </Text>
        {!showOnlyPublic && (
          <TouchableOpacity style={styles.addButton} onPress={onAddReview}>
            <Plus size={20} color="white" />
            <Text style={styles.addButtonText}>Write a Review</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }
  
  return (
    <View style={styles.container}>
      <FlatList
        data={filteredReviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <ReviewCard 
            review={item}
            showActions={!showOnlyPublic}
            onToggleVisibility={() => handleToggleVisibility(item.id)}
            onEdit={() => handleEditReview(item)}
            onDelete={() => handleDeleteReview(item.id)}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
      
      {/* Edit Review Modal */}
      {selectedReview && (
        <BookReviewModal
          visible={editReviewModalVisible}
          onClose={() => {
            setEditReviewModalVisible(false);
            setSelectedReview(null);
          }}
          onSubmit={handleUpdateReview}
          initialBook={selectedReview.book}
          initialReview={selectedReview}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
    marginTop: 15,
    marginBottom: 10,
  },
  emptyMessage: {
    fontSize: 14,
    color: THEME.textLight,
    textAlign: 'center',
    marginBottom: 20,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: THEME.accent,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 25,
  },
  addButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginLeft: 8,
  },
});