import { useQuery, useMutation } from '@apollo/client';
import { GET_BOOKS, ADD_BOOK } from '@/graphql/queries';
import type { Book, BookInput } from '@/types';

interface GetBooksData {
  books: Book[];
}

interface AddBookData {
  addBook: Book;
}

interface AddBookVariables {
  input: BookInput;
}

export const useBooks = () => {
  const { data, loading, error, refetch } = useQuery<GetBooksData>(GET_BOOKS);

  const [addBookMutation] = useMutation<AddBookData, AddBookVariables>(ADD_BOOK, {
    update(cache, { data }) {
      if (!data?.addBook) return;

      const existingData = cache.readQuery<GetBooksData>({
        query: GET_BOOKS,
      });

      if (existingData) {
        cache.writeQuery({
          query: GET_BOOKS,
          data: {
            books: [...existingData.books, data.addBook],
          },
        });
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