import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Alert,
} from '@mui/material';
import { useCars } from '../hooks/useCars';
import type { CreateCarInput } from '../types/car';

interface AddCarFormProps {
  onSuccess?: () => void;
}

interface FormData {
  make: string;
  model: string;
  year: string;
  color: string;
  image: string;
}

interface FormErrors {
  make?: string;
  model?: string;
  year?: string;
  color?: string;
  image?: string;
}

export const AddCarForm: React.FC<AddCarFormProps> = ({ onSuccess }) => {
  const { addCar } = useCars();
  const [formData, setFormData] = useState<FormData>({
    make: '',
    model: '',
    year: '',
    color: '',
    image: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.make.trim()) {
      newErrors.make = 'Make is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (!formData.year.trim()) {
      newErrors.year = 'Year is required';
    } else {
      const yearNum = parseInt(formData.year);
      if (isNaN(yearNum) || yearNum < 1886 || yearNum > new Date().getFullYear() + 1) {
        newErrors.year = 'Please enter a valid year';
      }
    }

    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }

    if (formData.image && !isValidUrl(formData.image)) {
      newErrors.image = 'Please enter a valid URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidUrl = (string: string): boolean => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: keyof FormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData({ ...formData, [field]: event.target.value });
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
    if (submitSuccess) {
      setSubmitSuccess(false);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const carInput: CreateCarInput = {
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        color: formData.color.trim(),
        image: formData.image.trim() || undefined,
      };

      await addCar(carInput);
      
      setFormData({
        make: '',
        model: '',
        year: '',
        color: '',
        image: '',
      });
      setSubmitSuccess(true);
      onSuccess?.();
    } catch (error) {
      console.error('Error adding car:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Paper elevation={2} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
      <Typography variant="h5" component="h2" gutterBottom>
        Add New Car
      </Typography>
      
      {submitSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Car added successfully!
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Make"
          value={formData.make}
          onChange={handleInputChange('make')}
          error={!!errors.make}
          helperText={errors.make}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Model"
          value={formData.model}
          onChange={handleInputChange('model')}
          error={!!errors.model}
          helperText={errors.model}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Year"
          type="number"
          value={formData.year}
          onChange={handleInputChange('year')}
          error={!!errors.year}
          helperText={errors.year}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Color"
          value={formData.color}
          onChange={handleInputChange('color')}
          error={!!errors.color}
          helperText={errors.color}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Image URL"
          value={formData.image}
          onChange={handleInputChange('image')}
          error={!!errors.image}
          helperText={errors.image}
          margin="normal"
        />
        
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Adding Car...' : 'Add Car'}
        </Button>
      </Box>
    </Paper>
  );
};