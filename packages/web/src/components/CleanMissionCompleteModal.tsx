import React from 'react';

interface CleanMissionCompleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNextLevel: () => void;
  onOpenLeaderboard: () => void;
  onNextDifficultySameTopic?: () => void;
  topicDifficulty?: number;
  expression: string;
  finalResult: string;
  score: number;
  moves: number;
  par: number;
  lives: number;
}

export const CleanMissionCompleteModal: React.FC<CleanMissionCompleteModalProps> = ({
  isOpen,
  onClose,
  onNextLevel,
  onOpenLeaderboard,
  onNextDifficultySameTopic,
  topicDifficulty = 1,
  expression,
  finalResult,
  score,
  moves,
  par,
  lives,
}) => {
  if (!isOpen) return null;

  const isUnderPar = moves <= par;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 2000,
      background: 'rgba(5, 8, 20, 0.88)',
      backdropFilter: 'blur(12px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '1rem',
      boxSizing: 'border-box',
      userSelect: 'none',
      animation: 'fadeIn 0.25s ease-out',
      overflowY: 'auto',
    }}>
      <div style={{
        background: '#0d1326',
        border: '2px solid #10b981',
        borderRadius: '24px',
        padding: '1.5rem 1.25rem',
        maxWidth: '460px',
        width: '100%',
        boxSizing: 'border-box',
        boxShadow: '0 0 60px rgba(16, 185, 129, 0.45)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: '1rem',
        position: 'relative',
        margin: 'auto',
      }}>
        {/* Badge in alto */}
        <div style={{
          padding: '0.4rem 1.4rem',
          borderRadius: '999px',
          background: 'rgba(16, 185, 129, 0.2)',
          border: '1.5px solid #10b981',
          color: '#34d399',
          fontSize: '0.95rem',
          fontWeight: 900,
          letterSpacing: '2px',
          textTransform: 'uppercase',
        }}>
          ✨ CALCOLO CORRETTO
        </div>

        {/* Titolo Principale Esplicito */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', width: '100%' }}>
          <div style={{ fontSize: '2.6rem', lineHeight: '1' }}>🎉</div>
          <h2 className="mission-title" style={{
            fontSize: 'clamp(1.5rem, 6vw, 2.25rem)',
            fontWeight: 950,
            color: '#fff',
            letterSpacing: '0.5px',
            lineHeight: 1.15,
            textShadow: '0 0 30px rgba(16, 185, 129, 0.8)',
            margin: '0.35rem 0 0 0',
          }}>
            MISSIONE COMPIUTA!
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.95rem', margin: 0 }}>
            Tutti i passaggi algebrici sono stati verificati con successo!
          </p>
        </div>

        {/* Box Risultato Matematico */}
        <div style={{
          width: '100%',
          padding: '1.25rem',
          borderRadius: '18px',
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1.5px solid rgba(0, 240, 255, 0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
          maxWidth: '100%',
          boxSizing: 'border-box',
        }}>
          <span style={{
            fontSize: '0.85rem',
            color: '#64748b',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            maxWidth: '100%',
          }}>
            {expression}
          </span>
          <div style={{
            fontFamily: 'var(--font-math)',
            fontSize: finalResult.length > 18 ? '1.9rem' : (finalResult.length > 13 ? '2.3rem' : (finalResult.length > 9 ? '2.7rem' : '3.2rem')),
            fontWeight: 900,
            color: '#00f0ff',
            textShadow: '0 0 25px rgba(0, 240, 255, 0.75)',
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            maxWidth: '100%',
            padding: '0.2rem 0.5rem',
            textAlign: 'center',
          }}>
            {finalResult}
          </div>
        </div>

        {/* Statistiche di Prestazione */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
          gap: '0.6rem',
          width: '100%',
        }}>
          <div style={{ minWidth: 0, padding: '0.65rem 0.4rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Punteggio</div>
            <div style={{ fontSize: 'clamp(1.05rem, 4vw, 1.4rem)', fontWeight: 900, color: '#fbbf24' }}>{score} pt</div>
          </div>
          <div style={{ minWidth: 0, padding: '0.65rem 0.4rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Mosse / Par</div>
            <div style={{ fontSize: 'clamp(1.05rem, 4vw, 1.4rem)', fontWeight: 900, color: isUnderPar ? '#34d399' : '#e2e8f0' }}>
              {moves} / {par}
            </div>
          </div>
          <div style={{ minWidth: 0, padding: '0.65rem 0.4rem', borderRadius: '14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.72rem', color: '#64748b', textTransform: 'uppercase' }}>Vite</div>
            <div style={{ fontSize: 'clamp(1rem, 3.5vw, 1.25rem)', color: '#f87171' }}>
              {'❤️'.repeat(lives)}{'🖤'.repeat(Math.max(0, 3 - lives))}
            </div>
          </div>
        </div>

        {/* Pulsanti di Azione */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%', marginTop: '0.5rem' }}>
          {onNextDifficultySameTopic && (
            <button
              onClick={onNextDifficultySameTopic}
              style={{
                width: '100%',
                padding: '1rem',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                border: 'none',
                color: '#fff',
                fontSize: '1.2rem',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 0 30px rgba(16, 185, 129, 0.55)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                transition: 'all 0.2s ease',
              }}
            >
              <span>🎯 Continua questo Argomento (+Difficoltà Lv. {topicDifficulty + 1})</span>
              <span style={{ fontSize: '1.3rem' }}>➔</span>
            </button>
          )}

          <button
            onClick={onNextLevel}
            style={{
              width: '100%',
              padding: '0.85rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(99, 102, 241, 0.2))',
              border: '1.5px solid rgba(56, 189, 248, 0.5)',
              color: '#38bdf8',
              fontSize: '1.05rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'all 0.2s ease',
            }}
          >
            <span>📚 Prossimo Argomento del Programma</span>
            <span>➔</span>
          </button>

          <div style={{ display: 'flex', gap: '0.75rem', width: '100%' }}>
            <button
              onClick={onOpenLeaderboard}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#e2e8f0',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              🏆 Salva Record
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: '0.75rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#94a3b8',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              📓 Rivedi Passaggi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
