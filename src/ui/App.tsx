import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SearchScreen } from './screens/SearchScreen';
import { ResultsScreen } from './screens/ResultsScreen';
import { CartScreen } from './screens/CartScreen';
import { CartStatusScreen } from './screens/CartStatusScreen';
import { CheckoutResultScreen } from './screens/CheckoutResultScreen';
import { Header } from './components/Header';
import { useCart } from './context/CartContext';

/**
 * AnimatedRoutes is extracted so useLocation can be called inside BrowserRouter context.
 * AnimatePresence mode="wait" ensures the exiting page fully fades out before the next fades in.
 */
function AnimatedRoutes(): React.ReactElement {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<SearchScreen />} />
        <Route path="/results" element={<ResultsScreen />} />
        <Route path="/cart" element={<CartScreen />} />
        <Route path="/cart-status" element={<CartStatusScreen />} />
        <Route path="/checkout-result" element={<CheckoutResultScreen />} />
      </Routes>
    </AnimatePresence>
  );
}

/**
 * Main application component.
 * Sets up React Router with animated page transitions.
 */
export function App(): React.ReactElement {
  const { getItemCount } = useCart();

  return (
    <BrowserRouter>
      <Header cartItemCount={getItemCount()} />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}
