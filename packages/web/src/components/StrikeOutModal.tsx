import React from 'react';

interface StrikeOutModalProps {
  isOpen: boolean;
  onRestart: () => void;
  expression: string;
}

export const StrikeOutModal: React.FC<StrikeOutModalProps> = ({
  isOpen,
  onRestart,
  expression,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(20, 5, 5, 0.88)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 250,
      padding: '1.5rem',
    }}>
      <div
        className="animate-shake"
        style={{
          background: 'var(--bg-surface)',
          border: '2px solid var(--border-crimson)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 50px rgba(239, 68, 68, 0.4)',
        }}
      >
        <div style={{ fontSize: '3.5rem', marginBottom: '0.75rem' }}>
          💔 ⚡ 🛑
        </div>

        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: 900,
          fontFamily: 'var(--font-display)',
          color: 'var(--accent-red)',
          marginBottom: '0.5rem',
          letterSpacing: '0.5px',
        }}>
          3 ERRORI — SI RIPARTE!
        </h2>

        <p style={{ color: '#fca5a5', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Hai accumulato <strong>3 errori consecutivi</strong> sull'espressione:{' '}
          <code style={{
            fontFamily: 'var(--font-math)',
            fontWeight: 800,
            background: 'rgba(0,0,0,0.4)',
            padding: '2px 8px',
            borderRadius: '6px',
            color: '#fff',
          }}>
            {expression}
          </code>
          <br /><br />
          Come da regola tattica di GAMBITO, tutte le mosse vengono azzerate per riprovare con mente lucida e precisione.
        </p>

        <button
          onClick={onRestart}
          style={{
            padding: '0.9rem 2rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            color: '#fff',
            fontWeight: 900,
            fontSize: '1.1rem',
            letterSpacing: '0.5px',
            boxShadow: '0 6px 20px rgba(239, 68, 68, 0.4)',
            transition: 'all 0.15s ease',
          }}
        >
          🔄 Ricomincia da Capo
        </button>
      </div>
    </div>
  );
};
