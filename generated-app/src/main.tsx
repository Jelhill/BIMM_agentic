import React from 'react';
import ReactDOM from 'react-dom/client';
import { CssBaseline } from '@mui/material';
import App from './App';
import { startMocking } from './mocks/worker';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

const renderApp = () => {
  root.render(
    <React.StrictMode>
      <CssBaseline />
      <App />
    </React.StrictMode>
  );
};

if (process.env.NODE_ENV === 'development') {
  startMocking().then(() => {
    renderApp();
  });
} else {
  renderApp();
}