import { setupWorker } from 'msw/browser';
import { handlers } from '@/mocks/handlers';

//Setup the worker with your handlers
export const worker = setupWorker(...handlers);

export const startMockServer = async () => {
  
    return worker.start({
      onUnhandledRequest: 'warn',
      serviceWorker: {
        url: '/mockServiceWorker.js',
      },
    });
};
