import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useMediaQuery } from '@mui/material';
import ResponsiveCarImage from '@/components/ResponsiveCarImage';
import { Car } from '@/types';

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useMediaQuery: vi.fn(),
    useTheme: vi.fn(() => ({}))
  };
});

const mockCar: Car = {
  id: '1',
  make: 'Tesla',
  model: 'Model 3',
  year: 2023,
  color: 'White',
  mobileImage: 'https://example.com/mobile.jpg',
  tabletImage: 'https://example.com/tablet.jpg',
  desktopImage: 'https://example.com/desktop.jpg'
};

const mockedUseMediaQuery = vi.mocked(useMediaQuery);

describe('ResponsiveCarImage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders mobile image on mobile breakpoint', () => {
    mockedUseMediaQuery.mockReturnValue(true).mockReturnValueOnce(true).mockReturnValueOnce(false).mockReturnValueOnce(false);

    render(<ResponsiveCarImage car={mockCar} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockCar.mobileImage);
    expect(image).toHaveAttribute('alt', '2023 Tesla Model 3 in White');
  });

  it('renders tablet image on tablet breakpoint', () => {
    mockedUseMediaQuery.mockReturnValue(false).mockReturnValueOnce(false).mockReturnValueOnce(true).mockReturnValueOnce(false);

    render(<ResponsiveCarImage car={mockCar} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockCar.tabletImage);
  });

  it('renders desktop image on desktop breakpoint', () => {
    mockedUseMediaQuery.mockReturnValue(false).mockReturnValueOnce(false).mockReturnValueOnce(false).mockReturnValueOnce(true);

    render(<ResponsiveCarImage car={mockCar} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockCar.desktopImage);
  });

  it('falls back to desktop image when no breakpoints match', () => {
    mockedUseMediaQuery.mockReturnValue(false);

    render(<ResponsiveCarImage car={mockCar} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockCar.desktopImage);
  });

  it('uses custom alt text when provided', () => {
    mockedUseMediaQuery.mockReturnValue(false);
    const customAlt = 'Custom alt text';

    render(<ResponsiveCarImage car={mockCar} alt={customAlt} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('alt', customAlt);
  });

  it('uses custom height when provided', () => {
    mockedUseMediaQuery.mockReturnValue(false);

    render(<ResponsiveCarImage car={mockCar} height={300} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('height', '300');
  });

  it('uses default height of 200 when not provided', () => {
    mockedUseMediaQuery.mockReturnValue(false);

    render(<ResponsiveCarImage car={mockCar} />);
    
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('height', '200');
  });
});