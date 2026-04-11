import { graphql, HttpResponse } from 'msw';
import type { Car } from '../types/car';

let carStorage: Car[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    color: 'Silver',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=400',
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2023,
    color: 'Blue',
    image: 'https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?w=400',
  },
  {
    id: '3',
    make: 'Ford',
    model: 'Mustang',
    year: 2021,
    color: 'Red',
    image: 'https://images.unsplash.com/photo-1584345604476-8ec5e12e42dd?w=400',
  },
  {
    id: '4',
    make: 'Tesla',
    model: 'Model 3',
    year: 2023,
    color: 'White',
    image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400',
  },
  {
    id: '5',
    make: 'BMW',
    model: 'X5',
    year: 2022,
    color: 'Black',
    image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400',
  },
];

export const handlers = [
  graphql.query('GetCars', () => {
    return HttpResponse.json({
      data: { cars: carStorage },
    });
  }),

  graphql.mutation('AddCar', ({ variables }) => {
    const { input } = variables as { input: Omit<Car, 'id'> };
    const newCar: Car = {
      id: String(Date.now()),
      ...input,
    };
    carStorage.push(newCar);
    return HttpResponse.json({
      data: { addCar: newCar },
    });
  }),
];
