import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

/**
 * Results screen that displays the list of products returned from the search.
 * Shows product cards with title, price, and image.
 * Allows user to click "Add to Cart" on a product, which triggers POST /api/buy
 * and adds the item to cart context. Does not navigate away.
 */
export function ResultsScreen(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [error, setError] = useState('');
  const [buyingId, setBuyingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const products = (location.state as any)?.products ?? [];

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
        throw new Error(data.error || 'Failed to add to cart');
      }

      addItem(product);
      setAddedIds((prev) => [...prev, product.id]);
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

      {products.length === 0 ? (
        <p style={{ fontSize: 18, color: '#666' }}>No products found</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20 }}>
          {products.map((product: any) => (
            <div
              key={product.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: 8,
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <img
                src={`https://www.saucedemo.com${product.imageUrl}`}
                alt={product.title}
                style={{ width: '100%', maxWidth: 180, height: 180, objectFit: 'contain' }}
              />
              <h3 style={{ margin: 0, textAlign: 'center', fontSize: 16 }}>{product.title}</h3>
              <p style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: '#2e7d32' }}>
                ${product.price.toFixed(2)}
              </p>
              <button
                onClick={() => handleAddToCart(product)}
                disabled={buyingId === product.id || addedIds.includes(product.id)}
                style={{
                  padding: '10px 24px',
                  fontSize: 14,
                  fontWeight: 'bold',
                  backgroundColor: addedIds.includes(product.id) ? '#388e3c' : '#1976d2',
                  color: 'white',
                  border: 'none',
                  borderRadius: 4,
                  cursor: (buyingId === product.id || addedIds.includes(product.id)) ? 'not-allowed' : 'pointer',
                  width: '100%',
                }}
              >
                {buyingId === product.id
                  ? 'Adding...'
                  : addedIds.includes(product.id)
                  ? '✓ Added to Cart'
                  : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
