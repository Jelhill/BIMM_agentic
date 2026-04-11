import { useQuery, useMutation } from '@apollo/client';
import { GET_CARS, ADD_CAR } from '../graphql/queries';
import { Car, AddCarInput } from '../types/car';

interface UseCarsReturn {
  cars: Car[];
  loading: boolean;
  error: string | null;
  addCar: (car: AddCarInput) => Promise<void>;
  refetch: () => void;
}

export const useCars = (): UseCarsReturn => {
  const { data, loading, error, refetch } = useQuery(GET_CARS, {
    errorPolicy: 'all',
  });

  const [addCarMutation] = useMutation(ADD_CAR, {
    update: (cache, { data: mutationData }) => {
      if (mutationData?.addCar) {
        const existingCars = cache.readQuery({ query: GET_CARS });
        if (existingCars) {
          cache.writeQuery({
            query: GET_CARS,
            data: {
              cars: [...existingCars.cars, mutationData.addCar],
            },
          });
        }
      }
    },
    errorPolicy: 'all',
  });

  const addCar = async (car: AddCarInput): Promise<void> => {
    try {
      await addCarMutation({
        variables: { input: car },
      });
    } catch (err) {
      throw err;
    }
  };

  return {
    cars: data?.cars || [],
    loading,
    error: error?.message || null,
    addCar,
    refetch,
  };
};