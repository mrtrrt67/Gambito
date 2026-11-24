import React from 'react';
import { MathAST } from '@gambito/engine';
import { getKindLabel } from '../utils/astFormatter';

interface HeaderProps {
  ast: MathAST | null;
  movesCount: number;
  onRestart: () => void;
  onGenerateSimilar: () => void;
  onToggleHint: () => void;
  isHintVisible: boolean;
  onOpenPresets: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  ast,
  movesCount,
  onRestart,
  onGenerateSimilar,
  onToggleHint,
  isHintVisible,
  onOpenPresets,
}) => {
  const par = ast?.par ?? 1;
  const kindInfo = ast ? getKindLabel(ast.kind) : null;
  const parDiff = movesCount - par;

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(18, 24, 38, 0.85)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.75rem 1.5rem',
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.4rem',
            boxShadow: '0 0 15px rgba(59, 130, 246, 0.3)',
          }}>
            ♟️
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: '1.35rem',
                fontWeight: 900,
                letterSpacing: '1px',
                background: 'linear-gradient(90deg, #f8fafc, #93c5fd)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                GAMBITO
              </h1>
              <span style={{
                fontSize: '0.65rem',
                textTransform: 'uppercase',
                padding: '2px 6px',
                borderRadius: '4px',
                background: 'rgba(251, 191, 36, 0.15)',
                color: 'var(--accent-gold)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                fontWeight: 700,
              }}>
                Fase 3 UI
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Il Gioco Tattico dell'Algebra
            </p>
          </div>
        </div>

        {/* Par & Stats Bar */}
        {ast && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1.25rem',
            background: 'var(--bg-card)',
            padding: '0.4rem 1rem',
            borderRadius: '999px',
            border: '1px solid var(--border-subtle)',
          }}>
            {/* Kind badge */}
            {kindInfo && (
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 600,
                color: kindInfo.color,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}>
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: kindInfo.color }} />
                {kindInfo.label}
              </span>
            )}

            <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)' }} />

            {/* Par */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                PAR
              </span>
              <span style={{
                fontFamily: 'var(--font-math)',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: 'var(--accent-gold)',
              }}>
                {par}
              </span>
            </div>

            <div style={{ width: '1px', height: '16px', background: 'var(--border-subtle)' }} />

            {/* Current Moves */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', fontWeight: 700 }}>
                MOSSE
              </span>
              <span style={{
                fontFamily: 'var(--font-math)',
                fontWeight: 800,
                fontSize: '1.1rem',
                color: parDiff <= 0 ? 'var(--par-under)' : (parDiff === 1 ? 'var(--par-over)' : 'var(--par-blunder)'),
              }}>
                {movesCount}
              </span>
            </div>
          </div>
        )}

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            onClick={onOpenPresets}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease',
            }}
            title="Scegli tra i 5 Casi Bastardi e sfide classiche"
          >
            <span>📚</span>
            <span>Sfide</span>
          </button>

          <button
            onClick={onToggleHint}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              background: isHintVisible ? 'rgba(251, 191, 36, 0.2)' : 'var(--bg-card)',
              color: isHintVisible ? 'var(--accent-gold)' : 'var(--text-main)',
              border: isHintVisible ? '1px solid var(--accent-gold)' : '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Suggerimento tattico dell'engine (senza spoiler)"
          >
            <span>💡</span>
            <span>Hint</span>
          </button>

          <button
            onClick={onRestart}
            style={{
              padding: '0.5rem 0.85rem',
              borderRadius: '8px',
              background: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              fontSize: '0.85rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
            title="Ricomincia l'esercizio dall'inizio"
          >
            <span>🔄</span>
            <span>Reset</span>
          </button>

          <button
            onClick={onGenerateSimilar}
            style={{
              padding: '0.5rem 0.95rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              border: '1px solid #3b82f6',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.35)',
            }}
            title="Genera un problema simile procedurale"
          >
            <span>🎲</span>
            <span>Genera Simile</span>
          </button>
        </div>
      </div>
    </header>
  );
};
