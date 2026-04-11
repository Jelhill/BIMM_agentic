import React from 'react';
import { Car } from '../types/car';

interface SearchAndSortProps {
  cars: Car[];
  onFilteredCarsChange: (filteredCars: Car[]) => void;
}

type SortOption = 'year-asc' | 'year-desc' | 'make-asc' | 'make-desc' | 'model-asc' | 'model-desc';

export const SearchAndSort: React.FC<SearchAndSortProps> = ({ cars, onFilteredCarsChange }) => {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [sortBy, setSortBy] = React.useState<SortOption>('year-desc');

  React.useEffect(() => {
    let filteredCars = cars.filter(car =>
      car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      car.make.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const sortedCars = [...filteredCars].sort((a, b) => {
      switch (sortBy) {
        case 'year-asc':
          return a.year - b.year;
        case 'year-desc':
          return b.year - a.year;
        case 'make-asc':
          return a.make.localeCompare(b.make);
        case 'make-desc':
          return b.make.localeCompare(a.make);
        case 'model-asc':
          return a.model.localeCompare(b.model);
        case 'model-desc':
          return b.model.localeCompare(a.model);
        default:
          return 0;
      }
    });

    onFilteredCarsChange(sortedCars);
  }, [cars, searchTerm, sortBy, onFilteredCarsChange]);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1">
          <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
            Search Cars
          </label>
          <input
            type="text"
            id="search"
            placeholder="Search by make or model..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="md:w-48">
          <label htmlFor="sort" className="block text-sm font-medium text-gray-700 mb-2">
            Sort By
          </label>
          <select
            id="sort"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="year-desc">Year (Newest First)</option>
            <option value="year-asc">Year (Oldest First)</option>
            <option value="make-asc">Make (A-Z)</option>
            <option value="make-desc">Make (Z-A)</option>
            <option value="model-asc">Model (A-Z)</option>
            <option value="model-desc">Model (Z-A)</option>
          </select>
        </div>
      </div>
    </div>
  );
};