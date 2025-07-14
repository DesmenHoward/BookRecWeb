import { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Modal,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { X, Plus, BookOpen } from 'lucide-react';
import { useBookStore } from '../store/bookStore';
import { Book } from '../types/book';
import { useBookClubStore, BookClub } from '../store/bookClubStore';
import { validateBookClub } from '../utils/bookClub';

interface CreateBookClubModalProps {
  visible: boolean;
  onClose: () => void;
  onCreateSuccess?: (club: BookClub) => void;
}

export function CreateBookClubModal({ visible, onClose, onCreateSuccess }: CreateBookClubModalProps) {
  const { favorites } = useBookStore();
  const { createBookClub } = useBookClubStore();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async () => {
    if (!name.trim() || !description.trim() || !selectedBook) {
      setError('Please fill in all fields and select a book');
      return;
    }

    setLoading(true);

    try {
      const newClub = {
        name,
        description,
        categories: selectedCategories,
        currentBook: selectedBook,
        books: [selectedBook],
        coverImage: selectedBook.coverUrl,
        nextMeeting: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      const validationError = validateBookClub(newClub);
      if (validationError) {
        setError(validationError);
        return;
      }
      
      createBookClub(newClub);
      onCreateSuccess?.(newClub);
      
      // Reset form
      setName('');
      setDescription('');
      setSelectedCategories([]);
      setSelectedBook(null);
      
      onClose();
    } catch (error) {
      console.error('Error creating book club:', error);
      setError('Failed to create book club. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={visible}
      onClose={onClose}
      aria-labelledby="create-book-club-modal"
    >
      <Box sx={styles.container}>
        <Box sx={styles.header}>
          <Typography variant="h6">Create Book Club</Typography>
          <Button onClick={onClose}>
            <X size={24} />
          </Button>
        </Box>

        <Box sx={styles.content}>
          <TextField
            fullWidth
            label="Club Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            sx={styles.input}
          />

          <TextField
            fullWidth
            multiline
            rows={4}
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            sx={styles.input}
          />

          <Typography variant="body1" sx={styles.label}>Current Book</Typography>
          {selectedBook ? (
            <Box sx={styles.selectedBook}>
              <BookOpen size={24} />
              <Typography variant="body1" sx={styles.selectedBookText}>
                {selectedBook.title}
              </Typography>
              <Button 
                variant="contained"
                color="primary"
                onClick={() => setShowBookSelector(true)}
                sx={styles.changeButton}
              >
                <Typography variant="body2">Change</Typography>
              </Button>
            </Box>
          ) : (
            <Button 
              variant="contained"
              color="primary"
              onClick={() => setShowBookSelector(true)}
              sx={styles.selectBookButton}
            >
              <Plus size={20} />
              <Typography variant="body1">Select a Book</Typography>
            </Button>
          )}

          {showBookSelector && (
            <Box sx={styles.bookSelector}>
              <Typography variant="body2" sx={styles.sectionTitle}>Select from your favorites</Typography>
              <Box sx={styles.bookList}>
                {favorites.map(book => (
                  <Button
                    key={book.id}
                    onClick={() => handleSelectBook(book)}
                    sx={styles.bookItem}
                  >
                    <BookOpen size={20} />
                    <Typography variant="body2" sx={styles.bookItemText}>{book.title}</Typography>
                  </Button>
                ))}
              </Box>
            </Box>
          )}

          <Typography variant="body1" sx={styles.label}>Categories</Typography>
          <Box sx={styles.categoriesContainer}>
            {selectedBook?.genres.map(genre => (
              <Button
                key={genre}
                onClick={() => handleToggleCategory(genre)}
                sx={[
                  styles.categoryTag,
                  selectedCategories.includes(genre) && styles.categoryTagSelected
                ]}
              >
                <Typography variant="body2">
                  {genre}
                </Typography>
              </Button>
            ))}
          </Box>

          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading || !name.trim() || !description.trim() || !selectedBook}
            sx={styles.submitButton}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              <>
                <Plus size={20} />
                <Typography variant="body1">Create Club</Typography>
              </>
            )}
          </Button>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 3
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2
  },
  input: {
    mb: 2
  },
  submitButton: {
    mt: 2,
    display: 'flex',
    gap: 1,
    alignItems: 'center'
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: 'black',
    mb: 1
  },
  selectedBook: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#F9F5EB',
    borderRadius: 8,
    p: 2,
    mb: 2
  },
  selectedBookText: {
    flex: 1,
    color: 'black',
    fontSize: 16,
    ml: 1
  },
  changeButton: {
    px: 2,
    py: 1,
    borderRadius: 15,
    ml: 1
  },
  selectBookButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F9F5EB',
    borderRadius: 8,
    p: 2,
    mb: 2
  },
  bookSelector: {
    mb: 2
  },
  sectionTitle: {
    fontSize: 14,
    color: '#666666',
    mb: 1
  },
  bookList: {
    maxHeight: 200,
    overflowY: 'auto'
  },
  bookItem: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#F9F5EB',
    borderRadius: 8,
    p: 2,
    mb: 1,
    width: '100%',
    justifyContent: 'flex-start'
  },
  bookItemText: {
    color: 'black',
    fontSize: 14,
    ml: 1
  },
  categoriesContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 1
  },
  categoryTag: {
    backgroundColor: '#F9F5EB',
    px: 2,
    py: 1,
    borderRadius: 15
  },
  categoryTagSelected: {
    backgroundColor: 'rgba(25, 118, 210, 0.1)',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'primary.main'
  }
};