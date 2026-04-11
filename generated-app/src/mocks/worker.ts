import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

export const worker = setupWorker(...handlers);

export const startMocking = async (): Promise<void> => {
  if (process.env.NODE_ENV === 'development') {
    await worker.start({
      onUnhandledRequest: 'warn',
    });
  }
};

export const setupMockingForTests = async (): Promise<void> => {
  await worker.start({
    quiet: true,
  });
};

export const stopMocking = (): void => {
  worker.stop();
};

export const resetMockData = (): void => {
  worker.resetHandlers();
};