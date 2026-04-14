import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MockedProvider } from '@apollo/client/testing';
import CarsList from '@/components/CarsList';
import { GET_CARS, ADD_CAR } from '@/graphql/queries';

const mockCars = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    color: 'Blue',
    mobileImage: 'toyota-camry-mobile.jpg',
    tabletImage: 'toyota-camry-tablet.jpg',
    desktopImage: 'toyota-camry-desktop.jpg'
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Accord',
    year: 2021,
    color: 'Red',
    mobileImage: 'honda-accord-mobile.jpg',
    tabletImage: 'honda-accord-tablet.jpg',
    desktopImage: 'honda-accord-desktop.jpg'
  },
  {
    id: '3',
    make: 'Ford',
    model: 'Mustang',
    year: 2023,
    color: 'Black',
    mobileImage: 'ford-mustang-mobile.jpg',
    tabletImage: 'ford-mustang-tablet.jpg',
    desktopImage: 'ford-mustang-desktop.jpg'
  }
];

const successMocks = [
  {
    request: {
      query: GET_CARS,
    },
    result: {
      data: {
        cars: mockCars,
      },
    },
  },
];

const loadingMocks = [
  {
    request: {
      query: GET_CARS,
    },
    result: {
      data: {
        cars: mockCars,
      },
    },
    delay: 1000,
  },
];

const errorMocks = [
  {
    request: {
      query: GET_CARS,
    },
    error: new Error('Failed to fetch cars'),
  },
];

const addCarMocks = [
  ...successMocks,
  {
    request: {
      query: ADD_CAR,
      variables: {
        input: {
          make: 'Tesla',
          model: 'Model 3',
          year: 2024,
          color: 'White',
          mobileImage: 'tesla-model3-mobile.jpg',
          tabletImage: 'tesla-model3-tablet.jpg',
          desktopImage: 'tesla-model3-desktop.jpg'
        }
      }
    },
    result: {
      data: {
        addCar: {
          id: '4',
          make: 'Tesla',
          model: 'Model 3',
          year: 2024,
          color: 'White',
          mobileImage: 'tesla-model3-mobile.jpg',
          tabletImage: 'tesla-model3-tablet.jpg',
          desktopImage: 'tesla-model3-desktop.jpg'
        }
      }
    }
  }
];

