import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { TraceStepList } from '../components/TraceStepList';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit:    { opacity: 0, y: -8,  transition: { duration: 0.3 } },
};

const containerVariants = {
  animate: { transition: { staggerChildren: 0.1, delayChildren: 0.15 } },
};

const fieldVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

/**
 * Cart status screen — shipping details form with Aesop-style underline inputs.
 */
export function CartStatusScreen(): React.ReactElement {
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const [failedTrace, setFailedTrace] = useState<any[]>([]);
  const navigate = useNavigate();
  const { traceSteps, addTraceSteps } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ firstName, lastName, postalCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFailedTrace(data.trace ?? []);
        throw new Error(data.error || 'Checkout failed');
      }

      const allSteps = [...traceSteps, ...(data.trace ?? [])];
      addTraceSteps(data.trace ?? []);
      navigate('/checkout-result', {
        state: { success: data.success, screenshotPath: data.screenshotPath, trace: allSteps },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 0',
    fontSize: 15,
    border: 'none',
    borderBottom: '1px solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text)',
    outline: 'none',
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)',
    fontSize: 11,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--color-text-muted)',
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ maxWidth: 480, margin: '80px auto', padding: '0 24px' }}
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
          marginBottom: 48,
          fontFamily: 'var(--font-sans)',
        }}
      >
        <ArrowLeft size={14} strokeWidth={1.5} />
        Back to Search
      </button>

      {/* Heading */}
      <div style={{ marginBottom: 48 }}>
        <p style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: 10,
        }}>
          Step 3 of 3
        </p>
        <h2 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(28px, 4vw, 40px)',
          fontWeight: 300,
          color: 'var(--color-text)',
        }}>
          Shipping Details
        </h2>
      </div>

      {/* Form */}
      <motion.form
        variants={containerVariants}
        initial="initial"
        animate="animate"
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: 28 }}
      >
        <motion.div variants={fieldVariants} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="firstName" style={labelStyle}>First Name</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={inputStyle}
          />
        </motion.div>

        <motion.div variants={fieldVariants} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="lastName" style={labelStyle}>Last Name</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={inputStyle}
          />
        </motion.div>

        <motion.div variants={fieldVariants} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="postalCode" style={labelStyle}>Postal Code</label>
          <input
            id="postalCode"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
            style={inputStyle}
          />
        </motion.div>

        <motion.button
          variants={fieldVariants}
          type="submit"
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            width: '100%',
            padding: '14px',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            backgroundColor: loading ? 'var(--color-text-muted)' : 'var(--color-accent)',
            color: 'var(--color-bg)',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color var(--transition)',
          }}
        >
          {loading ? (
            <>
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                style={{
                  width: 14,
                  height: 14,
                  border: '1.5px solid #f7f4ef',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              Processing
            </>
          ) : (
            'Confirm Order'
          )}
        </motion.button>
      </motion.form>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 24,
            padding: '12px 16px',
            border: '1px solid var(--color-error)',
            color: 'var(--color-error)',
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
          }}
        >
          {error}
        </motion.div>
      )}

      <TraceStepList steps={failedTrace} />
    </motion.div>
  );
}
