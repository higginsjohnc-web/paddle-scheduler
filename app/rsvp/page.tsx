'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function RSVPPage() {
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Invalid RSVP link');
      return;
    }

    // Submit RSVP
    async function submitRSVP() {
      try {
        const response = await fetch('/api/availability/respond', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token }),
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.error || 'Something went wrong');
        }
      } catch (error) {
        setStatus('error');
        setMessage('Failed to submit response. Please try again.');
      }
    }

    submitRSVP();
  }, [searchParams]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      <div style={{
        background: 'white',
        padding: '60px 40px',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        maxWidth: '500px',
        textAlign: 'center',
      }}>
        {status === 'loading' && (
          <>
            <div style={{
              width: '60px',
              height: '60px',
              border: '6px solid #f3f3f3',
              borderTop: '6px solid #667eea',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 20px',
            }} />
            <h1 style={{ fontSize: '24px', color: '#333', marginBottom: '10px' }}>
              Recording your response...
            </h1>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{
              fontSize: '80px',
              marginBottom: '20px',
            }}>✅</div>
            <h1 style={{ fontSize: '32px', color: '#28a745', marginBottom: '15px' }}>
              All Set!
            </h1>
            <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6' }}>
              {message}
            </p>
            <p style={{ fontSize: '14px', color: '#999', marginTop: '30px' }}>
              You can close this window now.
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{
              fontSize: '80px',
              marginBottom: '20px',
            }}>❌</div>
            <h1 style={{ fontSize: '32px', color: '#dc3545', marginBottom: '15px' }}>
              Oops!
            </h1>
            <p style={{ fontSize: '18px', color: '#666', lineHeight: '1.6' }}>
              {message}
            </p>
            <p style={{ fontSize: '14px', color: '#999', marginTop: '30px' }}>
              Please contact the organizer if this problem persists.
            </p>
          </>
        )}

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
