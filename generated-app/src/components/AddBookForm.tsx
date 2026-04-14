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
  FormControlLabel,
  Checkbox,
  Button,
  Box,
} from '@mui/material';
import Grid2 from '@mui/material/Grid2';
import { useBooks } from '@/hooks/useBooks';
import type { BookInput } from '@/types';

interface AddBookFormProps {
  open: boolean;
  onClose: () => void;
}

const genres = [
  'Fiction',
  'Non-Fiction',
  'Science Fiction',
  'Fantasy',
  'Mystery',
  'Romance',
  'Thriller',
  'Biography',
  'History',
  'Self-Help',
];

export const AddBookForm: React.FC<AddBookFormProps> = ({ open, onClose }) => {
  const { addBook } = useBooks();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<BookInput>({
    title: '',
    author: '',
    genre: '',
    year: new Date().getFullYear(),
    pages: 0,
    read: false,
    cover: '',
  });

  const handleInputChange = (field: keyof BookInput, value: string | number | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await addBook(formData);
      setFormData({
        title: '',
        author: '',
        genre: '',
        year: new Date().getFullYear(),
        pages: 0,
        read: false,
        cover: '',
      });
      onClose();
    } catch (error) {
      console.error('Error adding book:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      title: '',
      author: '',
      genre: '',
      year: new Date().getFullYear(),
      pages: 0,
      read: false,
      cover: '',
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>Add New Book</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Grid2 container spacing={3}>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  required
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Author"
                  value={formData.author}
                  onChange={(e) => handleInputChange('author', e.target.value)}
                  required
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <FormControl fullWidth required>
                  <InputLabel>Genre</InputLabel>
                  <Select
                    value={formData.genre}
                    label="Genre"
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                  >
                    {genres.map((genre) => (
                      <MenuItem key={genre} value={genre}>
                        {genre}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => handleInputChange('year', parseInt(e.target.value, 10))}
                  required
                  inputProps={{ min: 1000, max: new Date().getFullYear() }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Pages"
                  type="number"
                  value={formData.pages}
                  onChange={(e) => handleInputChange('pages', parseInt(e.target.value, 10))}
                  required
                  inputProps={{ min: 1 }}
                />
              </Grid2>
              <Grid2 size={{ xs: 12, md: 6 }}>
                <TextField
                  fullWidth
                  label="Cover URL"
                  value={formData.cover}
                  onChange={(e) => handleInputChange('cover', e.target.value)}
                  placeholder="https://example.com/cover.jpg"
                />
              </Grid2>
              <Grid2 size={{ xs: 12 }}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.read}
                      onChange={(e) => handleInputChange('read', e.target.checked)}
                    />
                  }
                  label="I have read this book"
                />
              </Grid2>
            </Grid2>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Adding...' : 'Add Book'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddBookForm;