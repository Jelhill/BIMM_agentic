import React from 'react';
import { Grid2, Box, Typography } from '@mui/material';
import { BookCard } from '@/components/BookCard';
import { Book } from '@/types';

interface BooksListProps {
  books: Book[];
}

export const BooksList: React.FC<BooksListProps> = ({ books }) => {
  if (books.length === 0) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '200px',
          textAlign: 'center',
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No books found
        </Typography>
      </Box>
    );
  }

  return (
    <Grid2 container spacing={{ xs: 2, sm: 3, md: 4 }}>
      {books.map((book) => (
        <Grid2
          key={book.id}
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
          }}
        >
          <BookCard book={book} />
        </Grid2>
      ))}
    </Grid2>
  );
};

export default BooksList;