import { graphql, HttpResponse } from 'msw';
import { seedBooks, seedCars, addBookToMockData } from '@/mocks/data';

export const handlers = [
  graphql.query('GetBooks', () => {
    return HttpResponse.json({
      data: {
        books: seedBooks
      }
    });
  }),

  graphql.mutation('AddBook', ({ variables }) => {
    const { input } = variables as { input: any };
    const newBook = addBookToMockData(input);
    
    return HttpResponse.json({
      data: {
        addBook: newBook
      }
    });
  }),

  graphql.query('GetCars', () => {
    return HttpResponse.json({
      data: {
        cars: seedCars
      }
    });
  }),

  graphql.query('GetCar', ({ variables }) => {
    const { id } = variables as { id: string };
    const car = seedCars.find(car => car.id === id);
    
    return HttpResponse.json({
      data: {
        car
      }
    });
  }),

  graphql.mutation('AddCar', ({ variables }) => {
    const { input } = variables as { input: any };
    const newCar = {
      ...input,
      id: (seedCars.length + 1).toString()
    };
    seedCars.push(newCar);
    
    return HttpResponse.json({
      data: {
        addCar: newCar
      }
    });
  })
];