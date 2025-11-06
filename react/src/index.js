import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// Expose routes for host integration
if (typeof window !== 'undefined') {
  if (typeof window.handleRoutes === 'function') {
    window.handleRoutes(["/"]);
  } else {
    window.handleRoutes = function(pages) { /* placeholder for host */ return pages; };
    window.handleRoutes(["/"]);
  }
}

reportWebVitals();
