import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  useTheme
} from '@mui/material';
import { Book as BookIcon } from '@mui/icons-material';
import { Book } from '@/types';

interface BookCardProps {
  book: Book;
}

export const BookCard: React.FC<BookCardProps> = ({ book }) => {
  const theme = useTheme();

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
      }}
    >
      <CardMedia
        component="img"
        height="200"
        image={book.cover}
        alt={`${book.title} cover`}
        sx={{
          objectFit: 'cover',
          [theme.breakpoints.up('sm')]: {
            height: 250,
          },
          [theme.breakpoints.up('md')]: {
            height: 280,
          },
        }}
      />
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Typography
          variant="h6"
          component="h3"
          gutterBottom
          sx={{
            fontSize: { xs: '1rem', sm: '1.25rem' },
            fontWeight: 600,
            lineHeight: 1.3,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {book.title}
        </Typography>
        
        <Typography
          variant="subtitle1"
          color="text.secondary"
          gutterBottom
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            fontStyle: 'italic',
          }}
        >
          by {book.author}
        </Typography>

        <Box sx={{ mb: 2 }}>
          <Typography
            variant="body2"
            color="primary"
            sx={{
              fontSize: { xs: '0.75rem', sm: '0.875rem' },
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {book.genre}
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            mb: 2,
            flexWrap: 'wrap',
          }}
        >
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            {book.year}
          </Typography>
          <Typography variant="body2" color="text.disabled">
            •
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <BookIcon
              sx={{
                fontSize: { xs: 14, sm: 16 },
                color: 'text.secondary',
              }}
            />
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
            >
              {book.pages} pages
            </Typography>
          </Box>
        </Box>

        <Chip
          label={book.read ? 'Read' : 'Unread'}
          color={book.read ? 'success' : 'default'}
          size="small"
          sx={{
            fontSize: { xs: '0.625rem', sm: '0.75rem' },
            height: { xs: 24, sm: 28 },
          }}
        />
      </CardContent>
    </Card>
  );
};

export default BookCard;