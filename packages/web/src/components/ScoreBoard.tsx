import React from 'react';

interface ScoreBoardProps {
  score: number;
  lives: number;       // 0 to 3
  strikes: number;     // 0 to 3
  movesCount: number;
  par: number;
  streak: number;
  onOpenLeaderboard: () => void;
  onRequestHint: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  lives,
  strikes,
  movesCount,
  par,
  streak,
  onOpenLeaderboard,
  onRequestHint,
}) => {
  return (
    <div style={{
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '16px',
      padding: '0.9rem 1.4rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: '1rem',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
      marginBottom: '1.25rem',
    }}>
      {/* Vite / Cuori (3 Strike Rule) */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 800, letterSpacing: '0.5px' }}>
            Vite Residue (Max 3 Errori)
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
            {[1, 2, 3].map(heartIndex => {
              const isAlive = heartIndex <= lives;
              return (
                <span
                  key={heartIndex}
                  className={isAlive ? 'animate-heart' : ''}
                  style={{
                    fontSize: '1.4rem',
                    filter: isAlive ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.7))' : 'grayscale(1) opacity(0.35)',
                    transition: 'all 0.3s ease',
                  }}
                  title={isAlive ? 'Vita attiva' : 'Errore commesso (Strike)'}
                >
                  {isAlive ? '❤️' : '🖤'}
                </span>
              );
            })}
            <span style={{
              marginLeft: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              background: strikes > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: strikes > 0 ? 'var(--accent-red)' : 'var(--text-dim)',
            }}>
              {strikes}/3 Errori
            </span>
          </div>
        </div>
      </div>

      {/* Punteggio con Streak */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        background: 'var(--bg-card)',
        padding: '0.4rem 1.25rem',
        borderRadius: '12px',
        border: '1px solid var(--border-subtle)',
      }}>
        <div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800 }}>
            Punteggio
          </span>
          <div style={{
            fontFamily: 'var(--font-math)',
            fontSize: '1.35rem',
            fontWeight: 900,
            color: 'var(--accent-gold)',
            textShadow: '0 0 10px var(--accent-gold-glow)',
          }}>
            {score.toLocaleString()} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>pt</span>
          </div>
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />

        <div>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 800 }}>
            Par / Mosse
          </span>
          <div style={{ fontFamily: 'var(--font-math)', fontSize: '1.15rem', fontWeight: 800 }}>
            <span style={{ color: 'var(--accent-cyan)' }}>{movesCount}</span>
            <span style={{ color: 'var(--text-dim)' }}> / </span>
            <span style={{ color: 'var(--accent-gold)' }}>{par}</span>
          </div>
        </div>

        {streak > 1 && (
          <>
            <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)' }} />
            <div>
              <span style={{ fontSize: '0.65rem', color: '#34d399', textTransform: 'uppercase', fontWeight: 800 }}>
                Streak 🔥
              </span>
              <div style={{ fontFamily: 'var(--font-math)', fontSize: '1.15rem', fontWeight: 800, color: '#34d399' }}>
                x{streak}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Pulsanti Classifica & Chiedi Aiuto */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          onClick={onRequestHint}
          style={{
            padding: '0.5rem 0.85rem',
            borderRadius: '8px',
            background: 'rgba(251, 191, 36, 0.1)',
            color: 'var(--accent-gold)',
            border: '1px solid rgba(251, 191, 36, 0.35)',
            fontSize: '0.8rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease',
          }}
          title="Chiedi un suggerimento all'engine (Penalità: -50 pt)"
        >
          <span>💡</span>
          <span>Chiedi Aiuto</span>
          <span style={{ fontSize: '0.65rem', opacity: 0.8, color: '#fca5a5' }}>(-50 pt)</span>
        </button>

        <button
          onClick={onOpenLeaderboard}
          style={{
            padding: '0.5rem 0.95rem',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #4f46e5, #3b82f6)',
            color: '#fff',
            fontSize: '0.8rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(79, 70, 229, 0.35)',
          }}
        >
          <span>🏆</span>
          <span>Classifica</span>
        </button>
      </div>
    </div>
  );
};
