import React, { useState, useMemo } from 'react';
import { Container, Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { useBooks } from '@/hooks/useBooks';
import { SearchAndSort, type SortOption, type FilterOption } from '@/components/SearchAndSort';
import { AddBookForm } from '@/components/AddBookForm';
import { BooksList } from '@/components/BooksList';
import type { Book } from '@/types';

const App: React.FC = () => {
  const { books, loading, error, addBook } = useBooks();
  const [isAddBookOpen, setIsAddBookOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOption, setSortOption] = useState<SortOption>('year_desc');
  const [filterOption, setFilterOption] = useState<FilterOption>('all');

  const filteredAndSortedBooks = useMemo(() => {
    let filtered = books;

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (book: Book) =>
          book.title.toLowerCase().includes(search) ||
          book.author.toLowerCase().includes(search)
      );
    }

    // Filter by read status
    if (filterOption === 'read') {
      filtered = filtered.filter((book: Book) => book.read);
    } else if (filterOption === 'unread') {
      filtered = filtered.filter((book: Book) => !book.read);
    }

    // Sort books
    const sorted = [...filtered].sort((a, b) => {
      switch (sortOption) {
        case 'year_asc':
          return a.year - b.year;
        case 'year_desc':
          return b.year - a.year;
        case 'pages_asc':
          return a.pages - b.pages;
        case 'pages_desc':
          return b.pages - a.pages;
        case 'author_asc':
          return a.author.localeCompare(b.author);
        case 'author_desc':
          return b.author.localeCompare(a.author);
        default:
          return 0;
      }
    });

    return sorted;
  }, [books, searchTerm, sortOption, filterOption]);

  const handleAddBook = async (bookData: Omit<Book, 'id'>) => {
    try {
      await addBook(bookData);
    } catch (error) {
      console.error('Failed to add book:', error);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px',
          }}
        >
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Error loading books: {error.message}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
            flexWrap: 'wrap',
            gap: 2,
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main',
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            My Library
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setIsAddBookOpen(true)}
            size="large"
            sx={{
              borderRadius: 2,
              textTransform: 'none',
              fontSize: '1rem',
              px: 3,
            }}
          >
            Add Book
          </Button>
        </Box>

        <SearchAndSort
          onSearchChange={setSearchTerm}
          onSortChange={setSortOption}
          onFilterChange={setFilterOption}
        />
      </Box>

      <BooksList books={filteredAndSortedBooks} />

      <AddBookForm
        open={isAddBookOpen}
        onClose={() => setIsAddBookOpen(false)}
        addBook={handleAddBook}
      />
    </Container>
  );
};

export default App;