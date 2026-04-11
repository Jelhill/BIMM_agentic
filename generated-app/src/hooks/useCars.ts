import { useQuery, useMutation } from '@apollo/client';
import { GET_CARS, ADD_CAR } from '../apollo/queries';
import { Car, CreateCarInput } from '../types/car';

interface UseCarsResult {
  cars: Car[];
  loading: boolean;
  error: any;
  addCar: (input: CreateCarInput) => Promise<void>;
  refetch: () => void;
}

export const useCars = (): UseCarsResult => {
  const { data, loading, error, refetch } = useQuery(GET_CARS, {
    variables: { limit: 100, offset: 0 },
    fetchPolicy: 'cache-and-network',
  });

  const [addCarMutation] = useMutation(ADD_CAR, {
    update(cache, { data: mutationResult }) {
      if (mutationResult?.createCar) {
        const existingCars = cache.readQuery({ query: GET_CARS });
        cache.writeQuery({
          query: GET_CARS,
          data: {
            cars: [...(existingCars?.cars || []), mutationResult.createCar],
          },
        });
      }
    },
  });

  const addCar = async (input: CreateCarInput): Promise<void> => {
    try {
      await addCarMutation({
        variables: { input },
      });
    } catch (error) {
      console.error('Error adding car:', error);
      throw error;
    }
  };

  return {
    cars: data?.cars || [],
    loading,
    error,
    addCar,
    refetch,
  };
};