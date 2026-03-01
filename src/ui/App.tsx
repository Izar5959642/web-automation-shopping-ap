import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { SearchScreen } from './screens/SearchScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { CartScreen } from './screens/CartScreen';
import { CartStatusScreen } from './screens/CartStatusScreen';
import { CheckoutResultScreen } from './screens/CheckoutResultScreen';
import { Header } from './components/Header';
import { useCart } from './context/CartContext';

/**
 * Main application component.
 * Sets up React Router with routes for the 5 screens:
 * - / → SearchScreen
 * - /results → ResultsScreen
 * - /cart → CartScreen
 * - /cart-status → CartStatusScreen
 * - /checkout-result → CheckoutResultScreen
 */
export function App(): React.ReactElement {
  const { getItemCount } = useCart();

  return (
    <BrowserRouter>
      <Header cartItemCount={getItemCount()} />
      <Routes>
        <Route path="/" element={<SearchScreen />} />
        <Route path="/results" element={<ResultsScreen />} />
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/cart-status" element={<CartStatusScreen />} />
        <Route path="/checkout-result" element={<CheckoutResultScreen />} />
      </Routes>
    </BrowserRouter>
  );
}
