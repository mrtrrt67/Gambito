import React from 'react';

interface HintConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  hintCost: number;
}

export const HintConfirmModal: React.FC<HintConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  hintCost,
}) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 220,
      padding: '1rem',
    }}>
      <div style={{
        background: 'var(--bg-surface)',
        border: '1px solid var(--accent-gold)',
        borderRadius: '16px',
        padding: '1.75rem',
        maxWidth: '440px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
      }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💡</div>
        <h3 style={{
          fontSize: '1.2rem',
          fontWeight: 800,
          color: 'var(--accent-gold)',
          marginBottom: '0.5rem',
        }}>
          Richiedere un Aiuto Tattico?
        </h3>

        <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: 1.4, marginBottom: '1.25rem' }}>
          Per regolamento didattico, gli aiuti non sono automatici. Se confermi, riceverai un suggerimento non-spoiler ma subirai un malus di:
        </p>

        <div style={{
          display: 'inline-block',
          background: 'rgba(239, 68, 68, 0.15)',
          color: 'var(--accent-red)',
          fontWeight: 900,
          fontSize: '1.3rem',
          padding: '0.4rem 1.25rem',
          borderRadius: '8px',
          border: '1px solid rgba(239, 68, 68, 0.35)',
          marginBottom: '1.5rem',
          fontFamily: 'var(--font-math)',
        }}>
          -{hintCost} Punti
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              background: 'var(--bg-card)',
              color: 'var(--text-muted)',
              fontSize: '0.9rem',
              fontWeight: 700,
            }}
          >
            No, continuo da solo
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #f59e0b, #d97706)',
              color: '#000',
              fontSize: '0.9rem',
              fontWeight: 800,
              boxShadow: '0 2px 10px rgba(245, 158, 11, 0.35)',
            }}
          >
            Sì, mostra aiuto!
          </button>
        </div>
      </div>
    </div>
  );
};
