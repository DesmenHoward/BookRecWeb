import React from 'react';
import { StyleSheet, View, Text, Image, TouchableOpacity, Platform } from 'react-native';
import { Star, Eye, EyeOff, CreditCard as Edit, Trash2 } from 'lucide-react-native';
import { Book } from '../types/book';
import { Review } from '../types/review';

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

interface ReviewCardProps {
  review: Review;
  onEdit?: () => void;
  onDelete?: () => void;
  onToggleVisibility?: () => void;
  showActions?: boolean;
}

export default function ReviewCard({ 
  review, 
  onEdit, 
  onDelete, 
  onToggleVisibility,
  showActions = false
}: ReviewCardProps) {
  // Format date to a readable string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  // Render stars based on rating
  const renderStars = (rating: number) => {
    return (
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            color="#FFD700"
            fill={rating >= star ? '#FFD700' : 'transparent'}
          />
        ))}
      </View>
    );
  };
  
  return (
    <View style={styles.container}>
      <View style={styles.bookInfoContainer}>
        <Image source={{ uri: review.book.coverUrl }} style={styles.bookCover} />
        <View style={styles.bookDetails}>
          <Text style={styles.bookTitle}>{review.book.title}</Text>
          <Text style={styles.bookAuthor}>by {review.book.author}</Text>
          <View style={styles.ratingContainer}>
            {renderStars(review.rating)}
            <Text style={styles.ratingText}>{review.rating}/5</Text>
          </View>
          <Text style={styles.reviewDate}>Reviewed on {formatDate(review.date)}</Text>
        </View>
      </View>
      
      <Text style={styles.reviewText}>{review.text}</Text>
      
      {showActions && (
        <View style={styles.actionsContainer}>
          {onToggleVisibility && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onToggleVisibility}
            >
              {review.isPublic ? (
                <>
                  <Eye size={16} color={THEME.textLight} />
                  <Text style={styles.actionText}>Public</Text>
                </>
              ) : (
                <>
                  <EyeOff size={16} color={THEME.textLight} />
                  <Text style={styles.actionText}>Private</Text>
                </>
              )}
            </TouchableOpacity>
          )}
          
          {onEdit && (
            <TouchableOpacity 
              style={styles.actionButton} 
              onPress={onEdit}
            >
              <Edit size={16} color={THEME.textLight} />
              <Text style={styles.actionText}>Edit</Text>
            </TouchableOpacity>
          )}
          
          {onDelete && (
            <TouchableOpacity 
              style={[styles.actionButton, styles.deleteButton]} 
              onPress={onDelete}
            >
              <Trash2 size={16} color="#BC6C25" />
              <Text style={[styles.actionText, styles.deleteText]}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: THEME.surface,
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  bookInfoContainer: {
    flexDirection: 'row',
    marginBottom: 15,
  },
  bookCover: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  bookDetails: {
    marginLeft: 15,
    flex: 1,
    justifyContent: 'center',
  },
  bookTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: THEME.text,
    marginBottom: 4,
  },
  bookAuthor: {
    fontSize: 14,
    color: THEME.textLight,
    marginBottom: 10,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    marginRight: 8,
  },
  ratingText: {
    color: '#FFD700',
    fontSize: 14,
    fontWeight: 'bold',
  },
  reviewDate: {
    fontSize: 12,
    color: THEME.textLight,
  },
  reviewText: {
    fontSize: 15,
    color: THEME.text,
    lineHeight: 22,
  },
  actionsContainer: {
    flexDirection: 'row',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: THEME.border,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 15,
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  actionText: {
    color: THEME.textLight,
    fontSize: 14,
    marginLeft: 6,
  },
  deleteButton: {
    marginLeft: 'auto',
  },
  deleteText: {
    color: '#BC6C25',
  },
});