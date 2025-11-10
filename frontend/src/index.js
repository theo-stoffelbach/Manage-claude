import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

// Global error handler to suppress third-party extension errors
window.addEventListener('error', (event) => {
  // Suppress errors from browser extensions (ethereum, etc.)
  if (
    event.message.includes('ethereum') ||
    event.message === 'Script error.' ||
    event.filename === '' // Cross-origin script errors
  ) {
    console.warn('Suppressed browser extension error:', event.message);
    event.preventDefault();
    return true;
  }
});

// Handle unhandled promise rejections from extensions
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('ethereum')) {
    console.warn('Suppressed browser extension promise rejection');
    event.preventDefault();
  }
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
