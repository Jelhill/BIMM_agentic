import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';
import { useCars } from '../hooks/useCars';
import { AddCarInput } from '../types/car';

interface AddCarFormProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  make: string;
  model: string;
  year: string;
  color: string;
  imageUrl: string;
}

interface FormErrors {
  make?: string;
  model?: string;
  year?: string;
  color?: string;
  imageUrl?: string;
}

const AddCarForm: React.FC<AddCarFormProps> = ({ open, onClose }) => {
  const { addCar } = useCars();
  const [formData, setFormData] = useState<FormData>({
    make: '',
    model: '',
    year: '',
    color: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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
      const currentYear = new Date().getFullYear();
      if (isNaN(yearNum) || yearNum < 1886 || yearNum > currentYear + 1) {
        newErrors.year = 'Please enter a valid year';
      }
    }

    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }

    if (formData.imageUrl && !isValidUrl(formData.imageUrl)) {
      newErrors.imageUrl = 'Please enter a valid URL';
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
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: '',
      color: '',
      imageUrl: '',
    });
    setErrors({});
    setSubmitError(null);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const carInput: AddCarInput = {
        make: formData.make.trim(),
        model: formData.model.trim(),
        year: parseInt(formData.year),
        color: formData.color.trim(),
        imageUrl: formData.imageUrl.trim() || undefined,
      };

      await addCar(carInput);
      resetForm();
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'An error occurred while adding the car');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Car</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          {submitError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {submitError}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Make"
              value={formData.make}
              onChange={handleInputChange('make')}
              error={!!errors.make}
              helperText={errors.make}
              fullWidth
              required
            />
            <TextField
              label="Model"
              value={formData.model}
              onChange={handleInputChange('model')}
              error={!!errors.model}
              helperText={errors.model}
              fullWidth
              required
            />
            <TextField
              label="Year"
              type="number"
              value={formData.year}
              onChange={handleInputChange('year')}
              error={!!errors.year}
              helperText={errors.year}
              fullWidth
              required
              inputProps={{ min: 1886, max: new Date().getFullYear() + 1 }}
            />
            <TextField
              label="Color"
              value={formData.color}
              onChange={handleInputChange('color')}
              error={!!errors.color}
              helperText={errors.color}
              fullWidth
              required
            />
            <TextField
              label="Image URL"
              value={formData.imageUrl}
              onChange={handleInputChange('imageUrl')}
              error={!!errors.imageUrl}
              helperText={errors.imageUrl || 'Optional: Add a URL for the car image'}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Car'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddCarForm;