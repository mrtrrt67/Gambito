import React from 'react';
import { MathAST, MathNode, SumNode, EquationNode, VariableNode, NumberNode } from '@gambito/engine';
import { toSuperscript } from '../utils/astFormatter';

interface MathBoardProps {
  ast: MathAST | null;
  rawExpression: string;
  selectedNodeIds: string[];
  onToggleSelectNode: (id: string) => void;
  onClearSelection: () => void;
  onSelectAll: () => void;
}

interface TileItem {
  id: string;
  sign: '+' | '-';
  mainText: string;
  degree?: number;
  kind: string;
  side?: 'lhs' | 'rhs';
}

function extractTilesFromNode(node: MathNode, side?: 'lhs' | 'rhs'): TileItem[] {
  if (node.kind === 'Sum') {
    return (node as SumNode).terms.flatMap(t => extractTilesFromNode(t, side));
  }

  if (node.kind === 'Variable') {
    const vn = node as VariableNode;
    const isNeg = vn.coefficient.sign === -1;
    const absCoeff = vn.coefficient.n;
    const coeffText = (absCoeff === 1n && vn.coefficient.d === 1n)
      ? ''
      : (vn.coefficient.d === 1n ? absCoeff.toString() : `${absCoeff}/${vn.coefficient.d}`);
    const expText = vn.exponent > 1 ? toSuperscript(vn.exponent) : '';
    return [{
      id: vn.id,
      sign: isNeg ? '-' : '+',
      mainText: `${coeffText}${vn.name}${expText}`,
      degree: vn.exponent,
      kind: 'Variable',
      side,
    }];
  }

  if (node.kind === 'Number') {
    const nn = node as NumberNode;
    const isNeg = nn.value.sign === -1;
    const valText = nn.value.d === 1n
      ? nn.value.n.toString()
      : `${nn.value.n}/${nn.value.d}`;
    return [{
      id: nn.id,
      sign: isNeg ? '-' : '+',
      mainText: valText,
      degree: 0,
      kind: 'Number',
      side,
    }];
  }

  // Fallback per altri nodi complessi
  return [{
    id: node.id,
    sign: '+',
    mainText: rawNodeToString(node),
    kind: node.kind,
    side,
  }];
}

function rawNodeToString(node: MathNode): string {
  if (node.kind === 'Power') return `(${rawNodeToString(node.base)})^${node.exponent}`;
  if (node.kind === 'Product') return node.factors.map(rawNodeToString).join('·');
  if (node.kind === 'Negation') return `-${rawNodeToString(node.operand)}`;
  return node.kind;
}

