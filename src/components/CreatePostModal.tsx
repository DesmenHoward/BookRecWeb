import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  Switch,
  CircularProgress,
  Avatar,
  Snackbar,
  Alert
} from '@mui/material';
import { X, BookOpen, TriangleAlert } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!user || !profile) {
      setError('You must be logged in to create a post');
      return;
    }

    if (!content.trim()) {
      setError('Please write something before posting');
      return;
    }

    setLoading(true);

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
      setError('Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onClose={onClose}
      aria-labelledby="create-post-modal"
    >
      <Box sx={styles.container}>
        <Typography variant="h6">Create Post</Typography>
        {loading ? (
          <CircularProgress size={20} />
        ) : (
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => handleSubmit()}
            disabled={!content.trim()}
          >
            Post
          </Button>
        )}
        <TextField 
          value={content}
          onChange={(e) => setContent(e.target.value)}
          multiline
          rows={4}
          placeholder="What's on your mind?"
          sx={styles.input}
        />

        {selectedBook ? (
          <Box sx={styles.selectedBook}>
            <Box sx={styles.selectedBookHeader}>
              <Typography variant="body1">Selected Book</Typography>
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => setSelectedBook(null)}
              >
                <X size={16} color="#AAAAAA" />
              </Button>
            </Box>
            <Box sx={styles.selectedBookContent}>
              <Avatar 
                src={selectedBook.coverUrl} 
                sx={styles.selectedBookCover}
              />
              <Box sx={styles.selectedBookInfo}>
                <Typography variant="body1">{selectedBook.title}</Typography>
                <Typography variant="body2">by {selectedBook.author}</Typography>
              </Box>
            </Box>
          </Box>
        ) : (
          <Button 
            variant="contained" 
            color="primary" 
            sx={styles.addBookButton}
            onClick={() => setShowBookSelector(true)}
          >
            <BookOpen size={20} color="white" />
            <Typography variant="button">Add a Book</Typography>
          </Button>
        )}

        {showBookSelector && (
          <Box sx={styles.bookSelector}>
            <Box sx={styles.bookSelectorHeader}>
              <Typography variant="body1">Select a Book</Typography>
              <Button 
                variant="text" 
                color="primary" 
                onClick={() => setShowBookSelector(false)}
              >
                <X size={20} color="#AAAAAA" />
              </Button>
            </Box>
            <Box sx={styles.bookList}>
              {favorites.map(book => (
                <Button 
                  key={book.id}
                  variant="contained" 
                  color="primary" 
                  sx={styles.bookItem}
                  onClick={() => {
                    setSelectedBook(book);
                    setShowBookSelector(false);
                  }}
                >
                  <Avatar 
                    src={book.coverUrl} 
                    sx={styles.bookItemCover}
                  />
                  <Box sx={styles.bookItemInfo}>
                    <Typography variant="body1">{book.title}</Typography>
                    <Typography variant="body2">by {book.author}</Typography>
                  </Box>
                </Button>
              ))}
            </Box>
          </Box>
        )}

        <Box sx={styles.spoilerContainer}>
          <Box sx={styles.spoilerHeader}>
            <Box sx={styles.spoilerHeaderLeft}>
              <TriangleAlert size={18} color="#FF9800" />
              <Typography variant="body1">Contains Spoilers</Typography>
            </Box>
            <Switch
              checked={containsSpoiler}
              onChange={(e) => setContainsSpoiler(e.target.checked)}
              color="primary"
            />
          </Box>

          {containsSpoiler && (
            <Box sx={styles.spoilerOptions}>
              <Typography variant="body2">Spoiler Type</Typography>
              <Box sx={styles.spoilerTypes}>
                {[
                  { id: 'general', label: 'General' },
                  { id: 'plot', label: 'Plot' },
                  { id: 'ending', label: 'Ending' },
                  { id: 'sensitive', label: 'Sensitive' }
                ].map(type => (
                  <Button 
                    key={type.id}
                    variant="contained" 
                    color="primary" 
                    sx={[
                      styles.spoilerType,
                      spoilerType === type.id && styles.spoilerTypeSelected
                    ]}
                    onClick={() => setSpoilerType(type.id as any)}
                  >
                    <Typography variant="button">{type.label}</Typography>
                  </Button>
                ))}
              </Box>

              <Typography variant="body2">Warning Message</Typography>
              <TextField 
                value={spoilerWarning}
                onChange={(e) => setSpoilerWarning(e.target.value)}
                multiline
                rows={2}
                placeholder="Enter warning message"
                sx={styles.spoilerWarningInput}
              />
            </Box>
          )}
        </Box>
        <Snackbar 
          open={!!error} 
          autoHideDuration={6000} 
          onClose={() => setError(null)}
        >
          <Alert severity="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        </Snackbar>
      </Box>
    </Modal>
  );
}

const styles = {
  container: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: '90%',
    maxWidth: 500,
    bgcolor: 'background.paper',
    boxShadow: 24,
    p: 4,
    borderRadius: 2
  },
  postButton: {
    backgroundColor: THEME.accent,
    color: 'white',
    padding: '8px 16px',
    borderRadius: 20,
    marginBottom: 20
  },
  input: {
    width: '100%',
    marginBottom: 20
  },
  selectedBook: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20
  },
  selectedBookHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  selectedBookContent: {
    flexDirection: 'row'
  },
  selectedBookCover: {
    width: 60,
    height: 90,
    borderRadius: 4
  },
  selectedBookInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center'
  },
  addBookButton: {
    backgroundColor: '#222222',
    color: 'white',
    padding: '8px 16px',
    borderRadius: 20,
    marginBottom: 20
  },
  bookSelector: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20
  },
  bookSelectorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15
  },
  bookList: {
    maxHeight: 300
  },
  bookItem: {
    flexDirection: 'row',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333333'
  },
  bookItemCover: {
    width: 40,
    height: 60,
    borderRadius: 4
  },
  bookItemInfo: {
    flex: 1,
    marginLeft: 10,
    justifyContent: 'center'
  },
  spoilerContainer: {
    backgroundColor: '#222222',
    borderRadius: 8,
    padding: 15
  },
  spoilerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  spoilerHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  spoilerOptions: {
    marginTop: 15
  },
  spoilerTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15
  },
  spoilerType: {
    backgroundColor: '#333333',
    color: 'white',
    padding: '4px 8px',
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8
  },
  spoilerTypeSelected: {
    backgroundColor: 'rgba(255, 152, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#FF9800'
  },
  spoilerWarningInput: {
    backgroundColor: '#333333',
    color: 'white',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20
  }
};