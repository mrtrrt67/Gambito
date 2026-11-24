import React, { useState, useRef } from 'react';
import { MathAST, MathNode, SumNode, EquationNode, VariableNode, NumberNode } from '@gambito/engine';
import { toSuperscript } from '../utils/astFormatter';
import { DraggedElement } from '../types';

interface InteractiveBoardProps {
  ast: MathAST | null;
  rawExpression: string;
  onDropTranspose: (element: DraggedElement, targetSide: 'lhs' | 'rhs') => void;
  onDropMerge: (dragged: DraggedElement, targetId: string) => void;
  onDropFactorize: (element: DraggedElement) => void;
  onInvalidMove: (reason: string) => void;
  onLogGesture: (action: string, description: string, details?: string) => void;
}

export interface ChromaticTile {
  id: string;
  sign: '+' | '-';
  coeffText: string;
  varText: string;
  expText: string;
  kind: 'Variable' | 'Number' | 'Composite';
  degree: number;
  fullText: string;
  side?: 'lhs' | 'rhs';
}

function extractChromaticTiles(node: MathNode, side?: 'lhs' | 'rhs'): ChromaticTile[] {
  if (node.kind === 'Sum') {
    return (node as SumNode).terms.flatMap(t => extractChromaticTiles(t, side));
  }

  if (node.kind === 'Variable') {
    const vn = node as VariableNode;
    const isNeg = vn.coefficient.sign === -1;
    const absCoeff = vn.coefficient.n;
    const coeffText = (absCoeff === 1n && vn.coefficient.d === 1n)
      ? ''
      : (vn.coefficient.d === 1n ? absCoeff.toString() : `${absCoeff}/${vn.coefficient.d}`);
    const expText = vn.exponent > 1 ? toSuperscript(vn.exponent) : '';
    const fullText = `${isNeg ? '-' : '+'}${coeffText}${vn.name}${expText}`;

    return [{
      id: vn.id,
      sign: isNeg ? '-' : '+',
      coeffText,
      varText: vn.name,
      expText,
      kind: 'Variable',
      degree: vn.exponent,
      fullText,
      side,
    }];
  }

  if (node.kind === 'Number') {
    const nn = node as NumberNode;
    const isNeg = nn.value.sign === -1;
    const valText = nn.value.d === 1n
      ? nn.value.n.toString()
      : `${nn.value.n}/${nn.value.d}`;
    const fullText = `${isNeg ? '-' : '+'}${valText}`;

    return [{
      id: nn.id,
      sign: isNeg ? '-' : '+',
      coeffText: valText,
      varText: '',
      expText: '',
      kind: 'Number',
      degree: 0,
      fullText,
      side,
    }];
  }

  return [{
    id: node.id,
    sign: '+',
    coeffText: node.kind,
    varText: '',
    expText: '',
    kind: 'Composite',
    degree: 0,
    fullText: node.kind,
    side,
  }];
}

