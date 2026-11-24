import React from 'react';
import { MathToken } from '../types';

interface TokenTileProps {
  token: MathToken;
  index: number;
  isSelected?: boolean;
  onSelect?: () => void;
  onToggleSign?: () => void;
  onDelete?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  isDraggable?: boolean;
}

export const TokenTile: React.FC<TokenTileProps> = ({
  token,
  isSelected,
  onSelect,
  onToggleSign,
  onDelete,
  onDragStart,
  isDraggable = true,
}) => {
  const isSign = token.type === 'sign';

  return (
    <div
      draggable={isDraggable}
      onDragStart={onDragStart}
      onClick={onSelect}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0.75rem 1.1rem',
        minWidth: '48px',
        height: '64px',
        borderRadius: '14px',
        background: isSelected
          ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.3), rgba(2, 132, 199, 0.4))'
          : 'var(--bg-card)',
        border: isSelected ? '2px solid var(--color-var)' : `1.5px solid ${token.color}40`,
        boxShadow: isSelected
          ? '0 0 20px rgba(0, 240, 255, 0.35)'
          : `0 4px 12px rgba(0, 0, 0, 0.3), inset 0 0 8px ${token.color}15`,
        fontFamily: 'var(--font-math)',
        fontSize: '1.75rem',
        fontWeight: 800,
        color: token.color,
        cursor: 'grab',
        userSelect: 'none',
        position: 'relative',
        transition: 'all 0.15s cubic-bezier(0.2, 0, 0, 1)',
      }}
      title={isSign ? 'Trascina o tocca per invertire il segno (+ / −)!' : 'Trascina per spostare questo simbolo'}
    >
      {token.text}

      {/* Se è un segno, mostra icona per invertire con 1 tocco */}
      {isSign && onToggleSign && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onToggleSign();
          }}
          style={{
            position: 'absolute',
            bottom: '2px',
            right: '4px',
            fontSize: '0.65rem',
            color: '#94a3b8',
            opacity: 0.7,
            cursor: 'pointer',
          }}
          title="Inverti segno"
        >
          ⇄
        </span>
      )}

      {/* Tasto elimina se token temporaneo */}
      {onDelete && (
        <span
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          style={{
            position: 'absolute',
            top: '-6px',
            right: '-6px',
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            background: '#ef4444',
            color: '#fff',
            fontSize: '11px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          ✕
        </span>
      )}
    </div>
  );
};
