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
import { CreateCarInput } from '../types/car';

interface AddCarFormProps {
  open: boolean;
  onClose: () => void;
}

export const AddCarForm: React.FC<AddCarFormProps> = ({ open, onClose }) => {
  const { addCar } = useCars();
  const [formData, setFormData] = useState<CreateCarInput>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    imageUrl: '',
  });
  const [errors, setErrors] = useState<Partial<CreateCarInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateCarInput> = {};

    if (!formData.make.trim()) {
      newErrors.make = 'Make is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
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

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleInputChange = (field: keyof CreateCarInput) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = field === 'year' ? parseInt(event.target.value, 10) || 0 : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await addCar(formData);
      handleClose();
    } catch (error) {
      setSubmitError('Failed to add car. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      imageUrl: '',
    });
    setErrors({});
    setSubmitError(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Car</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {submitError && (
              <Alert severity="error">{submitError}</Alert>
            )}
            
            <TextField
              label="Make"
              value={formData.make}
              onChange={handleInputChange('make')}
              error={!!errors.make}
              helperText={errors.make}
              required
              fullWidth
            />

            <TextField
              label="Model"
              value={formData.model}
              onChange={handleInputChange('model')}
              error={!!errors.model}
              helperText={errors.model}
              required
              fullWidth
            />

            <TextField
              label="Year"
              type="number"
              value={formData.year}
              onChange={handleInputChange('year')}
              error={!!errors.year}
              helperText={errors.year}
              required
              fullWidth
              inputProps={{
                min: 1900,
                max: new Date().getFullYear() + 1,
              }}
            />

            <TextField
              label="Color"
              value={formData.color}
              onChange={handleInputChange('color')}
              error={!!errors.color}
              helperText={errors.color}
              required
              fullWidth
            />

            <TextField
              label="Image URL"
              value={formData.imageUrl}
              onChange={handleInputChange('imageUrl')}
              error={!!errors.imageUrl}
              helperText={errors.imageUrl}
              fullWidth
              placeholder="https://example.com/image.jpg"
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