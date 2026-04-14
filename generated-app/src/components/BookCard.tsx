import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Book } from '@/types';
import BookIcon from '@mui/icons-material/Book';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

  const getImageHeight = () => {
    if (isMobile) return 200;
    if (isTablet) return 240;
    return 280;
  };

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height={getImageHeight()}
        image={book.cover}
        alt={book.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography
          variant="h6"
          component="h2"
          gutterBottom
          sx={{
            fontWeight: 600,
            lineHeight: 1.2,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical'
          }}
        >
          {book.title}
        </Typography>
        
        <Typography
          variant="subtitle1"
          color="text.secondary"
          gutterBottom
          sx={{ fontStyle: 'italic' }}
        >
          by {book.author}
        </Typography>
        
        <Typography
          variant="body2"
          color="text.secondary"
          gutterBottom
        >
          {book.genre} • {book.year}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 2 }}>
          <BookIcon fontSize="small" color="action" />
          <Typography variant="body2" color="text.secondary">
            {book.pages} pages
          </Typography>
        </Box>
        
        <Box sx={{ mt: 'auto' }}>
          <Chip
            label={book.read ? 'Read' : 'Unread'}
            color={book.read ? 'success' : 'default'}
            variant={book.read ? 'filled' : 'outlined'}
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default BookCard;