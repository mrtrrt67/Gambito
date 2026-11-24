import React from 'react';

interface CleanStrikeModalProps {
  isOpen: boolean;
  onRestart: () => void;
  expression: string;
}

export const CleanStrikeModal: React.FC<CleanStrikeModalProps> = ({
  isOpen,
  onRestart,
  expression,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 5, 5, 0.85)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 220,
      padding: '1rem',
    }}>
      <div
        className="animate-shake"
        style={{
          background: 'var(--bg-card)',
          border: '2px solid #ef4444',
          borderRadius: '20px',
          padding: '2.5rem 2rem',
          maxWidth: '460px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 50px rgba(239, 68, 68, 0.35)',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>💔 🛑</div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f87171', marginBottom: '0.5rem' }}>
          3 ERRORI — SI RIPARTE!
        </h2>

        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '1.5rem' }}>
          Hai esaurito le 3 vite per l'espressione <strong style={{ color: '#fff' }}>{expression}</strong>.
          Si riparte da capo per consolidare il metodo con calma!
        </p>

        <button
          onClick={onRestart}
          style={{
            padding: '0.8rem 1.8rem',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
            color: '#fff',
            fontWeight: 900,
            fontSize: '1rem',
            boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
          }}
        >
          🔄 Ricomincia Livello
        </button>
      </div>
    </div>
  );
};
