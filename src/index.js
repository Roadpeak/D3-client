import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './utils/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import * as serviceWorkerRegistration from './serviceWorkerRegistration';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster
          position="top-center"
          reverseOrder={false}
          toastOptions={{
            // Default options
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              padding: '16px',
              borderRadius: '12px',
              fontSize: '14px',
            },
            // Success toast
            success: {
              duration: 3000,
              style: {
                background: '#10b981',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#10b981',
              },
            },
            // Error toast
            error: {
              duration: 4000,
              style: {
                background: '#ef4444',
                color: '#fff',
              },
              iconTheme: {
                primary: '#fff',
                secondary: '#ef4444',
              },
            },
            // Loading toast
            loading: {
              style: {
                background: '#3b82f6',
                color: '#fff',
              },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// Register service worker for PWA
serviceWorkerRegistration.register();

reportWebVitals();