import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Star, ShoppingBag, Check } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { TraceStepList } from '../components/TraceStepList';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.3 } },
};

const gridVariants = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const cardVariants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as [number,number,number,number] },
  },
};

function SkeletonCard(): React.ReactElement {
  return (
    <div style={{
      backgroundColor: 'var(--color-surface)',
      padding: 24,
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div className="skeleton" style={{ width: '100%', height: 180 }} />
      <div className="skeleton" style={{ width: '70%', height: 16 }} />
      <div className="skeleton" style={{ width: '30%', height: 22 }} />
      <div className="skeleton" style={{ width: '100%', height: 40 }} />
    </div>
  );
}

/**
 * Results screen — stagger-reveal product cards with hover lift and skeleton placeholders.
 */
export function ResultsScreen(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const { addItem, items: cartItems, addTraceSteps } = useCart();
  const [error, setError]           = useState('');
  const [failedTrace, setFailedTrace] = useState<any[]>([]);
  const [buyingId, setBuyingId]     = useState<string | null>(null);
  const [recentlyAddedIds, setRecentlyAddedIds] = useState<string[]>([]);

  const products        = (location.state as any)?.products ?? [];
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
          Results
        </p>
        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 300,
          color: 'var(--color-text)',
        }}>
          Search Results
        </h1>
      </div>

      {error && (
        <div style={{
          marginBottom: 24,
          padding: '12px 16px',
          border: '1px solid var(--color-error)',
          color: 'var(--color-error)',
          fontSize: 13,
          fontFamily: 'var(--font-sans)',
        }}>
          {error}
        </div>
      )}
      <TraceStepList steps={failedTrace} />

      {products.length === 0 ? (
        /* Skeleton grid */
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
          backgroundColor: 'transparent',
        }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <motion.div
          variants={gridVariants}
          initial="initial"
          animate="animate"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
            backgroundColor: 'transparent',
          }}
        >
          {products.map((product: any) => {
            const isBestValue  = selectedProduct?.id === product.id;
            const isAdding     = buyingId === product.id;
            const justAdded    = recentlyAddedIds.includes(product.id);
            const alreadyInCart = cartItems.some((i) => i.id === product.id);

            return (
              <motion.div
                key={product.id}
                variants={cardVariants}
                whileHover={{
                  y: -4,
                  boxShadow: 'var(--shadow-card-hover)',
                  transition: { duration: 0.2 },
                }}
                style={{
                  backgroundColor: 'var(--color-surface)',
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 12,
                  position: 'relative',
                  boxShadow: 'var(--shadow-card)',
                  borderRadius: 4,
                }}
              >
                {/* Best Value badge */}
                {isBestValue && (
                  <span style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    backgroundColor: 'var(--color-badge)',
                    color: '#f7f4ef',
                    fontSize: 9,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    padding: '3px 8px',
                    fontFamily: 'var(--font-sans)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}>
                    <Star size={9} fill="#f7f4ef" strokeWidth={0} />
                    Best Value
                  </span>
                )}

                <img
                  src={`https://www.saucedemo.com${product.imageUrl}`}
                  alt={product.title}
                  style={{ width: '100%', maxWidth: 180, height: 180, objectFit: 'contain' }}
                />

                <h3 style={{
                  margin: 0,
                  textAlign: 'center',
                  fontFamily: 'var(--font-serif)',
                  fontSize: 18,
                  fontWeight: 300,
                  color: 'var(--color-text)',
                }}>
                  {product.title}
                </h3>

                <p style={{
                  margin: 0,
                  fontFamily: 'var(--font-serif)',
                  fontSize: 22,
                  fontWeight: 300,
                  color: 'var(--color-text)',
                  letterSpacing: '0.04em',
                }}>
                  ${product.price.toFixed(2)}
                </p>

                {/* Add to Cart button */}
                <button
                  onClick={() => handleAddToCart(product)}
                  disabled={isAdding || justAdded}
                  style={{
                    width: '100%',
                    padding: '11px',
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    fontWeight: 500,
                    fontFamily: 'var(--font-sans)',
                    border: alreadyInCart && !justAdded ? '1px solid var(--color-border)' : 'none',
                    backgroundColor: justAdded
                      ? 'var(--color-success)'
                      : alreadyInCart
                      ? 'transparent'
                      : 'var(--color-accent)',
                    color: alreadyInCart && !justAdded
                      ? 'var(--color-text-muted)'
                      : 'var(--color-bg)',
                    cursor: (isAdding || justAdded) ? 'default' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  {isAdding ? (
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                      style={{
                        width: 12,
                        height: 12,
                        border: '1.5px solid #f7f4ef',
                        borderTopColor: 'transparent',
                        borderRadius: '50%',
                        display: 'inline-block',
                      }}
                    />
                  ) : justAdded ? (
                    <><Check size={12} strokeWidth={2} /> Added</>
                  ) : alreadyInCart ? (
                    <><ShoppingBag size={12} strokeWidth={1.5} /> In Cart</>
                  ) : (
                    <><ShoppingBag size={12} strokeWidth={1.5} /> Add to Cart</>
                  )}
                </button>
              </motion.div>
            );
          })}
        </motion.div>
      )}
    </motion.div>
  );
}
