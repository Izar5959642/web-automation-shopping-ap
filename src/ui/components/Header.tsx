import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';

interface HeaderProps {
  cartItemCount: number;
}

/**
 * Global app header — Aesop-inspired.
 * Announcement bar on top, centered wordmark, cart icon on right.
 */
export function Header({ cartItemCount }: HeaderProps): React.ReactElement {
  const navigate = useNavigate();

  return (
    <div style={{ position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Announcement bar */}
      <div style={{
        backgroundColor: 'var(--color-announcement)',
        color: '#f7f4ef',
        textAlign: 'center',
        fontSize: 11,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        padding: '8px 24px',
        fontFamily: 'var(--font-sans)',
      }}>
        Free standard delivery on orders over $50
      </div>

      {/* Main header */}
      <header style={{
        backgroundColor: 'var(--color-bg)',
        borderBottom: '1px solid var(--color-border)',
        padding: '0 40px',
        height: 72,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Left spacer */}
        <div style={{ width: 120 }} />

        {/* Centered wordmark */}
        <span
          onClick={() => navigate('/')}
          style={{
            fontFamily: 'var(--font-serif)',
            fontSize: 22,
            fontWeight: 300,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            cursor: 'pointer',
            color: 'var(--color-text)',
            userSelect: 'none',
          }}
        >
          Swag Labs
        </span>

        {/* Right: cart */}
        <div style={{ width: 120, display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => navigate('/cart')}
            aria-label="View cart"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              padding: 8,
              display: 'flex',
              alignItems: 'center',
              color: 'var(--color-text)',
            }}
          >
            <ShoppingBag size={22} strokeWidth={1.5} />

            {cartItemCount > 0 && (
              <motion.span
                key={cartItemCount}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  backgroundColor: 'var(--color-text)',
                  color: 'var(--color-bg)',
                  borderRadius: '50%',
                  width: 16,
                  height: 16,
                  fontSize: 10,
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                {cartItemCount}
              </motion.span>
            )}
          </button>
        </div>
      </header>
    </div>
  );
}
