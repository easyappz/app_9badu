import React from 'react';
import ErrorBoundary from './ErrorBoundary';
import './App.css';
import Calculator from './features/calculator/Calculator';

function App() {
  return (
    <ErrorBoundary>
      <div data-easytag="id1-src/App.js" className="app-root">
        <Calculator />
      </div>
    </ErrorBoundary>
  );
}

export default App;
