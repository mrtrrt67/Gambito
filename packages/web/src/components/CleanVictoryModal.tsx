import React from 'react';

interface CleanVictoryModalProps {
  isOpen: boolean;
  result: string;
  moves: number;
  score: number;
  onNextLevel: () => void;
  onOpenLeaderboard: () => void;
}

export const CleanVictoryModal: React.FC<CleanVictoryModalProps> = ({
  isOpen,
  result,
  moves,
  score,
  onNextLevel,
  onOpenLeaderboard,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 220,
      padding: '1rem',
    }}>
      <div
        className="animate-pop"
        style={{
          background: 'var(--bg-card)',
          border: '2px solid rgba(52, 211, 153, 0.5)',
          borderRadius: '24px',
          padding: '2.5rem 2rem',
          maxWidth: '480px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 0 50px rgba(52, 211, 153, 0.25)',
        }}
      >
        <div style={{ fontSize: '3.5rem', marginBottom: '0.5rem' }}>🎉 🏆 ♟️</div>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--color-plus)', marginBottom: '0.5rem' }}>
          ESPRESSIONE RISOLTA!
        </h2>

        <div style={{
          display: 'inline-block',
          fontFamily: 'var(--font-math)',
          fontSize: '1.8rem',
          fontWeight: 900,
          color: 'var(--color-var)',
          background: 'rgba(0, 240, 255, 0.08)',
          padding: '0.5rem 1.5rem',
          borderRadius: '12px',
          border: '1px solid rgba(0, 240, 255, 0.25)',
          marginBottom: '1.25rem',
        }}>
          {result}
        </div>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '2rem',
          marginBottom: '1.75rem',
          color: '#94a3b8',
          fontSize: '0.9rem',
        }}>
          <div>
            <span>Mosse: </span>
            <strong style={{ color: '#fff', fontSize: '1.1rem' }}>{moves}</strong>
          </div>
          <div>
            <span>Punteggio: </span>
            <strong style={{ color: 'var(--color-num)', fontSize: '1.1rem' }}>{score} pt</strong>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <button
            onClick={onOpenLeaderboard}
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.08)',
              color: '#fff',
              fontSize: '0.9rem',
              fontWeight: 700,
            }}
          >
            ✍️ Registra Punteggio
          </button>
          <button
            onClick={onNextLevel}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              color: '#fff',
              fontSize: '0.95rem',
              fontWeight: 900,
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            }}
          >
            Prossimo Livello ➔
          </button>
        </div>
      </div>
    </div>
  );
};
