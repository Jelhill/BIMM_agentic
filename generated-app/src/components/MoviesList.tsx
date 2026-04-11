import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Alert,
  CircularProgress,
  Fab,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import AddIcon from '@mui/icons-material/Add';
import { useMovies, Movie } from '@/hooks/useMovies';
import { MovieCard } from './MovieCard';
import { SearchAndSort } from './SearchAndSort';
import { AddMovieForm } from './AddMovieForm';

export const MoviesList: React.FC = () => {
  const { movies, loading, error, refetch } = useMovies();
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleFilteredMoviesChange = (filtered: Movie[]) => {
    setFilteredMovies(filtered);
  };

  const handleOpenAddForm = () => {
    setIsAddFormOpen(true);
  };

  const handleCloseAddForm = () => {
    setIsAddFormOpen(false);
  };

  const handleRetry = () => {
    refetch();
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="400px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ mt: 4 }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={handleRetry}>
                Retry
              </Button>
            }
          >
            Error loading movies: {error.message}
          </Alert>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
            flexWrap: 'wrap',
            gap: 2
          }}
        >
          <Typography variant="h3" component="h1">
            Movie Collection
          </Typography>
          {!isMobile && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddForm}
              size="large"
            >
              Add Movie
            </Button>
          )}
        </Box>

        <SearchAndSort
          movies={movies}
          onFilteredMoviesChange={handleFilteredMoviesChange}
        />

        {filteredMovies.length === 0 && movies.length > 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              mt: 8,
              mb: 8
            }}
          >
            <Typography variant="h6" color="text.secondary">
              No movies match your search criteria.
            </Typography>
          </Box>
        ) : filteredMovies.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              mt: 8,
              mb: 8
            }}
          >
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No movies in your collection yet.
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Start by adding your first movie!
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleOpenAddForm}
              size="large"
            >
              Add Your First Movie
            </Button>
          </Box>
        ) : (
          <Grid2 container spacing={3}>
            {filteredMovies.map((movie) => (
              <Grid2
                key={movie.id}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                  lg: 3
                }}
              >
                <MovieCard movie={movie} />
              </Grid2>
            ))}
          </Grid2>
        )}

        {isMobile && (
          <Fab
            color="primary"
            aria-label="add movie"
            sx={{
              position: 'fixed',
              bottom: 16,
              right: 16
            }}
            onClick={handleOpenAddForm}
          >
            <AddIcon />
          </Fab>
        )}

        <AddMovieForm
          open={isAddFormOpen}
          onClose={handleCloseAddForm}
        />
      </Box>
    </Container>
  );
};

export default MoviesList;