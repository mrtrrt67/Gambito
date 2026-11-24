import React, { useState } from 'react';
import { TelemetryEvent } from '../types';

interface TelemetryDrawerProps {
  events: TelemetryEvent[];
  onClear?: () => void;
}

export const TelemetryDrawer: React.FC<TelemetryDrawerProps> = ({ events, onClear }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{
      marginTop: '1.5rem',
      background: 'var(--bg-surface)',
      border: '1px solid var(--border-subtle)',
      borderRadius: '16px',
      overflow: 'hidden',
    }}>
      {/* Header bar */}
      <div
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          padding: '0.85rem 1.25rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: 'var(--bg-card)',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{ fontSize: '1.1rem' }}>📡</span>
          <span style={{
            fontSize: '0.85rem',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            color: 'var(--text-main)',
          }}>
            Tracciamento Micro-Gesti & Operazioni ({events.length})
          </span>
          <span style={{
            fontSize: '0.7rem',
            background: 'rgba(56, 189, 248, 0.15)',
            color: 'var(--accent-cyan)',
            padding: '2px 6px',
            borderRadius: '4px',
            fontWeight: 700,
          }}>
            LIVE TELEMETRY
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {events.length > 0 && onClear && (
            <button
              onClick={e => {
                e.stopPropagation();
                onClear();
              }}
              style={{
                fontSize: '0.75rem',
                color: 'var(--text-dim)',
                padding: '2px 6px',
                borderRadius: '4px',
              }}
            >
              Azzera Log
            </button>
          )}
          <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isOpen ? '▲ Chiudi' : '▼ Espandi'}
          </span>
        </div>
      </div>

      {/* Events Stream */}
      {isOpen && (
        <div style={{
          maxHeight: '260px',
          overflowY: 'auto',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          flexDirection: 'column-reverse',
          gap: '0.5rem',
          background: 'rgba(0, 0, 0, 0.25)',
          fontFamily: 'var(--font-math)',
          fontSize: '0.8rem',
        }}>
          {events.length === 0 ? (
            <div style={{ color: 'var(--text-dim)', textAlign: 'center', padding: '1rem' }}>
              Nessun gesto o operazione ancora rilevata. Trascina un numero o simbolo per iniziare il tracciamento!
            </div>
          ) : (
            events.map(ev => (
              <div
                key={ev.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.75rem',
                  padding: '0.4rem 0.6rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  borderLeft: `3px solid ${ev.color}`,
                }}
              >
                <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                  {ev.timestamp}
                </span>

                <span style={{
                  color: ev.color,
                  fontWeight: 800,
                  fontSize: '0.7rem',
                  textTransform: 'uppercase',
                  padding: '1px 5px',
                  borderRadius: '3px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  whiteSpace: 'nowrap',
                }}>
                  {ev.action}
                </span>

                <div style={{ flex: 1, color: 'var(--text-main)' }}>
                  <strong>{ev.description}</strong>
                  {ev.details && (
                    <span style={{ color: 'var(--text-muted)', marginLeft: '6px' }}>
                      &mdash; {ev.details}
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
