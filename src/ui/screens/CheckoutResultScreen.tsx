import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { TraceStepList } from '../components/TraceStepList';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.3 } },
};

/**
 * Checkout result screen — animated success/failure state with spring icon entrance.
 */
export function CheckoutResultScreen(): React.ReactElement {
  const location = useLocation();
  const navigate  = useNavigate();
  const { clearCart } = useCart();

  const state          = location.state as any;
  const success        = state?.success ?? false;
  const screenshotPath = state?.screenshotPath ?? '';
  const trace: any[]   = state?.trace ?? [];

  useEffect(() => {
    if (success) clearCart();
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        maxWidth: 600,
        margin: '80px auto',
        padding: '0 24px',
        textAlign: 'center',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Icon circle — springs in */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, delay: 0.2 }}
        style={{
          width: 72,
          height: 72,
          borderRadius: '50%',
          border: `1.5px solid ${success ? 'var(--color-success)' : 'var(--color-error)'}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 28px',
          color: success ? 'var(--color-success)' : 'var(--color-error)',
        }}
      >
        {success
          ? <Check size={30} strokeWidth={1.5} />
          : <X size={30} strokeWidth={1.5} />
        }
      </motion.div>

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5 }}
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(28px, 4vw, 44px)',
          fontWeight: 300,
          color: 'var(--color-text)',
          marginBottom: 12,
        }}
      >
        {success ? 'Order Confirmed' : 'Order Failed'}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.5 }}
        style={{
          fontSize: 13,
          color: 'var(--color-text-muted)',
          letterSpacing: '0.04em',
          marginBottom: 48,
        }}
      >
        {success
          ? 'Your order has been placed successfully.'
          : 'Something went wrong. Please try again.'
        }
      </motion.p>

      {/* Screenshot fades up after icon */}
      {success && screenshotPath && (
        <motion.img
          src={`http://localhost:3000/${screenshotPath}`}
          alt="Order confirmation"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          style={{
            width: '100%',
            maxWidth: 500,
            border: '1px solid var(--color-border)',
            marginBottom: 48,
            display: 'block',
            margin: '0 auto 48px',
          }}
        />
      )}

      <TraceStepList steps={trace} />

      {/* CTA */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55, duration: 0.4 }}
        onClick={() => navigate('/')}
        style={{
          padding: '14px 48px',
          fontSize: 11,
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          fontWeight: 500,
          fontFamily: 'var(--font-sans)',
          backgroundColor: 'var(--color-accent)',
          color: 'var(--color-bg)',
          border: 'none',
          cursor: 'pointer',
          marginTop: 32,
        }}
      >
        Start New Search
      </motion.button>
    </motion.div>
  );
}
