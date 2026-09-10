import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { PresenceProvider } from './context/PresenceContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <PresenceProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </PresenceProvider>
      </AuthProvider>
    </ThemeProvider>
  </React.StrictMode>,
);
