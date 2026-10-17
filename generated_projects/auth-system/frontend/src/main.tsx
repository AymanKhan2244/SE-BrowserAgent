import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './authContext';
import './index.css';

const container = document.getElementById('root');

if (!container) {
  throw new Error('Root element not found. Ensure there is a <div id="root"></div> in your HTML.');
}

const root = createRoot(container);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);