describe('CarsList Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders loading state', () => {
    render(
      <MockedProvider mocks={loadingMocks} addTypename={false}>
        <CarsList />
      </MockedProvider>
    );

    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    render(
      <MockedProvider mocks={errorMocks} addTypename={false}>
        <CarsList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/Error loading cars/)).toBeInTheDocument();
      expect(screen.getByText(/Failed to fetch cars/)).toBeInTheDocument();
    });
  });

  it('renders cars list successfully', async () => {
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <CarsList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
      expect(screen.getByText('Honda Accord')).toBeInTheDocument();
      expect(screen.getByText('Ford Mustang')).toBeInTheDocument();
    });

    expect(screen.getByText('2022')).toBeInTheDocument();
    expect(screen.getByText('2021')).toBeInTheDocument();
    expect(screen.getByText('2023')).toBeInTheDocument();
  });

  it('filters cars by search term', async () => {
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <CarsList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/Search by model/);
    fireEvent.change(searchInput, { target: { value: 'Camry' } });

    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.queryByText('Honda Accord')).not.toBeInTheDocument();
    expect(screen.queryByText('Ford Mustang')).not.toBeInTheDocument();
  });

  it('shows no results message when search returns empty', async () => {
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <CarsList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/Search by model/);
    fireEvent.change(searchInput, { target: { value: 'NonExistentCar' } });

    expect(screen.getByText(/No cars found matching your search criteria/)).toBeInTheDocument();
  });

  it('sorts cars by year ascending', async () => {
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <CarsList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText(/Sort by/);
    fireEvent.mouseDown(sortSelect);
    fireEvent.click(screen.getByText('Year (Ascending)'));

    await waitFor(() => {
      const carCards = screen.getAllByText(/\d{4}/);
      expect(carCards[0]).toHaveTextContent('2021');
      expect(carCards[1]).toHaveTextContent('2022');
      expect(carCards[2]).toHaveTextContent('2023');
    });
  });

  it('sorts cars by year descending', async () => {
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <CarsList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText(/Sort by/);
    fireEvent.mouseDown(sortSelect);
    fireEvent.click(screen.getByText('Year (Descending)'));

    await waitFor(() => {
      const carCards = screen.getAllByText(/\d{4}/);
      expect(carCards[0]).toHaveTextContent('2023');
      expect(carCards[1]).toHaveTextContent('2022');
      expect(carCards[2]).toHaveTextContent('2021');
    });
  });

  it('sorts cars by make ascending', async () => {
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <CarsList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText(/Sort by/);
    fireEvent.mouseDown(sortSelect);
    fireEvent.click(screen.getByText('Make (A-Z)'));

    await waitFor(() => {
      const carTitles = screen.getAllByText(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
      expect(carTitles[0]).toHaveTextContent('Ford Mustang');
      expect(carTitles[1]).toHaveTextContent('Honda Accord');
      expect(carTitles[2]).toHaveTextContent('Toyota Camry');
    });
  });

  it('sorts cars by make descending', async () => {
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <CarsList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    const sortSelect = screen.getByLabelText(/Sort by/);
    fireEvent.mouseDown(sortSelect);
    fireEvent.click(screen.getByText('Make (Z-A)'));

    await waitFor(() => {
      const carTitles = screen.getAllByText(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
      expect(carTitles[0]).toHaveTextContent('Toyota Camry');
      expect(carTitles[1]).toHaveTextContent('Honda Accord');
      expect(carTitles[2]).toHaveTextContent('Ford Mustang');
    });
  });

  it('opens add car form when Add Car button is clicked', async () => {
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <CarsList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Car');
    fireEvent.click(addButton);

    expect(screen.getByText('Add New Car')).toBeInTheDocument();
  });

  it('opens add car form when FAB is clicked', async () => {
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <CarsList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    const fab = screen.getByLabelText('add');
    fireEvent.click(fab);

    expect(screen.getByText('Add New Car')).toBeInTheDocument();
  });

  it('adds a new car successfully', async () => {
    render(
      <MockedProvider mocks={addCarMocks} addTypename={false}>
        <CarsList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    const addButton = screen.getByText('Add Car');
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(screen.getByText('Add New Car')).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText('Make'), { target: { value: 'Tesla' } });
    fireEvent.change(screen.getByLabelText('Model'), { target: { value: 'Model 3' } });
    fireEvent.change(screen.getByLabelText('Year'), { target: { value: '2024' } });
    fireEvent.change(screen.getByLabelText('Color'), { target: { value: 'White' } });
    fireEvent.change(screen.getByLabelText('Mobile Image URL'), { target: { value: 'tesla-model3-mobile.jpg' } });
    fireEvent.change(screen.getByLabelText('Tablet Image URL'), { target: { value: 'tesla-model3-tablet.jpg' } });
    fireEvent.change(screen.getByLabelText('Desktop Image URL'), { target: { value: 'tesla-model3-desktop.jpg' } });

    const submitButton = screen.getByRole('button', { name: 'Add Car' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('Add New Car')).not.toBeInTheDocument();
    });
  });

  it('combines search and sort functionality', async () => {
    render(
      <MockedProvider mocks={successMocks} addTypename={false}>
        <CarsList />
      </MockedProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    });

    const searchInput = screen.getByLabelText(/Search by model/);
    fireEvent.change(searchInput, { target: { value: 'a' } });

    expect(screen.getByText('Toyota Camry')).toBeInTheDocument();
    expect(screen.getByText('Honda Accord')).toBeInTheDocument();
    expect(screen.getByText('Ford Mustang')).toBeInTheDocument();

    const sortSelect = screen.getByLabelText(/Sort by/);
    fireEvent.mouseDown(sortSelect);
    fireEvent.click(screen.getByText('Make (A-Z)'));

    await waitFor(() => {
      const carTitles = screen.getAllByText(/^[A-Z][a-z]+ [A-Z][a-z]+$/);
      expect(carTitles[0]).toHaveTextContent('Ford Mustang');
      expect(carTitles[1]).toHaveTextContent('Honda Accord');
      expect(carTitles[2]).toHaveTextContent('Toyota Camry');
    });
  });
});