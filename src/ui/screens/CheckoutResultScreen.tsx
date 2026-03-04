import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { TraceStepList } from '../components/TraceStepList';

/**
 * Checkout result screen that displays the final outcome of the checkout flow.
 * Shows success/failure status, the confirmation screenshot image,
 * and the full automation trace steps.
 * Clears the cart from context and localStorage on successful checkout.
 */
export function CheckoutResultScreen(): React.ReactElement {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const state = location.state as any;
  const success = state?.success ?? false;
  const screenshotPath = state?.screenshotPath ?? '';
  const trace: any[] = state?.trace ?? [];

  useEffect(() => {
    if (success) {
      clearCart();
    }
  }, []);

  return (
    <div style={{ maxWidth: 600, margin: '40px auto', padding: 24, fontFamily: 'sans-serif', textAlign: 'center' }}>
      {success ? (
        <>
          <div style={{ padding: 20, backgroundColor: '#e8f5e9', borderRadius: 8, marginBottom: 24 }}>
            <h1 style={{ margin: 0, color: '#2e7d32' }}>Order completed successfully!</h1>
          </div>

          {screenshotPath && (
            <img
              src={`http://localhost:3000/${screenshotPath}`}
              alt="Order confirmation"
              style={{ width: '100%', maxWidth: 500, borderRadius: 8, border: '1px solid #ddd', marginBottom: 24 }}
            />
          )}
        </>
      ) : (
        <div style={{ padding: 20, backgroundColor: '#ffebee', borderRadius: 8, marginBottom: 24 }}>
          <h1 style={{ margin: 0, color: '#c62828' }}>Checkout failed. Please try again.</h1>
        </div>
      )}

      <TraceStepList steps={trace} />

      <button
        onClick={() => navigate('/')}
        style={{
          padding: '12px 32px',
          fontSize: 16,
          fontWeight: 'bold',
          backgroundColor: '#4CAF50',
          color: 'white',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Start New Search
      </button>
    </div>
  );
}
