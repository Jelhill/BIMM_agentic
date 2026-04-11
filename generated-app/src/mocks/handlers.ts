import { graphql, HttpResponse } from 'msw';
import { Car, CreateCarInput } from '../types/car';

let mockCars: Car[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    color: 'Blue',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400&h=300&fit=crop'
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2021,
    color: 'Red',
    image: 'https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=400&h=300&fit=crop'
  },
  {
    id: '3',
    make: 'Ford',
    model: 'Mustang',
    year: 2023,
    color: 'Black',
    image: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400&h=300&fit=crop'
  },
  {
    id: '4',
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    color: 'White',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400&h=300&fit=crop'
  }
];

export const handlers = [
  graphql.query('GetCars', ({ variables }) => {
    const { limit = 10, offset = 0 } = variables as any;
    const paginatedCars = mockCars.slice(offset, offset + limit);
    
    return HttpResponse.json({
      data: {
        cars: paginatedCars
      }
    });
  }),

  graphql.query('GetCar', ({ variables }) => {
    const { id } = variables as any;
    const car = mockCars.find(car => car.id === id);
    
    if (!car) {
      return HttpResponse.json({
        errors: [{ message: 'Car not found' }]
      });
    }

    return HttpResponse.json({
      data: {
        car
      }
    });
  }),

  graphql.mutation('AddCar', ({ variables }) => {
    const { input } = variables as any;
    const newCar: Car = {
      id: (mockCars.length + 1).toString(),
      ...input
    };
    
    mockCars.push(newCar);
    
    return HttpResponse.json({
      data: {
        addCar: newCar
      }
    });
  }),

  graphql.mutation('UpdateCar', ({ variables }) => {
    const { input } = variables as any;
    const carIndex = mockCars.findIndex(car => car.id === input.id);
    
    if (carIndex === -1) {
      return HttpResponse.json({
        errors: [{ message: 'Car not found' }]
      });
    }
    
    mockCars[carIndex] = { ...mockCars[carIndex], ...input };
    
    return HttpResponse.json({
      data: {
        updateCar: mockCars[carIndex]
      }
    });
  }),

  graphql.mutation('DeleteCar', ({ variables }) => {
    const { id } = variables as any;
    const carIndex = mockCars.findIndex(car => car.id === id);
    
    if (carIndex === -1) {
      return HttpResponse.json({
        errors: [{ message: 'Car not found' }]
      });
    }
    
    mockCars.splice(carIndex, 1);
    
    return HttpResponse.json({
      data: {
        deleteCar: true
      }
    });
  })
];