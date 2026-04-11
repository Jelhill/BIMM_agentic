import { useQuery, useMutation } from '@apollo/client';
import { GET_CARS, ADD_CAR } from '../graphql/queries';
import type { Car, CreateCarInput } from '../types/car';

export interface UseCarsReturn {
  cars: Car[];
  loading: boolean;
  error: Error | undefined;
  addCar: (input: CreateCarInput) => Promise<void>;
  refetch: () => Promise<unknown>;
}

export const useCars = (): UseCarsReturn => {
  const { data, loading, error, refetch } = useQuery<{ cars: Car[] }>(GET_CARS);

  const [addCarMutation] = useMutation(ADD_CAR, {
    update(cache, { data: mutationData }) {
      if (!mutationData?.addCar) return;
      const existing = cache.readQuery<{ cars: Car[] }>({ query: GET_CARS });
      cache.writeQuery({
        query: GET_CARS,
        data: { cars: [...(existing?.cars ?? []), mutationData.addCar] },
      });
    },
  });

  const addCar = async (input: CreateCarInput): Promise<void> => {
    await addCarMutation({ variables: { input } });
  };

  return {
    cars: data?.cars ?? [],
    loading,
    error,
    addCar,
    refetch,
  };
};
