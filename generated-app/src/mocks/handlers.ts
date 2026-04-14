import { graphql, HttpResponse } from 'msw';
import { mockCars } from '@/mocks/data';
import { CarInput } from '@/types';

export const handlers = [
  graphql.query('GetCars', () => {
    return HttpResponse.json({
      data: {
        cars: mockCars
      }
    });
  }),

  graphql.query('GetCar', ({ variables }) => {
    const { id } = variables as { id: string };
    const car = mockCars.find(car => car.id === id);
    
    return HttpResponse.json({
      data: {
        car: car || null
      }
    });
  }),

  graphql.mutation('AddCar', ({ variables }) => {
    const { input } = variables as { input: CarInput };
    const newCar = {
      id: String(mockCars.length + 1),
      ...input
    };
    
    mockCars.push(newCar);
    
    return HttpResponse.json({
      data: {
        addCar: newCar
      }
    });
  })
];