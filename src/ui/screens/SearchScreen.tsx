import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { TraceStepList } from '../components/TraceStepList';

/**
 * Search screen with a form for entering a product search query
 * and an optional maximum price filter.
 * Submits POST /api/search and navigates to ResultsScreen with the response.
 */
export function SearchScreen(): React.ReactElement {
  const [query, setQuery] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [failedTrace, setFailedTrace] = useState<any[]>([]);
  const navigate = useNavigate();
  const { addTraceSteps } = useCart();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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
      navigate('/results', { state: { products: data.products, requestId: data.requestId, selectedProduct: data.selectedProduct } });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 480, margin: '60px auto', padding: 24, fontFamily: 'sans-serif' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 32 }}>Product Search</h1>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="query" style={{ fontWeight: 'bold' }}>Search Query</label>
          <input
            id="query"
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g. backpack"
            style={{ padding: 8, fontSize: 16, border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="maxPrice" style={{ fontWeight: 'bold' }}>Max Price (optional)</label>
          <input
            id="maxPrice"
            type="number"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            placeholder="e.g. 30"
            min="0"
            step="0.01"
            style={{ padding: 8, fontSize: 16, border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            padding: 12,
            fontSize: 16,
            fontWeight: 'bold',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && (
        <div style={{ marginTop: 16, padding: 12, backgroundColor: '#ffebee', color: '#c62828', borderRadius: 4 }}>
          {error}
        </div>
      )}
      <TraceStepList steps={failedTrace} />
    </div>
  );
}
