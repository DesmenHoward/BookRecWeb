import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { BookOpen, Clock, X } from 'lucide-react-native';
import { Book } from '../types/book';
import { useBookStore } from '../store/bookStore';

// Theme colors
const THEME = {
  primary: '#7D6E83',
  accent: '#A75D5D',
  background: '#F9F5EB',
  surface: '#EFE3D0',
  text: '#4F4557',
  textLight: '#7D6E83',
  border: '#D0B8A8',
  success: '#6B9080',
  warning: '#DDA15E',
  error: '#BC6C25'
};

interface BookActionButtonsProps {
  book: Book;
}

export default function BookActionButtons({ book }: BookActionButtonsProps) {
  const { updateBookStatus } = useBookStore();
  
  const handleAlreadyRead = () => {
    updateBookStatus(book.id, 'already-read');
  };
  
  const handleReadLater = () => {
    updateBookStatus(book.id, 'read-later');
  };
  
  const handleNotInterested = () => {
    updateBookStatus(book.id, 'not-interested');
  };
  
  // If the book already has a status, show that status
  if (book.status) {
    return (
      <View style={styles.statusContainer}>
        <View style={[
          styles.statusBadge,
          book.status === 'already-read' && styles.alreadyReadBadge,
          book.status === 'read-later' && styles.readLaterBadge,
          book.status === 'not-interested' && styles.notInterestedBadge,
        ]}>
          {book.status === 'already-read' && <BookOpen size={16} color="white" style={styles.statusIcon} />}
          {book.status === 'read-later' && <Clock size={16} color="white" style={styles.statusIcon} />}
          {book.status === 'not-interested' && <X size={16} color="white" style={styles.statusIcon} />}
          
          <Text style={styles.statusText}>
            {book.status === 'already-read' && 'Already Read'}
            {book.status === 'read-later' && 'Read Later'}
            {book.status === 'not-interested' && 'Not Interested'}
          </Text>
        </View>
      </View>
    );
  }
  
  // Otherwise, show the action buttons
  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.button, styles.alreadyReadButton]} 
        onPress={handleAlreadyRead}
      >
        <BookOpen size={18} color="white" />
        <Text style={styles.buttonText}>Already Read</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.readLaterButton]} 
        onPress={handleReadLater}
      >
        <Clock size={18} color="white" />
        <Text style={styles.buttonText}>Read Later</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.button, styles.notInterestedButton]} 
        onPress={handleNotInterested}
      >
        <X size={18} color="white" />
        <Text style={styles.buttonText}>Not Interested</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 15,
    marginBottom: 5,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 8,
  },
  alreadyReadButton: {
    backgroundColor: THEME.success,
  },
  readLaterButton: {
    backgroundColor: THEME.warning,
  },
  notInterestedButton: {
    backgroundColor: THEME.error,
  },
  statusContainer: {
    marginTop: 15,
    marginBottom: 5,
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 6,
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
  },
  alreadyReadBadge: {
    backgroundColor: THEME.success,
  },
  readLaterBadge: {
    backgroundColor: THEME.warning,
  },
  notInterestedBadge: {
    backgroundColor: THEME.error,
  },
});