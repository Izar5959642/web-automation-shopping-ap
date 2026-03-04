import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { TraceStepList } from '../components/TraceStepList';

/**
 * Cart status screen that shows the result after adding a product to cart.
 * Displays cart status message and automation step trace.
 * Provides a form for shipping details and a button to proceed to checkout.
 */
export function CartStatusScreen(): React.ReactElement {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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

  return (
    <div style={{ maxWidth: 480, margin: '40px auto', padding: 24, fontFamily: 'sans-serif' }}>
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



      <h2 style={{ marginBottom: 16 }}>Shipping Details</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="firstName" style={{ fontWeight: 'bold' }}>First Name</label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
            style={{ padding: 8, fontSize: 16, border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="lastName" style={{ fontWeight: 'bold' }}>Last Name</label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
            style={{ padding: 8, fontSize: 16, border: '1px solid #ccc', borderRadius: 4 }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label htmlFor="postalCode" style={{ fontWeight: 'bold' }}>Postal Code</label>
          <input
            id="postalCode"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            required
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
            backgroundColor: '#ff9800',
            color: 'white',
            border: 'none',
            borderRadius: 4,
            cursor: loading ? 'not-allowed' : 'pointer',
          }}
        >
          {loading ? 'Processing...' : 'Complete Checkout'}
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
