import React from 'react';
import { AlgebraTopic } from '../data/topics';

interface CleanHeaderProps {
  currentLevel: any;
  topics: AlgebraTopic[];
  activeTopic: AlgebraTopic;
  onSelectTopic: (topic: AlgebraTopic) => void;
  topicDifficulty: number;
  onPracticeTopic: () => void;
  lives: number; // 0 to 3
  score: number;
  moves: number;
  onOpenHint: () => void;
  onOpenLeaderboard: () => void;
  onOpenCustomModal?: () => void;
  onGenerateProgressiveLevel?: () => void;
}

export const CleanHeader: React.FC<CleanHeaderProps> = ({
  currentLevel,
  topics,
  activeTopic,
  onSelectTopic,
  topicDifficulty,
  onPracticeTopic,
  lives,
  score,
  moves,
  onOpenHint,
  onOpenLeaderboard,
  onOpenCustomModal,
  onGenerateProgressiveLevel,
}) => {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.9rem 2rem',
      background: 'rgba(12, 16, 29, 0.9)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid var(--border-card)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      flexWrap: 'wrap',
      gap: '1rem',
    }}>
      {/* Brand & Livello */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.6rem' }}>♟️</span>
          <span style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 900,
            fontSize: '1.3rem',
            letterSpacing: '1px',
            background: 'linear-gradient(90deg, #fff, #38bdf8)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            GAMBITO
          </span>
        </div>

        {/* Dropdown Curricolare Diviso per Macro-Argomenti */}
        <select
          value={activeTopic?.id}
          onChange={e => {
            const found = topics.find(t => t.id === e.target.value);
            if (found) onSelectTopic(found);
          }}
          style={{
            background: 'var(--bg-card)',
            color: 'var(--color-var)',
            border: '1.5px solid rgba(56, 189, 248, 0.45)',
            padding: '0.45rem 0.85rem',
            borderRadius: '10px',
            fontSize: '0.86rem',
            fontWeight: 800,
            cursor: 'pointer',
            outline: 'none',
            maxWidth: '380px',
          }}
        >
          {Array.from(new Set(topics.map(t => t.group))).map(group => (
            <optgroup key={group} label={`── ${group.toUpperCase()} ──`} style={{ background: '#0a0f1d', color: '#94a3b8' }}>
              {topics.filter(t => t.group === group).map(topic => (
                <option key={topic.id} value={topic.id} style={{ background: '#0f172a', color: '#fff' }}>
                  {topic.icon} {topic.name} ({topic.baseExample.expression})
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {/* Pulsante Esercitazione Mirata su Questo Argomento con Difficoltà Progressiva */}
        <button
          onClick={onPracticeTopic}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.22), rgba(6, 182, 212, 0.22))',
            border: '1.5px solid #10b981',
            padding: '0.45rem 1rem',
            borderRadius: '10px',
            color: '#34d399',
            fontSize: '0.86rem',
            fontWeight: 900,
            cursor: 'pointer',
            boxShadow: '0 2px 14px rgba(16, 185, 129, 0.25)',
            transition: 'all 0.15s ease',
          }}
          title={`Genera un nuovo test su "${activeTopic?.name}" a difficoltà crescente (Lv. ${topicDifficulty})`}
        >
          <span>🎯</span>
          <span>Esercitati su Questo Argomento (Difficoltà Lv. {topicDifficulty})</span>
        </button>

        {onOpenCustomModal && (
          <button
            onClick={onOpenCustomModal}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'rgba(56, 189, 248, 0.12)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              padding: '0.45rem 0.85rem',
              borderRadius: '10px',
              color: '#38bdf8',
              fontSize: '0.85rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Inserisci una tua espressione personalizzata da risolvere"
          >
            <span>✏️</span>
            <span>Nuova Espressione</span>
          </button>
        )}
      </div>

      {/* Mosse vs Par (Meno mosse = Più punti) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: 'var(--bg-card)',
        padding: '0.35rem 1rem',
        borderRadius: '12px',
        border: '1px solid var(--border-card)',
      }}>
        <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase' }}>
          Mosse:
        </div>
        <div style={{ fontFamily: 'var(--font-math)', fontSize: '1.15rem', fontWeight: 900, color: '#fff' }}>
          <span style={{ color: moves <= currentLevel.par ? 'var(--color-plus)' : '#f87171' }}>{moves}</span>
          <span style={{ color: '#64748b' }}> / </span>
          <span style={{ color: 'var(--color-num)' }}>{currentLevel.par} Par</span>
        </div>
      </div>

      {/* Vite / Cuori (3 Strike Rule) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--bg-card)',
        padding: '0.35rem 1rem',
        borderRadius: '999px',
        border: '1px solid var(--border-card)',
      }}>
        {[1, 2, 3].map(i => {
          const isAlive = i <= lives;
          return (
            <span
              key={i}
              className={isAlive ? 'animate-pulse' : ''}
              style={{
                fontSize: '1.35rem',
                filter: isAlive ? 'drop-shadow(0 0 6px rgba(239, 68, 68, 0.7))' : 'grayscale(1) opacity(0.25)',
                transition: 'all 0.3s ease',
              }}
              title={isAlive ? 'Vita attiva' : 'Errore'}
            >
              {isAlive ? '❤️' : '🖤'}
            </span>
          );
        })}
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 700, marginLeft: '4px' }}>
          {lives}/3
        </span>
      </div>

      {/* Punteggio, Tasto Aiuto, Classifica */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          fontFamily: 'var(--font-math)',
          fontSize: '1.25rem',
          fontWeight: 800,
          color: 'var(--color-num)',
        }}>
          {score.toLocaleString()} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>pt</span>
        </div>

        <button
          onClick={onOpenHint}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'rgba(251, 191, 36, 0.1)',
            border: '1px solid rgba(251, 191, 36, 0.3)',
            padding: '0.45rem 0.85rem',
            borderRadius: '8px',
            color: 'var(--color-num)',
            fontWeight: 700,
            fontSize: '0.85rem',
          }}
          title="Richiedi aiuto (-50 pt)"
        >
          <span>💡</span>
          <span>Aiuto</span>
        </button>

        <button
          onClick={onOpenLeaderboard}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
            padding: '0.45rem 0.95rem',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.85rem',
            boxShadow: '0 2px 8px rgba(14, 165, 233, 0.35)',
          }}
        >
          <span>🏆</span>
          <span>Classifica</span>
        </button>
      </div>
    </header>
  );
};
