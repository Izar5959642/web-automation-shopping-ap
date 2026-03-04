import React, { createContext, useContext, useState } from 'react';
import { Product } from '../../domain/Product';
import { TraceStep } from '../../domain/Trace';

interface CartContextValue {
  items: Product[];
  totalPrice: number;
  addItem: (product: Product) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  getItemCount: () => number;
  traceSteps: TraceStep[];
  addTraceSteps: (steps: TraceStep[]) => void;
}

const STORAGE_KEY = 'swag_cart';

function loadFromStorage(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : [];
  } catch {
    return [];
  }
}

function saveToStorage(items: Product[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

const CartContext = createContext<CartContextValue | null>(null);

/**
 * Provides global cart state to the entire app.
 * Cart is persisted to localStorage so it survives page refresh.
 */
export function CartProvider({ children }: { children: React.ReactNode }): React.ReactElement {
  const [items, setItems] = useState<Product[]>(loadFromStorage);
  const [traceSteps, setTraceSteps] = useState<TraceStep[]>([]);

  function addItem(product: Product): void {
    const next = [...items, product];
    setItems(next);
    saveToStorage(next);
  }

  function removeItem(id: string): void {
    const next = items.filter((item) => item.id !== id);
    setItems(next);
    saveToStorage(next);
  }

  function clearCart(): void {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
  }

  function getItemCount(): number {
    return items.length;
  }

  function addTraceSteps(steps: TraceStep[]): void {
    setTraceSteps((prev) => [...prev, ...steps]);
  }

  const totalPrice = items.reduce((sum, item) => sum + item.price, 0);

  return (
    <CartContext.Provider value={{ items, totalPrice, addItem, removeItem, clearCart, getItemCount, traceSteps, addTraceSteps }}>
      {children}
    </CartContext.Provider>
  );
}

/**
 * Hook for consuming cart state and actions from any screen or component.
 * Must be used inside <CartProvider>.
 */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error('useCart must be used inside <CartProvider>');
  }
  return ctx;
}
