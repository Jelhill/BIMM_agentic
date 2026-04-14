import { useQuery, useMutation } from '@apollo/client';
import { GET_BOOKS, ADD_BOOK } from '@/graphql/queries';

interface BookInput {
  title: string;
  author: string;
  genre: string;
  year: number;
  pages: number;
  read: boolean;
  cover: string;
}

export const useBooks = () => {
  const { data, loading, error, refetch } = useQuery(GET_BOOKS);

  const [addBookMutation] = useMutation(ADD_BOOK, {
    update(cache, { data }) {
      if (data?.addBook) {
        const existingBooks = cache.readQuery({ query: GET_BOOKS }) as { books: any[] } | null;
        if (existingBooks) {
          cache.writeQuery({
            query: GET_BOOKS,
            data: {
              books: [...existingBooks.books, data.addBook],
            },
          });
        }
      }
    },
  });

  const addBook = async (input: BookInput) => {
    try {
      const result = await addBookMutation({
        variables: { input },
      });
      return result.data?.addBook;
    } catch (error) {
      throw error;
    }
  };

  return {
    books: data?.books || [],
    loading,
    error,
    addBook,
    refetch,
  };
};