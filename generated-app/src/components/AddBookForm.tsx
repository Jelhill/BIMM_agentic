import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Box,
} from '@mui/material';
import { Book } from '@/types';

interface AddBookFormProps {
  open: boolean;
  onClose: () => void;
  addBook: (book: Omit<Book, 'id'>) => void;
}

export const AddBookForm: React.FC<AddBookFormProps> = ({ open, onClose, addBook }) => {
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    genre: '',
    year: '',
    pages: '',
    read: false,
    cover: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookData: Omit<Book, 'id'> = {
      title: formData.title,
      author: formData.author,
      genre: formData.genre,
      year: parseInt(formData.year),
      pages: parseInt(formData.pages),
      read: formData.read,
      cover: formData.cover,
    };

    addBook(bookData);
    
    // Reset form
    setFormData({
      title: '',
      author: '',
      genre: '',
      year: '',
      pages: '',
      read: false,
      cover: '',
    });
    
    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setFormData({
      title: '',
      author: '',
      genre: '',
      year: '',
      pages: '',
      read: false,
      cover: '',
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Book</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2}>
            <TextField
              name="title"
              label="Title"
              value={formData.title}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="author"
              label="Author"
              value={formData.author}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="genre"
              label="Genre"
              value={formData.genre}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="year"
              label="Year"
              type="number"
              value={formData.year}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="pages"
              label="Pages"
              type="number"
              value={formData.pages}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              name="cover"
              label="Cover URL"
              value={formData.cover}
              onChange={handleChange}
              fullWidth
            />
            <FormControlLabel
              control={
                <Checkbox
                  name="read"
                  checked={formData.read}
                  onChange={handleChange}
                />
              }
              label="Already read"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" variant="contained">Add Book</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddBookForm;