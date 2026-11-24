import React from 'react';
import { MoveError } from '@gambito/engine';

interface FeedbackBannerProps {
  error: MoveError | null;
  hint: string | null;
  successMessage: string | null;
  onDismissError: () => void;
}

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  error,
  hint,
  successMessage,
  onDismissError,
}) => {
  if (error) {
    return (
      <div
        className="animate-shake"
        style={{
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '12px',
          padding: '1rem 1.25rem',
          margin: '1rem auto',
          maxWidth: '900px',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.4rem' }}>⚠️</span>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '4px' }}>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  color: 'var(--accent-red)',
                  letterSpacing: '0.5px',
                }}>
                  {error.code}
                </span>
                <h4 style={{ color: '#fca5a5', fontWeight: 700, fontSize: '0.95rem' }}>
                  {error.message}
                </h4>
              </div>

              {error.counterExample && (
                <div style={{
                  marginTop: '0.5rem',
                  padding: '0.4rem 0.75rem',
                  background: 'rgba(0, 0, 0, 0.25)',
                  borderRadius: '6px',
                  fontFamily: 'var(--font-math)',
                  fontSize: '0.85rem',
                  color: '#fecaca',
                }}>
                  <strong>Controesempio:</strong> {error.counterExample}
                </div>
              )}

              {error.ruleReference && (
                <div style={{ marginTop: '0.4rem', fontSize: '0.8rem', color: '#fda4af', fontStyle: 'italic' }}>
                  📖 {error.ruleReference}
                </div>
              )}
            </div>
          </div>

          <button
            onClick={onDismissError}
            style={{
              color: 'var(--text-muted)',
              fontSize: '1.2rem',
              padding: '2px 8px',
              borderRadius: '4px',
              background: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  if (hint) {
    return (
      <div
        style={{
          background: 'rgba(245, 158, 11, 0.1)',
          border: '1px solid rgba(245, 158, 11, 0.35)',
          borderRadius: '12px',
          padding: '0.9rem 1.25rem',
          margin: '1rem auto',
          maxWidth: '900px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '1.3rem' }}>💡</span>
        <div>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            color: 'var(--accent-gold)',
            display: 'block',
            letterSpacing: '0.5px',
          }}>
            Suggerimento Tattico (Engine)
          </span>
          <p style={{ color: '#fef08a', fontSize: '0.9rem', marginTop: '2px' }}>
            {hint}
          </p>
        </div>
      </div>
    );
  }

  if (successMessage) {
    return (
      <div
        style={{
          background: 'rgba(16, 185, 129, 0.12)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          borderRadius: '12px',
          padding: '0.9rem 1.25rem',
          margin: '1rem auto',
          maxWidth: '900px',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
        }}
      >
        <span style={{ fontSize: '1.3rem' }}>✨</span>
        <p style={{ color: '#6ee7b7', fontSize: '0.95rem', fontWeight: 600 }}>
          {successMessage}
        </p>
      </div>
    );
  }

  return null;
};
