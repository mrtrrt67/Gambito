import React, { useState } from 'react';
import { NotebookLevel } from '../types';

interface CleanCustomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLevel: (newLevel: NotebookLevel) => void;
}

export const CleanCustomModal: React.FC<CleanCustomModalProps> = ({
  isOpen,
  onClose,
  onAddLevel,
}) => {
  const [expression, setExpression] = useState('');
  const [category, setCategory] = useState<'Equazione' | 'Scomposizione'>('Equazione');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = expression.trim();

    if (!trimmed) {
      setError('Inserisci un\'espressione valida.');
      return;
    }

    if (category === 'Equazione' && !trimmed.includes('=')) {
      setError('Un\'equazione deve contenere il simbolo di uguaglianza "=" (es. 4x - 6 = 10 o 5x - 7 = 2x + 8).');
      return;
    }

    // Calcolo par indicativo in base alla complessità
    let par = 3;
    if (trimmed.includes('(')) par += 1;
    if (category === 'Equazione' && trimmed.split('=')[1]?.includes('x')) par += 2; // x su entrambi i lati
    if (category === 'Scomposizione') par = 2;

    const newLvl: NotebookLevel = {
      id: `custom-${Date.now()}`,
      title: `${category}: ${trimmed}`,
      expression: trimmed,
      category,
      par,
      baseScore: 2500,
      hint: `Risolvi ${trimmed} manipolando direttamente i termini sul quaderno.`,
    };

    onAddLevel(newLvl);
    setExpression('');
    setError(null);
    onClose();
  };

  const handleQuickPreset = (presetExpr: string, cat: 'Equazione' | 'Scomposizione') => {
    setExpression(presetExpr);
    setCategory(cat);
    setError(null);
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 1000,
      background: 'rgba(5, 8, 18, 0.85)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      userSelect: 'none',
    }}>
      <div style={{
        background: '#0d1322',
        border: '1.5px solid var(--border-paper)',
        borderRadius: '24px',
        padding: '2.2rem',
        maxWidth: '560px',
        width: '100%',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.25rem',
      }}>
        {/* Header Modal */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.6rem' }}>✏️</span>
            <h3 style={{ fontSize: '1.3rem', fontWeight: 900, color: '#fff', letterSpacing: '0.5px' }}>
              Inserisci la tua Espressione
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              fontSize: '1.5rem',
              color: '#94a3b8',
              padding: '0.2rem 0.6rem',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '0.95rem', lineHeight: '1.5' }}>
          Digita qualsiasi equazione o polinomio: il sistema la caricherà direttamente sul quaderno digitale consentendoti di trascinare, dividere, invertire segni e risolverla manualmente.
        </p>

        {/* Form */}
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {/* Categoria */}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={() => setCategory('Equazione')}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                border: category === 'Equazione' ? '2px solid #00f0ff' : '1px solid rgba(255,255,255,0.1)',
                background: category === 'Equazione' ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255,255,255,0.02)',
                color: category === 'Equazione' ? '#00f0ff' : '#94a3b8',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              📐 Equazione
            </button>
            <button
              type="button"
              onClick={() => setCategory('Scomposizione')}
              style={{
                flex: 1,
                padding: '0.65rem 1rem',
                borderRadius: '12px',
                border: category === 'Scomposizione' ? '2px solid #fbbf24' : '1px solid rgba(255,255,255,0.1)',
                background: category === 'Scomposizione' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255,255,255,0.02)',
                color: category === 'Scomposizione' ? '#fbbf24' : '#94a3b8',
                fontWeight: 800,
                fontSize: '0.95rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              🧩 Scomposizione
            </button>
          </div>

          {/* Campo Testo */}
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#cbd5e1', marginBottom: '0.5rem' }}>
              Testo Espressione (es. <span style={{ color: '#00f0ff' }}>5x − 7 = 2x + 8</span> o <span style={{ color: '#fbbf24' }}>x² + 5x + 6</span>):
            </label>
            <input
              type="text"
              value={expression}
              onChange={e => {
                setExpression(e.target.value);
                setError(null);
              }}
              placeholder={category === 'Equazione' ? 'es. 4x - 6 = 10' : 'es. x² - 25 o x² + 5x + 6'}
              autoFocus
              style={{
                width: '100%',
                padding: '0.85rem 1.2rem',
                borderRadius: '14px',
                background: '#070b14',
                border: error ? '1.5px solid #ef4444' : '1.5px solid var(--border-paper)',
                color: '#fff',
                fontFamily: 'var(--font-math)',
                fontSize: '1.3rem',
                fontWeight: 700,
                outline: 'none',
              }}
            />
          </div>

          {error && (
            <div style={{ color: '#f87171', fontSize: '0.85rem', fontWeight: 700 }}>
              {error}
            </div>
          )}

          {/* Suggerimenti veloci / Esempi pronti */}
          <div>
            <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 700, marginBottom: '0.5rem' }}>
              OPPURE SCEGLI UN ESEMPIO RAPIDO:
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {category === 'Equazione' ? (
                <>
                  {['5x − 7 = 2x + 8', '7x + 4 = 3x + 20', '4(x − 1) = 16', '3x + 9 = 24'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleQuickPreset(p, 'Equazione')}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-math)',
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </>
              ) : (
                <>
                  {['x² − 16', '25 − 4x²', 'x² + 5x + 6', 'x² − 7x + 12', '4x³ − 8x²'].map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => handleQuickPreset(p, 'Scomposizione')}
                      style={{
                        padding: '0.4rem 0.75rem',
                        borderRadius: '8px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        color: '#cbd5e1',
                        fontSize: '0.85rem',
                        fontFamily: 'var(--font-math)',
                        cursor: 'pointer',
                      }}
                    >
                      {p}
                    </button>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Bottoni azione */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.4rem',
                borderRadius: '12px',
                background: 'transparent',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#cbd5e1',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Annulla
            </button>
            <button
              type="submit"
              style={{
                padding: '0.75rem 1.8rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                color: '#fff',
                fontWeight: 900,
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)',
                cursor: 'pointer',
              }}
            >
              🚀 Carica sul Quaderno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
