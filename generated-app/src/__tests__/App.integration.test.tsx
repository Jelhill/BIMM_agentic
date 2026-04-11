import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import App from '../App';
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

describe('App Integration Tests', () => {
  const user = userEvent.setup();

  beforeEach(() => {
    server.resetHandlers();
  });

  it('should load cars list and display them', async () => {
    render(<App />);

    expect(screen.getByText('Loading cars...')).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.queryByText('Loading cars...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.getByText('Honda Accord')).toBeInTheDocument();
    expect(screen.getByText('BMW X5')).toBeInTheDocument();
  });

  it('should handle API error and display error message', async () => {
    server.use(
      http.get('/api/cars', () => {
        return new HttpResponse(null, { status: 500 });
      })
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Error loading cars')).toBeInTheDocument();
    });
  });

  it('should add a new car and display it in the list', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading cars...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Car');
    await user.click(addButton);

    expect(screen.getByText('Add New Car')).toBeInTheDocument();

    const makeInput = screen.getByLabelText(/make/i);
    const modelInput = screen.getByLabelText(/model/i);
    const yearInput = screen.getByLabelText(/year/i);
    const colorInput = screen.getByLabelText(/color/i);

    await user.type(makeInput, 'Tesla');
    await user.type(modelInput, 'Model 3');
    await user.type(yearInput, '2023');
    await user.type(colorInput, 'White');

    const submitButton = screen.getByText('Add Car');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Tesla Model 3')).toBeInTheDocument();
    });

    expect(screen.getByText('2023')).toBeInTheDocument();
    expect(screen.getByText('White')).toBeInTheDocument();
  });

  it('should search cars and filter results', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading cars...')).not.toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search cars/i);
    await user.type(searchInput, 'Toyota');

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      expect(screen.queryByText('Honda Accord')).not.toBeInTheDocument();
      expect(screen.queryByText('BMW X5')).not.toBeInTheDocument();
    });

    await user.clear(searchInput);
    await user.type(searchInput, 'Accord');

    await waitFor(() => {
      expect(screen.queryByText('Toyota Camry')).not.toBeInTheDocument();
      expect(screen.getByText('Honda Accord')).toBeInTheDocument();
      expect(screen.queryByText('BMW X5')).not.toBeInTheDocument();
    });
  });

  it('should filter cars by color', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading cars...')).not.toBeInTheDocument();
    });

    const colorFilter = screen.getByLabelText(/filter by color/i);
    await user.click(colorFilter);

    const redOption = screen.getByText('Red');
    await user.click(redOption);

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      expect(screen.queryByText('Honda Accord')).not.toBeInTheDocument();
      expect(screen.queryByText('BMW X5')).not.toBeInTheDocument();
    });
  });

  it('should sort cars by year in ascending order', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading cars...')).not.toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.click(sortSelect);

    const yearAscOption = screen.getByText('Year (Ascending)');
    await user.click(yearAscOption);

    const carItems = screen.getAllByTestId(/car-item-/);
    expect(carItems[0]).toHaveTextContent('BMW X5');
    expect(carItems[1]).toHaveTextContent('Honda Accord');
    expect(carItems[2]).toHaveTextContent('Toyota Camry');
  });

  it('should sort cars by year in descending order', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading cars...')).not.toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.click(sortSelect);

    const yearDescOption = screen.getByText('Year (Descending)');
    await user.click(yearDescOption);

    const carItems = screen.getAllByTestId(/car-item-/);
    expect(carItems[0]).toHaveTextContent('Toyota Camry');
    expect(carItems[1]).toHaveTextContent('Honda Accord');
    expect(carItems[2]).toHaveTextContent('BMW X5');
  });

  it('should sort cars by make alphabetically', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading cars...')).not.toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText(/sort by/i);
    await user.click(sortSelect);

    const makeOption = screen.getByText('Make');
    await user.click(makeOption);

    const carItems = screen.getAllByTestId(/car-item-/);
    expect(carItems[0]).toHaveTextContent('BMW X5');
    expect(carItems[1]).toHaveTextContent('Honda Accord');
    expect(carItems[2]).toHaveTextContent('Toyota Camry');
  });

  it('should combine search, filter, and sort operations', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading cars...')).not.toBeInTheDocument();
    });

    // Add a new car to have more data
    const addButton = screen.getByText('Add Car');
    await user.click(addButton);

    const makeInput = screen.getByLabelText(/make/i);
    const modelInput = screen.getByLabelText(/model/i);
    const yearInput = screen.getByLabelText(/year/i);
    const colorInput = screen.getByLabelText(/color/i);

    await user.type(makeInput, 'Honda');
    await user.type(modelInput, 'Civic');
    await user.type(yearInput, '2019');
    await user.type(colorInput, 'Blue');

    const submitButton = screen.getByText('Add Car');
    await user.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    });

    // Search for Honda cars
    const searchInput = screen.getByPlaceholderText(/search cars/i);
    await user.type(searchInput, 'Honda');

    await waitFor(() => {
      expect(screen.getByText('Honda Accord')).toBeInTheDocument();
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
      expect(screen.queryByText('Toyota Camry')).not.toBeInTheDocument();
    });

    // Filter by blue color
    const colorFilter = screen.getByLabelText(/filter by color/i);
    await user.click(colorFilter);

    const blueOption = screen.getByText('Blue');
    await user.click(blueOption);

    await waitFor(() => {
      expect(screen.queryByText('Honda Accord')).not.toBeInTheDocument();
      expect(screen.getByText('Honda Civic')).toBeInTheDocument();
    });
  });

  it('should handle form validation errors', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading cars...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Car');
    await user.click(addButton);

    const submitButton = screen.getByText('Add Car');
    await user.click(submitButton);

    expect(screen.getByText('Make is required')).toBeInTheDocument();
    expect(screen.getByText('Model is required')).toBeInTheDocument();
  });

  it('should close the form dialog when cancel is clicked', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading cars...')).not.toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Car');
    await user.click(addButton);

    expect(screen.getByText('Add New Car')).toBeInTheDocument();

    const cancelButton = screen.getByText('Cancel');
    await user.click(cancelButton);

    expect(screen.queryByText('Add New Car')).not.toBeInTheDocument();
  });

  it('should reset filters and search when clear is performed', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.queryByText('Loading cars...')).not.toBeInTheDocument();
    });

    // Apply search
    const searchInput = screen.getByPlaceholderText(/search cars/i);
    await user.type(searchInput, 'Toyota');

    // Apply color filter
    const colorFilter = screen.getByLabelText(/filter by color/i);
    await user.click(colorFilter);
    const redOption = screen.getByText('Red');
    await user.click(redOption);

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      expect(screen.queryByText('Honda Accord')).not.toBeInTheDocument();
    });

    // Clear search
    await user.clear(searchInput);

    // Clear color filter
    await user.click(colorFilter);
    const allOption = screen.getByText('All');
    await user.click(allOption);

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      expect(screen.getByText('Honda Accord')).toBeInTheDocument();
      expect(screen.getByText('BMW X5')).toBeInTheDocument();
    });
  });
});