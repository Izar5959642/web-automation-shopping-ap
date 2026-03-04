import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { TraceStepList } from '../components/TraceStepList';

/**
 * Results screen that displays the list of products returned from the search.
 * Shows product cards with title, price, and image.
 * Allows user to click "Add to Cart" on a product, which triggers POST /api/buy
 * and adds the item to cart context. Does not navigate away.
 */
export function ResultsScreen(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem, items: cartItems, addTraceSteps } = useCart();
  const [error, setError] = useState('');
  const [failedTrace, setFailedTrace] = useState<any[]>([]);
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<string[]>([]);

  const products = (location.state as any)?.products ?? [];
  const selectedProduct = (location.state as any)?.selectedProduct ?? null;

  const handleAddToCart = async (product: any) => {
    setError('');
    setBuyingId(product.id);

    try {
      const response = await fetch('http://localhost:3000/api/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFailedTrace(data.trace ?? []);
        throw new Error(data.error || 'Failed to add to cart');
      }

      addTraceSteps(data.trace ?? []);
      addItem(product);
      setRecentlyAddedIds((prev) => [...prev, product.id]);
      setTimeout(() => {
        setRecentlyAddedIds((prev) => prev.filter((id) => id !== product.id));
      }, 2000);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setBuyingId(null);
    }
  };

  return (
    <div style={{ maxWidth: 900, margin: '40px auto', padding: 24, fontFamily: 'sans-serif' }}>
      <button
        onClick={() => navigate('/')}
        style={{
          padding: '8px 16px',
          fontSize: 14,
          backgroundColor: '#eee',
          border: '1px solid #ccc',
          borderRadius: 4,
          cursor: 'pointer',
          marginBottom: 24,
        }}
      >
        Back to Search
      </button>

      <h1 style={{ marginBottom: 24 }}>Search Results</h1>

      {error && (
        <div style={{ marginBottom: 16, padding: 12, backgroundColor: '#ffebee', color: '#c62828', borderRadius: 4 }}>
          {error}
        </div>
      )}
      <TraceStepList steps={failedTrace} />

      {products.length === 0 ? (
        <p style={{ fontSize: 18, color: '#666' }}>No products found</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
          {products.map((product: any) => {
            const isBestValue = selectedProduct?.id === product.id;
            return (
            <div
              key={product.id}
              style={{
                border: isBestValue ? '2px solid #388e3c' : '1px solid #ddd',
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                position: 'relative',
              }}
            >
              {isBestValue && (
                <span style={{
                  position: 'absolute',
                  top: 10,
                  left: 10,
                  backgroundColor: '#388e3c',
                  color: 'white',
                  fontSize: 11,
                  fontWeight: 'bold',
                  padding: '2px 8px',
                  borderRadius: 4,
                }}>
                  ★ Best Value
                </span>
              )}
              <img
                src={`https://www.saucedemo.com${product.imageUrl}`}
                alt={product.title}
                style={{ width: '100%', maxWidth: 180, height: 180, objectFit: 'contain' }}
              />
              <h3 style={{ margin: 0, textAlign: 'center', fontSize: 16 }}>{product.title}</h3>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: '#2e7d32' }}>
                ${product.price.toFixed(2)}
              </p>
              {(() => {
                const isAdding = buyingId === product.id;
                const justAdded = recentlyAddedIds.includes(product.id);
                const alreadyInCart = cartItems.some((i) => i.id === product.id);

                const label = isAdding
                  ? 'Adding...'
                  : justAdded
                  ? '✓ Added'
                  : alreadyInCart
                  ? 'Already in Cart'
                  : 'Add to Cart';

                const bg = isAdding || (!justAdded && !alreadyInCart)
                  ? '#1976d2'
                  : justAdded
                  ? '#388e3c'
                  : '#ff9800';

                return (
                  <button
                    onClick={() => handleAddToCart(product)}
                    disabled={isAdding || justAdded}
                    style={{
                      padding: '10px 24px',
                      fontSize: 14,
                      fontWeight: 'bold',
                      backgroundColor: bg,
                      color: 'white',
                      border: 'none',
                      borderRadius: 4,
                      cursor: (isAdding || justAdded) ? 'not-allowed' : 'pointer',
                      width: '100%',
                    }}
                  >
                    {label}
                  </button>
                );
              })()}
            </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
