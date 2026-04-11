import { graphql } from 'msw';

interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  color: string;
  image: string;
}

let cars: Car[] = [
  {
    id: '1',
    make: 'Toyota',
    model: 'Camry',
    year: 2023,
    color: 'Silver',
    image: 'https://via.placeholder.com/400x300/silver/000000?text=Toyota+Camry'
  },
  {
    id: '2',
    make: 'Honda',
    model: 'Civic',
    year: 2022,
    color: 'Blue',
    image: 'https://via.placeholder.com/400x300/blue/ffffff?text=Honda+Civic'
  },
  {
    id: '3',
    make: 'Ford',
    model: 'Mustang',
    year: 2024,
    color: 'Red',
    image: 'https://via.placeholder.com/400x300/red/ffffff?text=Ford+Mustang'
  },
  {
    id: '4',
    make: 'BMW',
    model: '3 Series',
    year: 2023,
    color: 'Black',
    image: 'https://via.placeholder.com/400x300/000000/ffffff?text=BMW+3+Series'
  },
  {
    id: '5',
    make: 'Mercedes-Benz',
    model: 'C-Class',
    year: 2022,
    color: 'White',
    image: 'https://via.placeholder.com/400x300/ffffff/000000?text=Mercedes+C-Class'
  },
  {
    id: '6',
    make: 'Audi',
    model: 'A4',
    year: 2023,
    color: 'Gray',
    image: 'https://via.placeholder.com/400x300/gray/ffffff?text=Audi+A4'
  },
  {
    id: '7',
    make: 'Tesla',
    model: 'Model 3',
    year: 2024,
    color: 'Pearl White',
    image: 'https://via.placeholder.com/400x300/f5f5f5/000000?text=Tesla+Model+3'
  },
  {
    id: '8',
    make: 'Chevrolet',
    model: 'Corvette',
    year: 2023,
    color: 'Yellow',
    image: 'https://via.placeholder.com/400x300/yellow/000000?text=Chevrolet+Corvette'
  }
];

export const handlers = [
  graphql.query('GetCars', () => {
    return new Response(
      JSON.stringify({
        data: {
          cars
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }),

  graphql.mutation('AddCar', ({ variables }) => {
    const { input } = variables as { input: Omit<Car, 'id'> };
    
    const newCar: Car = {
      id: (cars.length + 1).toString(),
      ...input
    };
    
    cars.push(newCar);
    
    return new Response(
      JSON.stringify({
        data: {
          addCar: newCar
        }
      }),
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  })
];