export const MathBoard: React.FC<MathBoardProps> = ({
  ast,
  rawExpression,
  selectedNodeIds,
  onToggleSelectNode,
  onClearSelection,
  onSelectAll,
}) => {
  if (!ast) {
    return (
      <div style={{
        padding: '3rem',
        textAlign: 'center',
        background: 'var(--bg-surface)',
        borderRadius: '16px',
        border: '1px dashed var(--border-subtle)',
      }}>
        <p style={{ color: 'var(--text-dim)', fontSize: '1.1rem' }}>
          Nessuna espressione caricata. Scegli una sfida o inserisci una formula!
        </p>
      </div>
    );
  }

  const isEquation = ast.metadata.isEquation && ast.root.kind === 'Equation';
  let lhsTiles: TileItem[] = [];
  let rhsTiles: TileItem[] = [];
  let standaloneTiles: TileItem[] = [];

  if (isEquation) {
    const eq = ast.root as EquationNode;
    lhsTiles = extractTilesFromNode(eq.lhs, 'lhs');
    rhsTiles = extractTilesFromNode(eq.rhs, 'rhs');
  } else {
    standaloneTiles = extractTilesFromNode(ast.root);
  }

  const renderTile = (tile: TileItem, index: number) => {
    const isSelected = selectedNodeIds.includes(tile.id);
    const isFirst = index === 0;
    const showPlus = !isFirst && tile.sign === '+';

    return (
      <div
        key={tile.id}
        onClick={() => onToggleSelectNode(tile.id)}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '0.6rem 0.9rem',
          borderRadius: '12px',
          background: isSelected
            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.25), rgba(37, 99, 235, 0.35))'
            : 'var(--bg-card)',
          border: isSelected
            ? '2px solid var(--border-active)'
            : '1px solid var(--border-subtle)',
          boxShadow: isSelected
            ? '0 0 16px rgba(59, 130, 246, 0.35), inset 0 0 8px rgba(59, 130, 246, 0.2)'
            : '0 2px 6px rgba(0,0,0,0.2)',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.15s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: isSelected ? 'translateY(-2px)' : 'none',
        }}
        title="Clicca per selezionare questo monomio/termine"
      >
        {/* Sign badge if negative or middle positive */}
        {(tile.sign === '-' || showPlus) && (
          <span style={{
            fontFamily: 'var(--font-math)',
            fontWeight: 800,
            fontSize: '1.25rem',
            color: tile.sign === '-' ? 'var(--accent-red)' : 'var(--text-dim)',
          }}>
            {tile.sign === '-' ? '−' : '+'}
          </span>
        )}

        {/* Main Monomial Text */}
        <span style={{
          fontFamily: 'var(--font-math)',
          fontSize: '1.45rem',
          fontWeight: 700,
          letterSpacing: '0.5px',
          color: isSelected ? '#ffffff' : 'var(--text-main)',
        }}>
          {tile.mainText}
        </span>

        {/* Selection check indicator */}
        <div style={{
          width: '14px',
          height: '14px',
          borderRadius: '4px',
          border: isSelected ? '1px solid #60a5fa' : '1px solid var(--border-subtle)',
          background: isSelected ? '#2563eb' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          marginLeft: '4px',
          color: '#fff',
        }}>
          {isSelected && '✓'}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: '20px',
      border: '1px solid var(--border-subtle)',
      padding: '2rem',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Background chess board grid accent */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        opacity: 0.03,
        pointerEvents: 'none',
        backgroundImage: 'linear-gradient(45deg, #ffffff 25%, transparent 25%), linear-gradient(-45deg, #ffffff 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ffffff 75%), linear-gradient(-45deg, transparent 75%, #ffffff 75%)',
        backgroundSize: '40px 40px',
        backgroundPosition: '0 0, 0 20px, 20px -20px, -20px 0px',
      }} />

      {/* Top Bar inside Board */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        paddingBottom: '0.75rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-dim)', fontWeight: 700 }}>
            Formula Attiva:
          </span>
          <code style={{
            fontFamily: 'var(--font-math)',
            fontSize: '1.1rem',
            color: 'var(--accent-cyan)',
            background: 'rgba(56, 189, 248, 0.08)',
            padding: '2px 8px',
            borderRadius: '6px',
          }}>
            {rawExpression}
          </code>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={onSelectAll}
            style={{
              fontSize: '0.75rem',
              color: 'var(--text-muted)',
              padding: '4px 8px',
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            Seleziona Tutti
          </button>
          {selectedNodeIds.length > 0 && (
            <button
              onClick={onClearSelection}
              style={{
                fontSize: '0.75rem',
                color: 'var(--accent-red)',
                padding: '4px 8px',
                borderRadius: '6px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
              }}
            >
              Deseleziona ({selectedNodeIds.length})
            </button>
          )}
        </div>
      </div>

      {/* Tiles Container */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem',
        minHeight: '120px',
        padding: '1rem',
      }}>
        {isEquation ? (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
            {/* LHS */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed var(--border-subtle)',
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', width: '100%', marginBottom: '-4px' }}>
                Membro Sinistro (LHS)
              </span>
              {lhsTiles.map((tile, i) => renderTile(tile, i))}
            </div>

            {/* Equals Symbol */}
            <div style={{
              fontFamily: 'var(--font-math)',
              fontSize: '2rem',
              fontWeight: 900,
              color: 'var(--accent-gold)',
              padding: '0 0.5rem',
              textShadow: '0 0 12px var(--accent-gold-glow)',
            }}>
              =
            </div>

            {/* RHS */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '0.6rem',
              padding: '0.75rem 1rem',
              borderRadius: '16px',
              background: 'rgba(255, 255, 255, 0.02)',
              border: '1px dashed var(--border-subtle)',
            }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', width: '100%', marginBottom: '-4px' }}>
                Membro Destro (RHS)
              </span>
              {rhsTiles.map((tile, i) => renderTile(tile, i))}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', justifyContent: 'center' }}>
            {standaloneTiles.map((tile, i) => renderTile(tile, i))}
          </div>
        )}
      </div>

      {/* Hint footer bar in board */}
      <div style={{
        marginTop: '1.5rem',
        textAlign: 'center',
        color: 'var(--text-dim)',
        fontSize: '0.8rem',
      }}>
        💡 Suggerimento di interazione: Clicca sulle tessere per selezionare i termini su cui applicare una mossa tattica sottostante.
      </div>
    </div>
  );
};
