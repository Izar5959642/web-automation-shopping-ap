import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  cartItemCount: number;
}

/**
 * Global app header with the Swag Labs logo and a cart icon badge.
 * Clicking the cart icon navigates to /cart.
 */
export function Header({ cartItemCount }: HeaderProps): React.ReactElement {
  const navigate = useNavigate();

  return (
    <header
      style={{
        backgroundColor: '#132d4e',
        color: 'white',
        padding: '0 24px',
        height: 64,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        fontFamily: 'sans-serif',
        boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
      }}
    >
      <span style={{ fontSize: 22, fontWeight: 'bold', letterSpacing: 1 }}>
        Swag Labs
      </span>

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
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width={28}
          height={28}
          fill="white"
        >
          <path d="M7 18c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm10 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zM5.16 5H2V3H0v2h2l3.6 7.59L4.25 15c-.16.28-.25.61-.25.95C4 17.1 4.9 18 6 18h15v-2H6.42c-.14 0-.25-.11-.25-.25l.03-.12L7.1 14h9.45c.75 0 1.41-.41 1.75-1.03L21.7 6H5.16z" />
        </svg>

        {cartItemCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 2,
              right: 2,
              backgroundColor: '#e63329',
              color: 'white',
              borderRadius: '50%',
              width: 18,
              height: 18,
              fontSize: 11,
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {cartItemCount}
          </span>
        )}
      </button>
    </header>
  );
}
