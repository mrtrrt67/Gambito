import React, { useState } from 'react';
import { MathToken, PuzzleLevel } from '../types';
import { TokenTile } from './TokenTile';

interface EquationWorkbenchProps {
  level: PuzzleLevel;
  tokens: MathToken[];
  onReorderTokens: (newTokens: MathToken[]) => void;
  onCheckStep: () => void;
  feedbackMessage: string | null;
  isError: boolean;
  onCombineTokens: (startIndex: number, endIndex: number, resultToken: MathToken) => void;
  onAddToken: (token: MathToken, index: number) => void;
  onDeleteToken: (index: number) => void;
}

export const EquationWorkbench: React.FC<EquationWorkbenchProps> = ({
  level,
  tokens,
  onReorderTokens,
  onCheckStep,
  feedbackMessage,
  isError,
  onCombineTokens,
  onAddToken,
  onDeleteToken,
}) => {
  const [draggedTokenIndex, setDraggedTokenIndex] = useState<number | null>(null);
  const [draggedToolboxToken, setDraggedToolboxToken] = useState<MathToken | null>(null);
  const [dropSlotIndex, setDropSlotIndex] = useState<number | null>(null);

  // Toolbox symbols tailored for factoring and equation solving
  const TOOLBOX_SYMBOLS: MathToken[] = [
    { id: 'tb-lp', text: '(', type: 'paren', color: '#60a5fa' },
    { id: 'tb-rp', text: ')', type: 'paren', color: '#60a5fa' },
    { id: 'tb-plus', text: '+', type: 'sign', color: '#34d399' },
    { id: 'tb-minus', text: '−', type: 'sign', color: '#f87171' },
    { id: 'tb-div', text: '÷', type: 'operator', color: '#c084fc' },
    { id: 'tb-pow2', text: '²', type: 'operator', color: '#a78bfa' },
    { id: 'tb-x', text: 'x', type: 'variable', color: '#00f0ff' },
    { id: 'tb-2x', text: '2x', type: 'variable', color: '#00f0ff' },
    { id: 'tb-2', text: '2', type: 'number', color: '#fbbf24' },
    { id: 'tb-3', text: '3', type: 'number', color: '#fbbf24' },
    { id: 'tb-4', text: '4', type: 'number', color: '#fbbf24' },
    { id: 'tb-5', text: '5', type: 'number', color: '#fbbf24' },
  ];

  // Helper per invertire segno
  const handleToggleSign = (index: number) => {
    const current = tokens[index];
    if (!current || current.type !== 'sign') return;
    const newText = current.text === '+' ? '−' : '+';
    const newColor = newText === '+' ? '#34d399' : '#f87171';
    const copy = [...tokens];
    copy[index] = { ...current, text: newText, color: newColor };
    onReorderTokens(copy);
  };

  // Drag and drop handlers
  const handleDragStart = (index: number) => {
    setDraggedTokenIndex(index);
    setDraggedToolboxToken(null);
  };

  const handleToolboxDragStart = (tok: MathToken) => {
    setDraggedToolboxToken({
      ...tok,
      id: `tok-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    });
    setDraggedTokenIndex(null);
  };

  const handleDropOnSlot = (targetIndex: number) => {
    if (draggedTokenIndex !== null) {
      if (draggedTokenIndex === targetIndex || draggedTokenIndex === targetIndex - 1) {
        setDraggedTokenIndex(null);
        setDropSlotIndex(null);
        return;
      }
      const copy = [...tokens];
      const [moved] = copy.splice(draggedTokenIndex, 1);
      const insertAt = targetIndex > draggedTokenIndex ? targetIndex - 1 : targetIndex;
      copy.splice(insertAt, 0, moved!);
      onReorderTokens(copy);
    } else if (draggedToolboxToken !== null) {
      onAddToken(draggedToolboxToken, targetIndex);
    }
    setDraggedTokenIndex(null);
    setDraggedToolboxToken(null);
    setDropSlotIndex(null);
  };

  // Rilevamento automatico di operazioni calcolabili manualmente tra numeri consecutivi
  // es: 14 - 6 oppure 10 + 5 oppure 8 ÷ 2 oppure 15 ÷ 3
  const detectOperableSlice = (): { start: number; end: number; label: string; resultToken: MathToken } | null => {
    for (let i = 0; i < tokens.length - 2; i++) {
      const a = tokens[i];
      const op = tokens[i + 1];
      const b = tokens[i + 2];
      if (a?.type === 'number' && b?.type === 'number') {
        const n1 = parseInt(a.text, 10);
        const n2 = parseInt(b.text, 10);
        if (op?.text === '−' || op?.text === '-') {
          const res = n1 - n2;
          return {
            start: i,
            end: i + 2,
            label: `⚡ Calcola: ${n1} − ${n2} = ${res}`,
            resultToken: { id: `res-${Date.now()}`, text: res.toString(), type: 'number', color: '#fbbf24' },
          };
        }
        if (op?.text === '+') {
          const res = n1 + n2;
          return {
            start: i,
            end: i + 2,
            label: `⚡ Calcola: ${n1} + ${n2} = ${res}`,
            resultToken: { id: `res-${Date.now()}`, text: res.toString(), type: 'number', color: '#fbbf24' },
          };
        }
        if (op?.text === '÷' || op?.text === '/') {
          if (n2 !== 0 && n1 % n2 === 0) {
            const res = n1 / n2;
            return {
              start: i,
              end: i + 2,
              label: `⚡ Calcola: ${n1} ÷ ${n2} = ${res}`,
              resultToken: { id: `res-${Date.now()}`, text: res.toString(), type: 'number', color: '#fbbf24' },
            };
          }
        }
      }
    }
    return null;
  };

  const operable = detectOperableSlice();

  return (
    <div style={{
      width: '100%',
      maxWidth: '920px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1.5rem',
    }}>
      {/* Obiettivo Livello */}
      <div style={{
        fontSize: '0.85rem',
        color: '#94a3b8',
        background: 'rgba(255, 255, 255, 0.03)',
        padding: '6px 16px',
        borderRadius: '999px',
        border: '1px solid var(--border-card)',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}>
        <span>🎯</span>
        <span>Obiettivo finale:</span>
        <strong style={{ color: 'var(--color-var)', fontFamily: 'var(--font-math)', fontSize: '1rem' }}>
          {level.targetDisplay}
        </strong>
      </div>

      {/* Pulsante rapido di calcolo aritmetico se due numeri con operatore sono adiacenti */}
      {operable && (
        <button
          onClick={() => onCombineTokens(operable.start, operable.end, operable.resultToken)}
          className="animate-pop"
          style={{
            padding: '0.6rem 1.4rem',
            borderRadius: '999px',
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff',
            fontFamily: 'var(--font-math)',
            fontSize: '1rem',
            fontWeight: 800,
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
            cursor: 'pointer',
          }}
        >
          {operable.label}
        </button>
      )}

      {/* Lavagna Principale Magnetica */}
      <div
        className={isError ? 'animate-shake' : ''}
        style={{
          width: '100%',
          minHeight: '130px',
          padding: '1.5rem 1rem',
          borderRadius: '24px',
          background: 'var(--bg-card)',
          border: isError ? '2px solid #ef4444' : '1px solid var(--border-card)',
          boxShadow: isError ? '0 0 30px rgba(239, 68, 68, 0.3)' : '0 10px 30px rgba(0, 0, 0, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
          gap: '6px',
          position: 'relative',
        }}
      >
        {/* Slot iniziale prima di tutti i token */}
        <div
          onDragOver={e => {
            e.preventDefault();
            setDropSlotIndex(0);
          }}
          onDragLeave={() => setDropSlotIndex(null)}
          onDrop={e => {
            e.preventDefault();
            handleDropOnSlot(0);
          }}
          style={{
            width: dropSlotIndex === 0 ? '36px' : '10px',
            height: '64px',
            borderRadius: '8px',
            background: dropSlotIndex === 0 ? 'rgba(0, 240, 255, 0.25)' : 'transparent',
            border: dropSlotIndex === 0 ? '2px dashed var(--color-var)' : 'none',
            transition: 'all 0.15s ease',
          }}
        />

        {/* Tessere Matematiche e Slot Intermedi */}
        {tokens.map((tok, i) => (
          <React.Fragment key={tok.id}>
            <TokenTile
              token={tok}
              index={i}
              onToggleSign={() => handleToggleSign(i)}
              onDelete={tokens.length > 2 ? () => onDeleteToken(i) : undefined}
              onDragStart={() => handleDragStart(i)}
            />

            {/* Slot per rilasciare una tessera tra i token */}
            <div
              onDragOver={e => {
                e.preventDefault();
                setDropSlotIndex(i + 1);
              }}
              onDragLeave={() => setDropSlotIndex(null)}
              onDrop={e => {
                e.preventDefault();
                handleDropOnSlot(i + 1);
              }}
              style={{
                width: dropSlotIndex === i + 1 ? '36px' : '10px',
                height: '64px',
                borderRadius: '8px',
                background: dropSlotIndex === i + 1 ? 'rgba(0, 240, 255, 0.25)' : 'transparent',
                border: dropSlotIndex === i + 1 ? '2px dashed var(--color-var)' : 'none',
                transition: 'all 0.15s ease',
              }}
            />
          </React.Fragment>
        ))}
      </div>

      {/* Feedback o errore */}
      {feedbackMessage && (
        <div style={{
          padding: '0.6rem 1.4rem',
          borderRadius: '12px',
          background: isError ? 'rgba(239, 68, 68, 0.12)' : 'rgba(52, 211, 153, 0.12)',
          border: isError ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(52, 211, 153, 0.35)',
          color: isError ? '#fca5a5' : '#6ee7b7',
          fontSize: '0.9rem',
          fontWeight: 600,
          textAlign: 'center',
          maxWidth: '650px',
        }}>
          {feedbackMessage}
        </div>
      )}

      {/* Pulsante di Convalida Passaggio / Verifica Mossa */}
      <button
        onClick={onCheckStep}
        style={{
          padding: '0.85rem 2.2rem',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
          color: '#fff',
          fontSize: '1.05rem',
          fontWeight: 800,
          letterSpacing: '0.5px',
          boxShadow: '0 4px 18px rgba(14, 165, 233, 0.4)',
          transition: 'all 0.15s ease',
        }}
      >
        ✓ Verifica Mossa / Risoluzione
      </button>

      {/* Banco dei Simboli (Toolbox per trascinare parentesi o operatori) */}
      <div style={{
        marginTop: '1rem',
        padding: '1.25rem',
        borderRadius: '20px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px dashed var(--border-card)',
        width: '100%',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 800, marginBottom: '0.75rem' }}>
          Banco Simboli (Trascina un simbolo sulla lavagna per usarlo):
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
          {TOOLBOX_SYMBOLS.map(sym => (
            <div
              key={sym.id}
              draggable={true}
              onDragStart={() => handleToolboxDragStart(sym)}
              onClick={() => onAddToken({ ...sym, id: `tok-${Date.now()}-${Math.random().toString(36).substr(2, 4)}` }, tokens.length)}
              style={{
                padding: '0.5rem 0.9rem',
                minWidth: '40px',
                height: '46px',
                borderRadius: '10px',
                background: 'var(--bg-card)',
                border: `1px solid ${sym.color}40`,
                fontFamily: 'var(--font-math)',
                fontSize: '1.25rem',
                fontWeight: 800,
                color: sym.color,
                cursor: 'grab',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              title="Trascina sulla lavagna"
            >
              {sym.text}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
