import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid2
} from '@mui/material';
import type { CarInput } from '@/types';

interface AddCarFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (carData: CarInput) => void;
}

const AddCarForm: React.FC<AddCarFormProps> = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CarInput>({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    color: '',
    mobileImage: '',
    tabletImage: '',
    desktopImage: ''
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CarInput, string>>>({});

  const handleChange = (field: keyof CarInput) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = field === 'year' ? parseInt(event.target.value) || new Date().getFullYear() : event.target.value;
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CarInput, string>> = {};

    if (!formData.make.trim()) {
      newErrors.make = 'Make is required';
    }

    if (!formData.model.trim()) {
      newErrors.model = 'Model is required';
    }

    if (formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }

    if (!formData.color.trim()) {
      newErrors.color = 'Color is required';
    }

    if (!formData.mobileImage.trim()) {
      newErrors.mobileImage = 'Mobile image URL is required';
    }

    if (!formData.tabletImage.trim()) {
      newErrors.tabletImage = 'Tablet image URL is required';
    }

    if (!formData.desktopImage.trim()) {
      newErrors.desktopImage = 'Desktop image URL is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      handleClose();
    }
  };

  const handleClose = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      color: '',
      mobileImage: '',
      tabletImage: '',
      desktopImage: ''
    });
    setErrors({});
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add New Car</DialogTitle>
      <DialogContent>
        <Grid2 container spacing={2} sx={{ mt: 1 }}>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Make"
              value={formData.make}
              onChange={handleChange('make')}
              error={!!errors.make}
              helperText={errors.make}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Model"
              value={formData.model}
              onChange={handleChange('model')}
              error={!!errors.model}
              helperText={errors.model}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Year"
              type="number"
              value={formData.year}
              onChange={handleChange('year')}
              error={!!errors.year}
              helperText={errors.year}
            />
          </Grid2>
          <Grid2 size={{ xs: 12, sm: 6 }}>
            <TextField
              fullWidth
              label="Color"
              value={formData.color}
              onChange={handleChange('color')}
              error={!!errors.color}
              helperText={errors.color}
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Mobile Image URL"
              value={formData.mobileImage}
              onChange={handleChange('mobileImage')}
              error={!!errors.mobileImage}
              helperText={errors.mobileImage}
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Tablet Image URL"
              value={formData.tabletImage}
              onChange={handleChange('tabletImage')}
              error={!!errors.tabletImage}
              helperText={errors.tabletImage}
            />
          </Grid2>
          <Grid2 size={{ xs: 12 }}>
            <TextField
              fullWidth
              label="Desktop Image URL"
              value={formData.desktopImage}
              onChange={handleChange('desktopImage')}
              error={!!errors.desktopImage}
              helperText={errors.desktopImage}
            />
          </Grid2>
        </Grid2>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Add Car
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCarForm;