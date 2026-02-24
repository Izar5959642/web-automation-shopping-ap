import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SearchScreen } from './screens/SearchScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { CartStatusScreen } from './screens/CartStatusScreen';
import { CheckoutResultScreen } from './screens/CheckoutResultScreen';

/**
 * Main application component.
 * Sets up React Router with routes for the 4 screens:
 * - / → SearchScreen
 * - /results → ResultsScreen
 * - /cart-status → CartStatusScreen
 * - /checkout-result → CheckoutResultScreen
 */
export function App(): React.ReactElement {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SearchScreen />} />
        <Route path="/results" element={<ResultsScreen />} />
        <Route path="/cart-status" element={<CartStatusScreen />} />
        <Route path="/checkout-result" element={<CheckoutResultScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
