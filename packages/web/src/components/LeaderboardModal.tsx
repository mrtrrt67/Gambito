import React, { useState } from 'react';
import { LeaderboardEntry } from '../types';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  entries: LeaderboardEntry[];
  currentScore?: number;
  currentExpression?: string;
  onSaveCurrentRun?: (playerName: string) => void;
  canSave?: boolean;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  entries,
  currentScore,
  currentExpression,
  onSaveCurrentRun,
  canSave = false,
}) => {
  const [playerName, setPlayerName] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (playerName.trim() && onSaveCurrentRun) {
      onSaveCurrentRun(playerName.trim());
      setPlayerName('');
    }
  };

  const sortedEntries = [...entries].sort((a, b) => b.score - a.score);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 200,
      padding: '1.5rem',
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-gold)',
        borderRadius: '20px',
        maxWidth: '650px',
        width: '100%',
        maxHeight: '85vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 30px var(--accent-gold-glow)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.1), transparent)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.8rem' }}>🏆</span>
            <div>
              <h3 style={{
                fontSize: '1.3rem',
                fontWeight: 900,
                fontFamily: 'var(--font-display)',
                color: 'var(--accent-gold)',
                letterSpacing: '0.5px',
              }}>
                Classifica & Hall of Fame
              </h3>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                I migliori risolutori tattici di Gambito
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              color: 'var(--text-muted)',
              fontSize: '1.4rem',
              padding: '4px 8px',
              borderRadius: '6px',
            }}
          >
            ✕
          </button>
        </div>

        {/* Salva Risultato Corrente (se vittoria) */}
        {canSave && currentScore !== undefined && currentScore > 0 && (
          <form
            onSubmit={handleSave}
            style={{
              padding: '1rem 1.5rem',
              background: 'rgba(52, 211, 153, 0.08)',
              borderBottom: '1px solid rgba(52, 211, 153, 0.25)',
              display: 'flex',
              gap: '0.75rem',
              alignItems: 'center',
            }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.75rem', color: '#6ee7b7', fontWeight: 700, marginBottom: '2px' }}>
                🎉 Salva il tuo punteggio: {currentScore} pt ({currentExpression})
              </div>
              <input
                type="text"
                autoFocus
                placeholder="Inserisci il tuo nome o nickname..."
                value={playerName}
                onChange={e => setPlayerName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.9rem',
                }}
              />
            </div>
            <button
              type="submit"
              disabled={!playerName.trim()}
              style={{
                alignSelf: 'flex-end',
                padding: '0.55rem 1rem',
                borderRadius: '6px',
                background: playerName.trim() ? '#10b981' : '#334155',
                color: '#fff',
                fontWeight: 700,
                fontSize: '0.85rem',
                cursor: playerName.trim() ? 'pointer' : 'not-allowed',
              }}
            >
              Registra ✍️
            </button>
          </form>
        )}

        {/* Entries List */}
        <div style={{ padding: '1.25rem 1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {sortedEntries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-dim)' }}>
              Nessuna partita registrata finora. Sii il primo a scalare la classifica!
            </div>
          ) : (
            sortedEntries.map((item, index) => {
              const isTop3 = index < 3;
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    borderRadius: '10px',
                    background: isTop3 ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.1), rgba(255, 255, 255, 0.02))' : 'var(--bg-card)',
                    border: isTop3 ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: isTop3 ? '1.4rem' : '0.9rem', fontWeight: 800, width: '28px', textAlign: 'center' }}>
                      {isTop3 ? medals[index] : `#${index + 1}`}
                    </span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{item.playerName}</span>
                        <span style={{ fontSize: '0.65rem', padding: '1px 5px', borderRadius: '4px', background: 'rgba(56, 189, 248, 0.15)', color: 'var(--accent-cyan)' }}>
                          {item.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-math)' }}>
                        {item.expression} &bull; {item.moves} mosse (Par {item.par}) &bull; {item.errors} errori
                      </div>
                    </div>
                  </div>

                  <div style={{
                    fontFamily: 'var(--font-math)',
                    fontSize: '1.2rem',
                    fontWeight: 900,
                    color: isTop3 ? 'var(--accent-gold)' : 'var(--text-main)',
                  }}>
                    {item.score} pt
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
