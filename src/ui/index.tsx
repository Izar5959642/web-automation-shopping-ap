import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { CartProvider } from './context/CartContext';

/**
 * Entry point for the React SPA.
 * Mounts the App component into the #root DOM element.
 * CartProvider wraps App so every screen and Header can access cart state.
 */
const container = document.getElementById('root');
if (!container) {
  throw new Error('Root element not found');
}
const root = createRoot(container);
root.render(
  <CartProvider>
    <App />
  </CartProvider>
);
