import { graphql, HttpResponse } from 'msw';
import { mockBooks } from '@/mocks/data';
import { Book, BookInput } from '@/types';

let books: Book[] = [...mockBooks];

export const handlers = [
  graphql.query('GetBooks', () => {
    return HttpResponse.json({
      data: {
        books,
      },
    });
  }),

  graphql.mutation('AddBook', ({ variables }) => {
    const { input } = variables as { input: BookInput };
    const newBook: Book = {
      id: String(books.length + 1),
      ...input,
    };
    books.push(newBook);
    
    return HttpResponse.json({
      data: {
        addBook: newBook,
      },
    });
  }),
];