import React from 'react';
import { MoveHistoryItem } from '../types';

interface MoveHistoryProps {
  history: MoveHistoryItem[];
  onRevertToStep?: (index: number) => void;
}

export const MoveHistory: React.FC<MoveHistoryProps> = ({ history, onRevertToStep }) => {
  if (history.length === 0) return null;

  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: '16px',
      border: '1px solid var(--border-subtle)',
      padding: '1.25rem',
      marginTop: '1.5rem',
    }}>
      <h3 style={{
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        color: 'var(--text-muted)',
        marginBottom: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
      }}>
        <span>📜</span>
        <span>Registro Mosse Tattiche ({history.length})</span>
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {history.map((item, index) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.6rem 0.9rem',
              borderRadius: '8px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span style={{
                fontFamily: 'var(--font-math)',
                fontWeight: 700,
                fontSize: '0.85rem',
                color: 'var(--accent-gold)',
                width: '24px',
              }}>
                #{item.stepNumber}
              </span>
              <div>
                <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-main)', marginRight: '8px' }}>
                  {item.moveName}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  {item.description}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <code style={{
                fontFamily: 'var(--font-math)',
                fontSize: '0.85rem',
                color: 'var(--accent-cyan)',
                background: 'rgba(56, 189, 248, 0.08)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}>
                {item.expression}
              </code>

              {onRevertToStep && index < history.length - 1 && (
                <button
                  onClick={() => onRevertToStep(index)}
                  style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-dim)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: 'rgba(255, 255, 255, 0.05)',
                  }}
                  title="Torna a questa mossa"
                >
                  ↩️
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
