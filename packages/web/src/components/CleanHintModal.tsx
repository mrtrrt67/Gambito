import React, { useState } from 'react';

interface CleanHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  hint: string;
  onConfirmHint: () => void;
}

export const CleanHintModal: React.FC<CleanHintModalProps> = ({
  isOpen,
  onClose,
  hint,
  onConfirmHint,
}) => {
  const [isRevealed, setIsRevealed] = useState(false);

  if (!isOpen) return null;

  const handleReveal = () => {
    setIsRevealed(true);
    onConfirmHint();
  };

  const handleClose = () => {
    setIsRevealed(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        borderRadius: '20px',
        padding: '2rem',
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💡</div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-num)', marginBottom: '0.5rem' }}>
          Suggerimento Tattico
        </h3>

        {!isRevealed ? (
          <>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              Gli aiuti non sono automatici. Se confermi, visualizzerai il suggerimento dell'engine ma riceverai una penalità di:
            </p>
            <div style={{
              display: 'inline-block',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#f87171',
              fontWeight: 800,
              fontSize: '1.2rem',
              padding: '0.4rem 1.25rem',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              marginBottom: '1.5rem',
              fontFamily: 'var(--font-math)',
            }}>
              −50 Punti
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
              <button
                onClick={handleClose}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#94a3b8',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                }}
              >
                No, continuo da solo
              </button>
              <button
                onClick={handleReveal}
                style={{
                  padding: '0.65rem 1.25rem',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                  color: '#000',
                  fontSize: '0.9rem',
                  fontWeight: 900,
                }}
              >
                Mostra Suggerimento
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{
              padding: '1rem',
              borderRadius: '12px',
              background: 'rgba(251, 191, 36, 0.1)',
              border: '1px solid rgba(251, 191, 36, 0.3)',
              color: '#fef08a',
              fontSize: '0.95rem',
              lineHeight: 1.5,
              marginBottom: '1.5rem',
            }}>
              {hint}
            </div>

            <button
              onClick={handleClose}
              style={{
                padding: '0.65rem 1.5rem',
                borderRadius: '10px',
                background: '#0ea5e9',
                color: '#fff',
                fontSize: '0.9rem',
                fontWeight: 800,
              }}
            >
              Ho capito!
            </button>
          </>
        )}
      </div>
    </div>
  );
};
