import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

/**
 * Entry point for the React SPA.
 * Mounts the App component into the #root DOM element.
 */
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}
const root = createRoot(container);
root.render(<App />);
