import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  Box,
} from '@mui/material';
import { useMovies, MovieInput } from '@/hooks/useMovies';

interface AddMovieFormProps {
  open: boolean;
  onClose: () => void;
}

const GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Documentary',
  'Drama',
  'Family',
  'Fantasy',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Thriller',
  'Western',
];

export const AddMovieForm: React.FC<AddMovieFormProps> = ({ open, onClose }) => {
  const { addMovie } = useMovies();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<MovieInput>({
    title: '',
    genre: '',
    year: new Date().getFullYear(),
    rating: 0,
    watched: false,
    poster: '',
  });

  const [formErrors, setFormErrors] = useState<Partial<Record<keyof MovieInput, string>>>({});

  const validateForm = (): boolean => {
    const errors: Partial<Record<keyof MovieInput, string>> = {};

    if (!formData.title.trim()) {
      errors.title = 'Title is required';
    }

    if (!formData.genre) {
      errors.genre = 'Genre is required';
    }

    if (formData.year < 1888 || formData.year > new Date().getFullYear() + 5) {
      errors.year = 'Year must be between 1888 and ' + (new Date().getFullYear() + 5);
    }

    if (formData.rating < 0 || formData.rating > 10) {
      errors.rating = 'Rating must be between 0 and 10';
    }

    if (formData.poster && !isValidUrl(formData.poster)) {
      errors.poster = 'Please enter a valid URL';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: keyof MovieInput, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await addMovie(formData);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while adding the movie');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      genre: '',
      year: new Date().getFullYear(),
      rating: 0,
      watched: false,
      poster: '',
    });
    setFormErrors({});
    setError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Movie</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <TextField
            fullWidth
            label="Title"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            error={!!formErrors.title}
            helperText={formErrors.title}
            margin="normal"
            required
          />

          <FormControl fullWidth margin="normal" error={!!formErrors.genre}>
            <InputLabel>Genre</InputLabel>
            <Select
              value={formData.genre}
              label="Genre"
              onChange={(e) => handleInputChange('genre', e.target.value)}
              required
            >
              {GENRES.map((genre) => (
                <MenuItem key={genre} value={genre}>
                  {genre}
                </MenuItem>
              ))}
            </Select>
            {formErrors.genre && (
              <Box sx={{ color: 'error.main', fontSize: '0.75rem', mt: 0.5, ml: 2 }}>
                {formErrors.genre}
              </Box>
            )}
          </FormControl>

          <TextField
            fullWidth
            label="Year"
            type="number"
            value={formData.year}
            onChange={(e) => handleInputChange('year', parseInt(e.target.value) || 0)}
            error={!!formErrors.year}
            helperText={formErrors.year}
            margin="normal"
            inputProps={{ min: 1888, max: new Date().getFullYear() + 5 }}
            required
          />

          <TextField
            fullWidth
            label="Rating"
            type="number"
            value={formData.rating}
            onChange={(e) => handleInputChange('rating', parseFloat(e.target.value) || 0)}
            error={!!formErrors.rating}
            helperText={formErrors.rating}
            margin="normal"
            inputProps={{ min: 0, max: 10, step: 0.1 }}
            required
          />

          <TextField
            fullWidth
            label="Poster URL"
            value={formData.poster}
            onChange={(e) => handleInputChange('poster', e.target.value)}
            error={!!formErrors.poster}
            helperText={formErrors.poster}
            margin="normal"
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.watched}
                onChange={(e) => handleInputChange('watched', e.target.checked)}
              />
            }
            label="Watched"
            sx={{ mt: 1 }}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
        >
          {loading ? 'Adding...' : 'Add Movie'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};