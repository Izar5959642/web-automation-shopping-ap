import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Trash2, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Product } from '../../domain/Product';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.3 } },
};

/**
 * CartScreen — animated item list with smooth remove transitions.
 */
export function CartScreen(): React.ReactElement {
  const navigate = useNavigate();
  const { items, totalPrice, removeItem } = useCart();

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ maxWidth: 'var(--max-width)', margin: '48px auto', padding: '0 40px' }}
    >
      {/* Back button */}
      <button
        onClick={() => navigate('/')}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          fontSize: 11,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          padding: 0,
          marginBottom: 40,
          fontFamily: 'var(--font-sans)',
        }}
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to Search
      </button>

      {/* Heading */}
      <div style={{ marginBottom: 40 }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: 10,
        }}>
          Your Selection
        </p>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 300,
          color: 'var(--color-text)',
        }}>
          Your Cart
        </h1>
      </div>

      {items.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '80px 0',
          color: 'var(--color-text-muted)',
          fontFamily: 'var(--font-sans)',
        }}>
          <ShoppingBag size={40} strokeWidth={1} style={{ marginBottom: 16, opacity: 0.4 }} />
          <p style={{ fontSize: 13, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            Your cart is empty
          </p>
        </div>
      ) : (
        <>
          {/* Cart items grid with animated exits */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: 16,
            backgroundColor: 'transparent',
            marginBottom: 48,
          }}>
            <AnimatePresence>
              {items.map((item: Product) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0, transition: { duration: 0.3 } }}
                  exit={{ opacity: 0, x: 32, transition: { duration: 0.25 } }}
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    padding: 24,
                    boxShadow: 'var(--shadow-card)',
                    borderRadius: 4,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <img
                    src={`https://www.saucedemo.com${item.imageUrl}`}
                    alt={item.title}
                    style={{ width: '100%', maxWidth: 160, height: 160, objectFit: 'contain' }}
                  />
                  <h3 style={{
                    margin: 0,
                    textAlign: 'center',
                    fontFamily: 'var(--font-serif)',
                    fontSize: 17,
                    fontWeight: 300,
                    color: 'var(--color-text)',
                  }}>
                    {item.title}
                  </h3>
                  <p style={{
                    margin: 0,
                    fontFamily: 'var(--font-serif)',
                    fontSize: 20,
                    fontWeight: 300,
                    color: 'var(--color-text)',
                  }}>
                    ${item.price.toFixed(2)}
                  </p>
                  <p style={{
                    margin: 0,
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-sans)',
                  }}>
                    Qty: 1
                  </p>

                  {/* Remove button */}
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 5,
                      padding: '8px 0',
                      background: 'none',
                      border: 'none',
                      borderTop: '1px solid var(--color-border)',
                      width: '100%',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      fontSize: 10,
                      letterSpacing: '0.14em',
                      textTransform: 'uppercase',
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    <Trash2 size={12} strokeWidth={1.5} />
                    Remove
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Total + checkout */}
          <div style={{
            borderTop: '1px solid var(--color-border)',
            paddingTop: 32,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div>
              <p style={{
                fontSize: 11,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'var(--color-text-muted)',
                marginBottom: 6,
                fontFamily: 'var(--font-sans)',
              }}>
                Order Total
              </p>
              <p style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 32,
                fontWeight: 300,
                color: 'var(--color-text)',
              }}>
                ${totalPrice.toFixed(2)}
              </p>
            </div>

            <button
              onClick={() => navigate('/cart-status')}
              style={{
                padding: '14px 40px',
                fontSize: 10,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 500,
                fontFamily: 'var(--font-sans)',
                backgroundColor: 'var(--color-accent)',
                color: 'var(--color-bg)',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
