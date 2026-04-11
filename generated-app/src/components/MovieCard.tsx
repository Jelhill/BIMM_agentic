import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Rating,
  Box
} from '@mui/material';
import { Movie } from '@/types';

interface MovieCardProps {
  movie: Movie;
}

export const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <CardMedia
        component="img"
        height="300"
        image={movie.poster}
        alt={movie.title}
        sx={{ objectFit: 'cover' }}
      />
      <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <Typography variant="h6" component="h2" gutterBottom>
          {movie.title}
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <Typography variant="body2" color="text.secondary">
            {movie.genre}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • {movie.year}
          </Typography>
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Rating value={movie.rating} readOnly size="small" />
          <Typography variant="body2" color="text.secondary">
            {movie.rating}/5
          </Typography>
        </Box>
        
        <Box sx={{ mt: 'auto' }}>
          <Chip
            label={movie.watched ? 'Watched' : 'Not Watched'}
            color={movie.watched ? 'success' : 'default'}
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export default MovieCard;