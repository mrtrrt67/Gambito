import React, { useState } from 'react';

export interface ScoreItem {
  id: string;
  name: string;
  expression: string;
  score: number;
  moves: number;
  par?: number;
  date: string;
}

interface CleanLeaderboardProps {
  isOpen: boolean;
  onClose: () => void;
  scores: ScoreItem[];
  currentScore: number;
  currentExpression: string;
  onSaveScore: (name: string) => void;
  canSave: boolean;
}

export const CleanLeaderboard: React.FC<CleanLeaderboardProps> = ({
  isOpen,
  onClose,
  scores,
  currentScore,
  currentExpression,
  onSaveScore,
  canSave,
}) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSaveScore(name.trim());
      setName('');
    }
  };

  const sorted = [...scores].sort((a, b) => b.score - a.score);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(5, 8, 15, 0.8)',
      backdropFilter: 'blur(8px)',
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
        maxWidth: '500px',
        width: '100%',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--color-num)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>🏆</span>
            <span>Classifica Migliori Tattici</span>
          </h2>
          <button onClick={onClose} style={{ fontSize: '1.4rem', color: '#94a3b8' }}>✕</button>
        </div>

        {/* Salva punteggio corrente se vittoria */}
        {canSave && (
          <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
            <input
              type="text"
              autoFocus
              placeholder="Il tuo nome o nickname..."
              value={name}
              onChange={e => setName(e.target.value)}
              style={{
                flex: 1,
                padding: '0.6rem 0.9rem',
                borderRadius: '8px',
                background: '#0c101d',
                border: '1px solid var(--border-card)',
                color: '#fff',
                fontSize: '0.9rem',
              }}
            />
            <button
              type="submit"
              disabled={!name.trim()}
              style={{
                padding: '0.6rem 1.2rem',
                borderRadius: '8px',
                background: name.trim() ? '#10b981' : '#334155',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}
            >
              Salva
            </button>
          </form>
        )}

        {/* Lista */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
          {sorted.map((item, idx) => {
            const isTop3 = idx < 3;
            const medals = ['🥇', '🥈', '🥉'];
            return (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '10px',
                  background: isTop3 ? 'rgba(251, 191, 36, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                  border: isTop3 ? '1px solid rgba(251, 191, 36, 0.25)' : '1px solid transparent',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ fontSize: '1.2rem', width: '24px', textAlign: 'center' }}>
                    {isTop3 ? medals[idx] : `#${idx + 1}`}
                  </span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>{item.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{item.expression} &bull; {item.date}</div>
                  </div>
                </div>

                <div style={{ fontFamily: 'var(--font-math)', fontWeight: 800, color: 'var(--color-num)' }}>
                  {item.score} pt
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
