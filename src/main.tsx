import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import App from './App';
import { dbUtils } from './lib/database';
import '@/index.css'

// Import MSW worker
import { worker } from './mocks/browser';

async function startApp() {
  try {
    // 1. Start MSW first
    
      console.log('Starting MSW...');
      await worker.start({
        onUnhandledRequest: 'warn', // Log unhandled requests
        serviceWorker: {
          url: '/mockServiceWorker.js'
        }
      });
      console.log('MSW started successfully');
    

    // 2. Initialize IndexedDB
    console.log('Initializing database...');
    await dbUtils.initializeData();
    console.log('Database initialized');
    
    // 3. Start React app
    const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
    root.render(
      <Provider store={store}>
        <App />
      </Provider>
    );
    
    console.log('App started successfully');
  } catch (error) {
    console.error('Failed to start app:', error);
  }
}

startApp();