export const InteractiveBoard: React.FC<InteractiveBoardProps> = ({
  ast,
  rawExpression,
  onDropTranspose,
  onDropMerge,
  onDropFactorize,
  onInvalidMove,
  onLogGesture,
}) => {
  const [draggedItem, setDraggedItem] = useState<DraggedElement | null>(null);
  const [hoveredDropZone, setHoveredDropZone] = useState<string | null>(null);
  const [touchPos, setTouchPos] = useState<{ x: number; y: number } | null>(null);
  const activeTouchTileRef = useRef<DraggedElement | null>(null);

  if (!ast) return null;

  const isEquation = ast.metadata.isEquation && ast.root.kind === 'Equation';
  let lhsTiles: ChromaticTile[] = [];
  let rhsTiles: ChromaticTile[] = [];
  let standaloneTiles: ChromaticTile[] = [];

  if (isEquation) {
    const eq = ast.root as EquationNode;
    lhsTiles = extractChromaticTiles(eq.lhs, 'lhs');
    rhsTiles = extractChromaticTiles(eq.rhs, 'rhs');
  } else {
    standaloneTiles = extractChromaticTiles(ast.root);
  }

  // --- HTML5 Drag Events ---
  const handleDragStart = (e: React.DragEvent, tile: ChromaticTile) => {
    const elem: DraggedElement = {
      id: tile.id,
      type: 'term',
      text: tile.fullText,
      originalSide: tile.side,
      sign: tile.sign,
    };
    setDraggedItem(elem);
    e.dataTransfer.setData('text/plain', JSON.stringify(elem));
    onLogGesture('DRAG_START', `Iniziato trascinamento del termine ${tile.fullText}`, `Tipo: ${tile.kind}, Grado: ${tile.degree}`);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setHoveredDropZone(null);
  };

  // --- Touch Events (per dita / gesture su tablet o smartphone) ---
  const handleTouchStart = (tile: ChromaticTile, e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    const elem: DraggedElement = {
      id: tile.id,
      type: 'term',
      text: tile.fullText,
      originalSide: tile.side,
      sign: tile.sign,
    };
    activeTouchTileRef.current = elem;
    setDraggedItem(elem);
    setTouchPos({ x: touch.clientX, y: touch.clientY });
    onLogGesture('TOUCH_START', `Gesto tattile: afferrato ${tile.fullText}`, `Coordinate: (${Math.round(touch.clientX)}, ${Math.round(touch.clientY)})`);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch || !activeTouchTileRef.current) return;
    setTouchPos({ x: touch.clientX, y: touch.clientY });

    // Evidenzia elemento sotto il dito
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropzone = target?.closest('[data-dropzone]')?.getAttribute('data-dropzone');
    setHoveredDropZone(dropzone || null);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!activeTouchTileRef.current || !touchPos) {
      setDraggedItem(null);
      setTouchPos(null);
      activeTouchTileRef.current = null;
      return;
    }

    const item = activeTouchTileRef.current;
    const target = document.elementFromPoint(touchPos.x, touchPos.y);
    const dropzone = target?.closest('[data-dropzone]')?.getAttribute('data-dropzone');
    const targetTileId = target?.closest('[data-tile-id]')?.getAttribute('data-tile-id');

    if (dropzone === 'rhs' && item.originalSide === 'lhs') {
      onDropTranspose(item, 'rhs');
    } else if (dropzone === 'lhs' && item.originalSide === 'rhs') {
      onDropTranspose(item, 'lhs');
    } else if (dropzone === 'tactical-zone') {
      onDropFactorize(item);
    } else if (targetTileId && targetTileId !== item.id) {
      onDropMerge(item, targetTileId);
    }

    setDraggedItem(null);
    setTouchPos(null);
    setHoveredDropZone(null);
    activeTouchTileRef.current = null;
  };

  // Rendering singola tessera con color coding cromatico
  const renderTile = (tile: ChromaticTile, index: number) => {
    const isFirst = index === 0;
    const showPlus = !isFirst && tile.sign === '+';
    const isBeingDragged = draggedItem?.id === tile.id;

    return (
      <div
        key={tile.id}
        draggable={true}
        data-tile-id={tile.id}
        onDragStart={e => handleDragStart(e, tile)}
        onDragEnd={handleDragEnd}
        onTouchStart={e => handleTouchStart(tile, e)}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDragOver={e => {
          e.preventDefault();
          if (draggedItem && draggedItem.id !== tile.id) {
            setHoveredDropZone(`tile-${tile.id}`);
          }
        }}
        onDrop={e => {
          e.preventDefault();
          if (draggedItem && draggedItem.id !== tile.id) {
            onDropMerge(draggedItem, tile.id);
          }
        }}
        className={`drag-tile ${isBeingDragged ? 'is-dragging' : ''}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '0.65rem 1rem',
          borderRadius: '12px',
          background: hoveredDropZone === `tile-${tile.id}`
            ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.35), rgba(59, 130, 246, 0.45))'
            : 'var(--bg-card)',
          border: hoveredDropZone === `tile-${tile.id}`
            ? '2px solid var(--accent-cyan)'
            : '1px solid var(--border-subtle)',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
          userSelect: 'none',
        }}
        title="Trascina con la freccia del mouse o il dito per spostare, trasportare o fondere"
      >
        {/* Maniglia di trascinamento tattile */}
        <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginRight: '2px', cursor: 'grab' }}>
          ⠿
        </span>

        {/* Segno Cromatico */}
        {(tile.sign === '-' || showPlus) && (
          <span style={{
            fontFamily: 'var(--font-math)',
            fontWeight: 900,
            fontSize: '1.35rem',
            color: tile.sign === '-' ? 'var(--chroma-minus)' : 'var(--chroma-plus)',
            textShadow: tile.sign === '-' ? '0 0 8px rgba(248, 113, 113, 0.4)' : '0 0 8px rgba(52, 211, 153, 0.4)',
          }}>
            {tile.sign === '-' ? '−' : '+'}
          </span>
        )}

        {/* Coefficiente Numerico Cromatico */}
        {tile.coeffText && (
          <span style={{
            fontFamily: 'var(--font-math)',
            fontWeight: 800,
            fontSize: '1.45rem',
            color: 'var(--chroma-num)',
            textShadow: '0 0 8px var(--chroma-num-glow)',
          }}>
            {tile.coeffText}
          </span>
        )}

        {/* Variabile Incognita Cromatica */}
        {tile.varText && (
          <span style={{
            fontFamily: 'var(--font-math)',
            fontWeight: 800,
            fontSize: '1.45rem',
            color: 'var(--chroma-var)',
            textShadow: '0 0 8px var(--chroma-var-glow)',
            marginLeft: '1px',
          }}>
            {tile.varText}
          </span>
        )}

        {/* Esponente Cromatico */}
        {tile.expText && (
          <span style={{
            fontFamily: 'var(--font-math)',
            fontWeight: 900,
            fontSize: '1.15rem',
            color: '#a78bfa',
            textShadow: '0 0 8px rgba(167, 139, 250, 0.4)',
            marginLeft: '1px',
            marginTop: '-6px',
          }}>
            {tile.expText}
          </span>
        )}
      </div>
    );
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: '20px',
      border: '1px solid var(--border-subtle)',
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
      position: 'relative',
    }}>
      {/* Intestazione Board con Formula Attiva */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        paddingBottom: '0.9rem',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 800 }}>
            Tabellone Interattivo (Drag & Touch):
          </span>
          <code style={{
            fontFamily: 'var(--font-math)',
            fontSize: '1.15rem',
            color: 'var(--accent-cyan)',
            background: 'rgba(56, 189, 248, 0.08)',
            padding: '3px 10px',
            borderRadius: '6px',
            fontWeight: 700,
          }}>
            {rawExpression}
          </code>
        </div>

        <div style={{
          fontSize: '0.75rem',
          color: 'var(--accent-gold)',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: 'rgba(251, 191, 36, 0.1)',
          padding: '4px 10px',
          borderRadius: '999px',
          border: '1px solid rgba(251, 191, 36, 0.3)',
        }}>
          <span>👆</span>
          <span>Trascina le tessere col mouse o con il dito per applicare le mosse!</span>
        </div>
      </div>

      {/* Area Equazioni o Polinomi */}
      {isEquation ? (
        <div style={{
          display: 'flex',
          alignItems: 'stretch',
          justifyContent: 'center',
          gap: '1.5rem',
          flexWrap: 'wrap',
        }}>
          {/* Dropzone LHS */}
          <div
            data-dropzone="lhs"
            onDragOver={e => {
              e.preventDefault();
              setHoveredDropZone('lhs');
            }}
            onDragLeave={() => setHoveredDropZone(null)}
            onDrop={e => {
              e.preventDefault();
              if (draggedItem && draggedItem.originalSide === 'rhs') {
                onDropTranspose(draggedItem, 'lhs');
              }
              setHoveredDropZone(null);
            }}
            style={{
              flex: 1,
              minWidth: '260px',
              padding: '1.25rem',
              borderRadius: '16px',
              background: hoveredDropZone === 'lhs' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              border: hoveredDropZone === 'lhs' ? '2px dashed var(--accent-cyan)' : '1px dashed var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                Membro Sinistro (LHS)
              </span>
              {draggedItem?.originalSide === 'rhs' && (
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  Rilascia qui per trasportare a sinistra!
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', minHeight: '60px', alignItems: 'center' }}>
              {lhsTiles.map((t, i) => renderTile(t, i))}
            </div>
          </div>

          {/* Segno Uguale Cromatico */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-math)',
            fontSize: '2.5rem',
            fontWeight: 900,
            color: 'var(--chroma-equals)',
            textShadow: '0 0 16px rgba(192, 132, 252, 0.5)',
            padding: '0 0.5rem',
          }}>
            =
          </div>

          {/* Dropzone RHS */}
          <div
            data-dropzone="rhs"
            onDragOver={e => {
              e.preventDefault();
              setHoveredDropZone('rhs');
            }}
            onDragLeave={() => setHoveredDropZone(null)}
            onDrop={e => {
              e.preventDefault();
              if (draggedItem && draggedItem.originalSide === 'lhs') {
                onDropTranspose(draggedItem, 'rhs');
              }
              setHoveredDropZone(null);
            }}
            style={{
              flex: 1,
              minWidth: '260px',
              padding: '1.25rem',
              borderRadius: '16px',
              background: hoveredDropZone === 'rhs' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(255, 255, 255, 0.02)',
              border: hoveredDropZone === 'rhs' ? '2px dashed var(--accent-cyan)' : '1px dashed var(--border-subtle)',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              transition: 'all 0.15s ease',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-dim)' }}>
                Membro Destro (RHS)
              </span>
              {draggedItem?.originalSide === 'lhs' && (
                <span style={{ fontSize: '0.65rem', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  Rilascia qui per trasportare a destra!
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', minHeight: '60px', alignItems: 'center' }}>
              {rhsTiles.map((t, i) => renderTile(t, i))}
            </div>
          </div>
        </div>
      ) : (
        /* Polinomi / Espressioni Standard */
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.75rem',
        }}>
          {/* Tessere del polinomio */}
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.85rem',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80px',
            padding: '1rem',
          }}>
            {standaloneTiles.map((t, i) => renderTile(t, i))}
          </div>

          {/* Zona Tattica di Drop per Scomposizione & Raccoglimento */}
          <div
            data-dropzone="tactical-zone"
            onDragOver={e => {
              e.preventDefault();
              setHoveredDropZone('tactical-zone');
            }}
            onDragLeave={() => setHoveredDropZone(null)}
            onDrop={e => {
              e.preventDefault();
              if (draggedItem) {
                onDropFactorize(draggedItem);
              }
              setHoveredDropZone(null);
            }}
            className="animate-dropzone"
            style={{
              width: '100%',
              maxWidth: '680px',
              padding: '1.25rem 2rem',
              borderRadius: '16px',
              background: hoveredDropZone === 'tactical-zone' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(0, 0, 0, 0.25)',
              border: hoveredDropZone === 'tactical-zone' ? '2px dashed #00f0ff' : '2px dashed rgba(56, 189, 248, 0.4)',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1rem',
              transition: 'all 0.2s ease',
            }}
          >
            <span style={{ fontSize: '2rem' }}>⚡</span>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--accent-cyan)' }}>
                PORTA TATTICA DI SCOMPOSIZIONE & RACCOGLIMENTO
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                Trascina qui un termine per estrarre il fattore comune o scomporre il prodotto notevole
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Touch Pointer floating ghost (quando si trascina con il dito) */}
      {touchPos && draggedItem && (
        <div style={{
          position: 'fixed',
          left: touchPos.x + 15,
          top: touchPos.y - 30,
          pointerEvents: 'none',
          zIndex: 1000,
          background: 'rgba(15, 23, 42, 0.95)',
          border: '2px solid #00f0ff',
          padding: '6px 14px',
          borderRadius: '10px',
          fontFamily: 'var(--font-math)',
          fontSize: '1.2rem',
          fontWeight: 800,
          color: '#00f0ff',
          boxShadow: '0 10px 25px rgba(0, 240, 255, 0.5)',
        }}>
          {draggedItem.text}
        </div>
      )}
    </div>
  );
};
