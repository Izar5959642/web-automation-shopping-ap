import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
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
 * Search screen — Aesop-inspired hero layout with underline inputs and animated form entrance.
 */
export function SearchScreen(): React.ReactElement {
  const [query, setQuery]       = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [failedTrace, setFailedTrace] = useState<any[]>([]);
  const navigate = useNavigate();
  const { addTraceSteps } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!query.trim()) {
      setError('Please enter a search term');
      return;
    }
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3000/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          maxPrice: maxPrice ? Number(maxPrice) : undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setFailedTrace(data.trace ?? []);
        throw new Error(data.error || 'Search failed');
      }

      addTraceSteps(data.trace ?? []);
      navigate('/results', {
        state: {
          products: data.products,
          requestId: data.requestId,
          selectedProduct: data.selectedProduct,
        },
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{
        minHeight: 'calc(100vh - 104px)', /* full viewport minus header height */
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0 24px',
      }}
    >
      {/* Hero heading */}
      <motion.div
        variants={containerVariants}
        initial="initial"
        animate="animate"
        style={{ textAlign: 'center', marginBottom: 48, width: '100%', maxWidth: 800 }}
      >
        <motion.p variants={fieldVariants} style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 11,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-text-muted)',
          marginBottom: 12,
        }}>
          Discover
        </motion.p>
        <motion.h1 variants={fieldVariants} style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'clamp(32px, 5vw, 56px)',
          fontWeight: 300,
          color: 'var(--color-text)',
        }}>
          Find Your Product
        </motion.h1>
      </motion.div>

      {/* Horizontal form row */}
      <motion.form
        variants={containerVariants}
        initial="initial"
        animate="animate"
        onSubmit={handleSubmit}
        style={{
          width: '100%',
          maxWidth: 800,
          display: 'flex',
          alignItems: 'flex-end',
          gap: 0,
          borderBottom: '2px solid var(--color-accent)',
        }}
      >
        {/* Query input */}
        <motion.div variants={fieldVariants} style={{ flex: 3, display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label htmlFor="query" style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}>
            Search Query
          </label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. backpack"
            style={{
              width: '100%',
              padding: '12px 0',
              fontSize: 15,
              border: 'none',
              borderRight: '1px solid var(--color-border)',
              background: 'transparent',
              color: 'var(--color-text)',
              outline: 'none',
            }}
          />
        </motion.div>

        {/* Max price input */}
        <motion.div variants={fieldVariants} style={{ flex: 1.2, display: 'flex', flexDirection: 'column', gap: 6, padding: '0 16px' }}>
          <label htmlFor="maxPrice" style={{
            fontFamily: 'var(--font-sans)',
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'var(--color-text-muted)',
          }}>
            Max Price
          </label>
          <input
            id="maxPrice"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="optional"
            min="0"
            step="0.01"
            style={{
              width: '100%',
              padding: '12px 0',
              fontSize: 15,
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text)',
              outline: 'none',
            }}
          />
        </motion.div>

        {/* Search button */}
        <motion.button
          variants={fieldVariants}
          type="submit"
          disabled={loading}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 7,
            padding: '12px 28px',
            fontSize: 10,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 500,
            fontFamily: 'var(--font-sans)',
            backgroundColor: loading ? 'var(--color-text-muted)' : 'var(--color-accent)',
            color: 'var(--color-bg)',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            flexShrink: 0,
            alignSelf: 'stretch',
          }}
        >
          {loading ? (
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
              }}
            />
          ) : (
            <Search size={14} strokeWidth={1.5} />
          )}
          {loading ? 'Searching' : 'Search'}
        </motion.button>
      </motion.form>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: 20,
            padding: '10px 16px',
            border: '1px solid var(--color-error)',
            color: 'var(--color-error)',
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
            width: '100%',
            maxWidth: 800,
          }}
        >
          {error}
        </motion.div>
      )}

      <TraceStepList steps={failedTrace} />
    </motion.div>
  );
}
