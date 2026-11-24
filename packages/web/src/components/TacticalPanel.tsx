import React, { useState } from 'react';
import { MathAST } from '@gambito/engine';

interface TacticalPanelProps {
  ast: MathAST | null;
  selectedNodeIds: string[];
  onApplyFactorCommon: (factor: string) => void;
  onApplyDifferenceOfSquares: (a: string, b: string) => void;
  onApplySquareOfBinomial: (a: string, b: string, sign: '+' | '-') => void;
  onApplySpecialTrinomial: (m: string, n: string) => void;
  onApplyTransposeTerms: () => void;
  onApplyDivideBothSides: (divisor: string) => void;
  onApplySimplifyTerms: () => void;
  onDeclareIrreducible: () => void;
}

type ModalType =
  | null
  | 'factorCommon'
  | 'diffSquares'
  | 'squareBinomial'
  | 'specialTrinomial'
  | 'divideBothSides';

export const TacticalPanel: React.FC<TacticalPanelProps> = ({
  ast,
  selectedNodeIds,
  onApplyFactorCommon,
  onApplyDifferenceOfSquares,
  onApplySquareOfBinomial,
  onApplySpecialTrinomial,
  onApplyTransposeTerms,
  onApplyDivideBothSides,
  onApplySimplifyTerms,
  onDeclareIrreducible,
}) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [inputVal1, setInputVal1] = useState('');
  const [inputVal2, setInputVal2] = useState('');
  const [signChoice, setSignChoice] = useState<'+' | '-'>('+');

  if (!ast) return null;

  const isEquation = ast.metadata.isEquation;
  const detectedPatternTypes = ast.detectedPatterns.map(p => p.pattern);

  const resetInputs = () => {
    setInputVal1('');
    setInputVal2('');
    setSignChoice('+');
    setActiveModal(null);
  };

  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeModal === 'factorCommon') {
      onApplyFactorCommon(inputVal1.trim());
    } else if (activeModal === 'diffSquares') {
      onApplyDifferenceOfSquares(inputVal1.trim(), inputVal2.trim());
    } else if (activeModal === 'squareBinomial') {
      onApplySquareOfBinomial(inputVal1.trim(), inputVal2.trim(), signChoice);
    } else if (activeModal === 'specialTrinomial') {
      onApplySpecialTrinomial(inputVal1.trim(), inputVal2.trim());
    } else if (activeModal === 'divideBothSides') {
      onApplyDivideBothSides(inputVal1.trim());
    }
    resetInputs();
  };

  return (
    <div style={{
      background: 'var(--bg-surface)',
      borderRadius: '20px',
      border: '1px solid var(--border-subtle)',
      padding: '1.5rem',
      marginTop: '1.5rem',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <h3 style={{
          fontSize: '0.95rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.75px',
          color: 'var(--accent-gold)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>⚔️</span>
          <span>Pannello Mosse Tattiche</span>
        </h3>

        {selectedNodeIds.length > 0 && (
          <span style={{
            fontSize: '0.8rem',
            color: 'var(--accent-cyan)',
            background: 'rgba(56, 189, 248, 0.1)',
            padding: '2px 8px',
            borderRadius: '6px',
            border: '1px solid rgba(56, 189, 248, 0.2)',
          }}>
            {selectedNodeIds.length} {selectedNodeIds.length === 1 ? 'termine selezionato' : 'termini selezionati'}
          </span>
        )}
      </div>

      {/* Grid of Action Buttons */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '0.75rem',
      }}>
        {/* ⚡ Raccoglimento a Fattor Comune */}
        <button
          onClick={() => {
            setInputVal1('');
            setActiveModal('factorCommon');
          }}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: detectedPatternTypes.includes('raccoglimento_totale')
              ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(180, 83, 9, 0.3))'
              : 'var(--bg-card)',
            border: detectedPatternTypes.includes('raccoglimento_totale')
              ? '1px solid var(--border-gold)'
              : '1px solid var(--border-subtle)',
            textAlign: 'left',
            color: 'var(--text-main)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
            transition: 'transform 0.15s ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-gold)' }}>
              ⚡ Raccogli Fattore Comune (MCD)
            </span>
            {detectedPatternTypes.includes('raccoglimento_totale') && (
              <span style={{ fontSize: '0.65rem', background: 'var(--accent-gold)', color: '#000', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                RACCOMANDATO
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Estrai il fattore comune numerico o letterale (es. -2, 3x)
          </span>
        </button>

        {/* 🧩 Differenza di Quadrati */}
        <button
          onClick={() => {
            setInputVal1('');
            setInputVal2('');
            setActiveModal('diffSquares');
          }}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: detectedPatternTypes.includes('differenza_quadrati')
              ? 'linear-gradient(135deg, rgba(56, 189, 248, 0.2), rgba(2, 132, 199, 0.3))'
              : 'var(--bg-card)',
            border: detectedPatternTypes.includes('differenza_quadrati')
              ? '1px solid var(--accent-cyan)'
              : '1px solid var(--border-subtle)',
            textAlign: 'left',
            color: 'var(--text-main)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
              🧩 Differenza di Quadrati
            </span>
            {detectedPatternTypes.includes('differenza_quadrati') && (
              <span style={{ fontSize: '0.65rem', background: 'var(--accent-cyan)', color: '#000', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                RACCOMANDATO
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            a² - b² = (a + b)(a - b)
          </span>
        </button>

        {/* 🧩 Quadrato di Binomio */}
        <button
          onClick={() => {
            setInputVal1('');
            setInputVal2('');
            setSignChoice('+');
            setActiveModal('squareBinomial');
          }}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: (detectedPatternTypes.includes('quadrato_binomio_somma') || detectedPatternTypes.includes('quadrato_binomio_differenza'))
              ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2), rgba(126, 34, 206, 0.3))'
              : 'var(--bg-card)',
            border: (detectedPatternTypes.includes('quadrato_binomio_somma') || detectedPatternTypes.includes('quadrato_binomio_differenza'))
              ? '1px solid var(--accent-purple)'
              : '1px solid var(--border-subtle)',
            textAlign: 'left',
            color: 'var(--text-main)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-purple)' }}>
              🧩 Quadrato di Binomio
            </span>
            {(detectedPatternTypes.includes('quadrato_binomio_somma') || detectedPatternTypes.includes('quadrato_binomio_differenza')) && (
              <span style={{ fontSize: '0.65rem', background: 'var(--accent-purple)', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                RACCOMANDATO
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            a² ± 2ab + b² = (a ± b)²
          </span>
        </button>

        {/* 🎯 Trinomio Speciale */}
        <button
          onClick={() => {
            setInputVal1('');
            setInputVal2('');
            setActiveModal('specialTrinomial');
          }}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: detectedPatternTypes.includes('trinomio_speciale')
              ? 'linear-gradient(135deg, rgba(52, 211, 153, 0.2), rgba(5, 150, 105, 0.3))'
              : 'var(--bg-card)',
            border: detectedPatternTypes.includes('trinomio_speciale')
              ? '1px solid var(--accent-green)'
              : '1px solid var(--border-subtle)',
            textAlign: 'left',
            color: 'var(--text-main)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-green)' }}>
              🎯 Trinomio Speciale
            </span>
            {detectedPatternTypes.includes('trinomio_speciale') && (
              <span style={{ fontSize: '0.65rem', background: 'var(--accent-green)', color: '#000', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                RACCOMANDATO
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            x² + sx + p = (x + m)(x + n)
          </span>
        </button>

        {/* ↔️ Regola del Trasporto (Equazioni) */}
        {isEquation && (
          <button
            onClick={onApplyTransposeTerms}
            disabled={selectedNodeIds.length === 0}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              background: selectedNodeIds.length > 0
                ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(185, 28, 28, 0.3))'
                : 'var(--bg-card)',
              border: selectedNodeIds.length > 0
                ? '1px solid var(--accent-red)'
                : '1px solid var(--border-subtle)',
              opacity: selectedNodeIds.length === 0 ? 0.6 : 1,
              textAlign: 'left',
              color: 'var(--text-main)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-red)' }}>
                ↔️ Regola del Trasporto
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                (Seleziona termini)
              </span>
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Sposta i termini selezionati all'altro membro cambiando segno
            </span>
          </button>
        )}

        {/* ➗ Dividi Entrambi i Membri */}
        {isEquation && (
          <button
            onClick={() => {
              setInputVal1('');
              setActiveModal('divideBothSides');
            }}
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-subtle)',
              textAlign: 'left',
              color: 'var(--text-main)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-cyan)' }}>
              ➗ Dividi per Coefficiente
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Dividi entrambi i membri per isolare l'incognita
            </span>
          </button>
        )}

        {/* 🧹 Riduci Termini Simili */}
        <button
          onClick={onApplySimplifyTerms}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            textAlign: 'left',
            color: 'var(--text-main)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8' }}>
            🧹 Riduci Termini Simili
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Somma algebricamente i monomi simili
          </span>
        </button>

        {/* 🚫 Dichiara Irriducibile */}
        <button
          onClick={onDeclareIrreducible}
          style={{
            padding: '0.85rem 1rem',
            borderRadius: '12px',
            background: ast.kind === 'irreducible_polynomial'
              ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.25), rgba(185, 28, 28, 0.35))'
              : 'var(--bg-card)',
            border: ast.kind === 'irreducible_polynomial'
              ? '1px solid var(--accent-red)'
              : '1px solid var(--border-subtle)',
            textAlign: 'left',
            color: 'var(--text-main)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--accent-red)' }}>
              🚫 Dichiara Irriducibile su ℝ
            </span>
            {ast.kind === 'irreducible_polynomial' && (
              <span style={{ fontSize: '0.65rem', background: 'var(--accent-red)', color: '#fff', padding: '1px 5px', borderRadius: '4px', fontWeight: 800 }}>
                OPZIONE CHIAVE
              </span>
            )}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            Es. x² + 4 (somma di quadrati non scomponibile)
          </span>
        </button>
      </div>

      {/* Interactive Move Modal / Prompt */}
      {activeModal && (
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
          zIndex: 100,
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border-active)',
            borderRadius: '16px',
            padding: '1.75rem',
            maxWidth: '480px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
          }}>
            <h4 style={{
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--text-main)',
              marginBottom: '0.5rem',
            }}>
              {activeModal === 'factorCommon' && '⚡ Raccoglimento a Fattor Comune'}
              {activeModal === 'diffSquares' && '🧩 Scomponi: Differenza di Quadrati'}
              {activeModal === 'squareBinomial' && '🧩 Scomponi: Quadrato di Binomio'}
              {activeModal === 'specialTrinomial' && '🎯 Scomponi: Trinomio Speciale'}
              {activeModal === 'divideBothSides' && '➗ Dividi Entrambi i Membri'}
            </h4>

            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              {activeModal === 'factorCommon' && 'Inserisci il fattore comune (MCD) da estrarre fuori parentesi:'}
              {activeModal === 'diffSquares' && 'Identifica le due basi a e b tali che a² - b² = (a+b)(a-b):'}
              {activeModal === 'squareBinomial' && 'Identifica le basi a e b e il segno del binomio (a ± b)²:'}
              {activeModal === 'specialTrinomial' && 'Inserisci i due numeri interi m e n tali che (x+m)(x+n):'}
              {activeModal === 'divideBothSides' && 'Inserisci il divisore non nullo:'}
            </p>

            <form onSubmit={handleModalSubmit}>
              {/* Factor Common Input */}
              {activeModal === 'factorCommon' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    Fattore Comune (es. -2, 3x, 4):
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={inputVal1}
                    onChange={e => setInputVal1(e.target.value)}
                    placeholder="es. -2 oppure 3x"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-math)',
                      fontSize: '1.1rem',
                    }}
                  />
                </div>
              )}

              {/* Difference of Squares Inputs */}
              {activeModal === 'diffSquares' && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      Base a (es. x, 2x, 3):
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={inputVal1}
                      onChange={e => setInputVal1(e.target.value)}
                      placeholder="es. 3 oppure x"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.1rem',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      Base b (es. x, 3, 2):
                    </label>
                    <input
                      type="text"
                      value={inputVal2}
                      onChange={e => setInputVal2(e.target.value)}
                      placeholder="es. x oppure 3"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.1rem',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Square of Binomial Inputs */}
              {activeModal === 'squareBinomial' && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <input
                      type="text"
                      autoFocus
                      value={inputVal1}
                      onChange={e => setInputVal1(e.target.value)}
                      placeholder="Primo termine a (es. 2x)"
                      style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.1rem',
                      }}
                    />
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={() => setSignChoice('+')}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          background: signChoice === '+' ? 'var(--accent-purple)' : 'var(--bg-card)',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => setSignChoice('-')}
                        style={{
                          padding: '0.75rem 1rem',
                          borderRadius: '8px',
                          background: signChoice === '-' ? 'var(--accent-purple)' : 'var(--bg-card)',
                          color: '#fff',
                          fontWeight: 800,
                          fontSize: '1.1rem',
                          border: '1px solid var(--border-subtle)',
                        }}
                      >
                        −
                      </button>
                    </div>
                    <input
                      type="text"
                      value={inputVal2}
                      onChange={e => setInputVal2(e.target.value)}
                      placeholder="Secondo termine b (es. 3)"
                      style={{
                        flex: 1,
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.1rem',
                      }}
                    />
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                    Risultato composto: ({inputVal1 || 'a'} {signChoice} {inputVal2 || 'b'})²
                  </div>
                </div>
              )}

              {/* Special Trinomial Inputs */}
              {activeModal === 'specialTrinomial' && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      Numero m (es. -2):
                    </label>
                    <input
                      type="text"
                      autoFocus
                      value={inputVal1}
                      onChange={e => setInputVal1(e.target.value)}
                      placeholder="es. -2"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.1rem',
                      }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                      Numero n (es. -3):
                    </label>
                    <input
                      type="text"
                      value={inputVal2}
                      onChange={e => setInputVal2(e.target.value)}
                      placeholder="es. -3"
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        borderRadius: '8px',
                        background: 'var(--bg-card)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--text-main)',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.1rem',
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Divide Both Sides Input */}
              {activeModal === 'divideBothSides' && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    Divisore (es. 2, 3, -1):
                  </label>
                  <input
                    type="text"
                    autoFocus
                    value={inputVal1}
                    onChange={e => setInputVal1(e.target.value)}
                    placeholder="es. 2"
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      borderRadius: '8px',
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-main)',
                      fontFamily: 'var(--font-math)',
                      fontSize: '1.1rem',
                    }}
                  />
                </div>
              )}

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button
                  type="button"
                  onClick={resetInputs}
                  style={{
                    padding: '0.6rem 1rem',
                    borderRadius: '8px',
                    background: 'var(--bg-card)',
                    color: 'var(--text-muted)',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  style={{
                    padding: '0.6rem 1.25rem',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff',
                    fontSize: '0.9rem',
                    fontWeight: 700,
                    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.4)',
                  }}
                >
                  Applica Mossa Tattica ⚡
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
