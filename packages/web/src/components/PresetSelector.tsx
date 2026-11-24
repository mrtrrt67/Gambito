import React, { useState } from 'react';
import { PRESETS } from '../data/presets';
import { ChallengePreset } from '../types';

interface PresetSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPreset: (preset: ChallengePreset) => void;
  onCustomExpression: (expr: string) => void;
}

export const PresetSelector: React.FC<PresetSelectorProps> = ({
  isOpen,
  onClose,
  onSelectPreset,
  onCustomExpression,
}) => {
  const [customInput, setCustomInput] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Tutti');

  if (!isOpen) return null;

  const categories = ['Tutti', 'Casi Bastardi', 'Prodotti Notevoli', 'Raccoglimento', 'Equazioni'];
  const filteredPresets = selectedCategory === 'Tutti'
    ? PRESETS
    : PRESETS.filter(p => p.category === selectedCategory);

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customInput.trim()) {
      onCustomExpression(customInput.trim());
      setCustomInput('');
      onClose();
    }
  };

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
      zIndex: 150,
      padding: '1.5rem',
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '20px',
        maxWidth: '800px',
        width: '100%',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <h3 style={{
              fontSize: '1.25rem',
              fontWeight: 800,
              fontFamily: 'var(--font-display)',
              color: 'var(--text-main)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <span>📚</span>
              <span>Libreria Sfide Tattiche</span>
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Include i 5 Casi Bastardi e le sfide didattiche per testare il motore
            </p>
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

        {/* Custom Input Bar */}
        <form onSubmit={handleCustomSubmit} style={{
          padding: '1rem 1.5rem',
          background: 'var(--bg-card)',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          gap: '0.75rem',
        }}>
          <input
            type="text"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
            placeholder="Scrivi una qualsiasi formula... (es. 4x^2 + 12x + 9 oppure 3x + 5 = 14)"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-main)',
              fontFamily: 'var(--font-math)',
              fontSize: '1rem',
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.25rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.9rem',
              whiteSpace: 'nowrap',
            }}
          >
            Carica Formula
          </button>
        </form>

        {/* Categories Tab */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.75rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          overflowX: 'auto',
        }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                background: selectedCategory === cat ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
                color: selectedCategory === cat ? '#60a5fa' : 'var(--text-dim)',
                border: selectedCategory === cat ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid transparent',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Presets List */}
        <div style={{
          padding: '1.25rem 1.5rem',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '0.75rem',
        }}>
          {filteredPresets.map(preset => {
            const isBastardo = preset.category === 'Casi Bastardi';
            return (
              <div
                key={preset.id}
                onClick={() => {
                  onSelectPreset(preset);
                  onClose();
                }}
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  background: isBastardo
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.08), rgba(245, 158, 11, 0.08))'
                    : 'var(--bg-card)',
                  border: isBastardo
                    ? '1px solid rgba(239, 68, 68, 0.35)'
                    : '1px solid var(--border-subtle)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    color: isBastardo ? '#f87171' : 'var(--text-main)',
                  }}>
                    {preset.title}
                  </span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    background: isBastardo ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    color: isBastardo ? 'var(--accent-red)' : 'var(--text-dim)',
                  }}>
                    {preset.difficulty}
                  </span>
                </div>

                <code style={{
                  fontFamily: 'var(--font-math)',
                  fontSize: '1.1rem',
                  fontWeight: 700,
                  color: 'var(--accent-cyan)',
                  marginTop: '2px',
                }}>
                  {preset.expression}
                </code>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {preset.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
