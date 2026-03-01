import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Product } from '../../domain/Product';

/**
 * CartScreen displays the current contents of the shopping cart.
 *
 * Reads cart data from CartContext (persisted in localStorage),
 * so it works correctly regardless of how the user navigated here.
 *
 * Displays:
 * - A list of cart items (Product[]) with title, price, and image
 * - Quantity per item (assumed to be 1 for now)
 * - A "Remove" button per item
 * - Total price calculated from all items
 * - A "Proceed to Checkout" button that navigates to /cart-status
 * - A "Back to Search" button that navigates to /
 */
export function CartScreen(): React.ReactElement {
  const navigate = useNavigate();
  const { items, totalPrice, removeItem } = useCart();

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

      <h1 style={{ marginBottom: 24 }}>Your Cart</h1>

      {items.length === 0 ? (
        <p style={{ fontSize: 18, color: '#666' }}>Your cart is empty</p>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 20, marginBottom: 32 }}>
            {items.map((item: Product) => (
              <div
                key={item.id}
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
                  src={`https://www.saucedemo.com${item.imageUrl}`}
                  alt={item.title}
                  style={{ width: '100%', maxWidth: 180, height: 180, objectFit: 'contain' }}
                />
                <h3 style={{ margin: 0, textAlign: 'center', fontSize: 16 }}>{item.title}</h3>
                <p style={{ margin: 0, fontSize: 20, fontWeight: 'bold', color: '#2e7d32' }}>
                  ${item.price.toFixed(2)}
                </p>
                <p style={{ margin: 0, fontSize: 14, color: '#555' }}>Quantity: 1</p>
                <button
                  onClick={() => removeItem(item.id)}
                  style={{
                    padding: '8px 16px',
                    fontSize: 14,
                    backgroundColor: '#ffebee',
                    color: '#c62828',
                    border: '1px solid #ef9a9a',
                    borderRadius: 4,
                    cursor: 'pointer',
                    width: '100%',
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '2px solid #ddd', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <p style={{ fontSize: 22, fontWeight: 'bold', margin: 0 }}>
              Total: ${totalPrice.toFixed(2)}
            </p>
            <button
              onClick={() => navigate('/cart-status')}
              style={{
                padding: '12px 32px',
                fontSize: 16,
                fontWeight: 'bold',
                backgroundColor: '#1976d2',
                color: 'white',
                border: 'none',
                borderRadius: 4,
                cursor: 'pointer',
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </div>
  );
}
