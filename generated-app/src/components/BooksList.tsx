import React, { useState, useMemo } from 'react';
import { Box, CircularProgress, Alert, Typography } from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useBooks } from '@/hooks/useBooks';
import { BookCard } from '@/components/BookCard';
import { SearchAndSort, SortField, SortOrder, ReadFilter, filterBooks, sortBooks, filterByReadStatus } from '@/components/SearchAndSort';

export const BooksList: React.FC = () => {
  const { books, loading, error } = useBooks();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('year');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [readFilter, setReadFilter] = useState<ReadFilter>('all');

  const filteredAndSortedBooks = useMemo(() => {
    let result = [...books];
    
    // Apply search filter
    result = filterBooks(result, searchTerm);
    
    // Apply read status filter
    result = filterByReadStatus(result, readFilter);
    
    // Apply sorting
    result = sortBooks(result, sortField, sortOrder);
    
    return result;
  }, [books, searchTerm, readFilter, sortField, sortOrder]);

  const handleSearchChange = (newSearchTerm: string) => {
    setSearchTerm(newSearchTerm);
  };

  const handleSortChange = (field: SortField, order: SortOrder) => {
    setSortField(field);
    setSortOrder(order);
  };

  const handleReadFilterChange = (filter: ReadFilter) => {
    setReadFilter(filter);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading books: {error.message}
      </Alert>
    );
  }

  return (
    <Box>
      <SearchAndSort
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onReadFilterChange={handleReadFilterChange}
      />
      
      {filteredAndSortedBooks.length === 0 ? (
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
          No books found matching your criteria.
        </Typography>
      ) : (
        <Grid2 container spacing={3}>
          {filteredAndSortedBooks.map((book) => (
            <Grid2 key={book.id} size={{ xs: 12, sm: 6, md: 4, lg: 3 }}>
              <BookCard book={book} />
            </Grid2>
          ))}
        </Grid2>
      )}
    </Box>
  );
};

export default BooksList;