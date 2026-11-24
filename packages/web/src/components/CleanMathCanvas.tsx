import React, { useState } from 'react';
import { LevelStep } from '../data/levels';

interface CleanMathCanvasProps {
  level: LevelStep;
  lives: number;
  onSuccess: (finalResult: string, movesTaken: number) => void;
  onError: (msg: string) => void;
  onAddScore: (points: number) => void;
}

export const CleanMathCanvas: React.FC<CleanMathCanvasProps> = ({
  level,
  onSuccess,
  onError,
  onAddScore,
}) => {
  // Stati dinamici per ogni livello
  // Per Livello 1: 2x + 6 = 14
  const [step1State, setStep1State] = useState<'start' | 'transposed' | 'merged' | 'solved'>('start');
  // Per Livello 2: 3x + 5 = 20
  const [step2State, setStep2State] = useState<'start' | 'transposed' | 'merged' | 'solved'>('start');
  // Per Livello 3: 9 - x^2
  const [step3Factored, setStep3Factored] = useState(false);
  // Per Livello 4: -2x^2 + 8
  const [step4State, setStep4State] = useState<'start' | 'factored_out' | 'fully_factored'>('start');
  // Per Livello 5: 4x^2 + 12x + 9
  const [step5Factored, setStep5Factored] = useState(false);
  // Per Livello 6: x^2 + 4
  const [step6Declared, setStep6Declared] = useState(false);

  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [isDropTargetActive, setIsDropTargetActive] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Helper per inviare messaggi di successo
  const showFeedback = (msg: string) => {
    setActionMessage(msg);
  };

  // ----------------------------------------------------
  // GESTURE HANDLERS PER LIVELLO 1: 2x + 6 = 14
  // ----------------------------------------------------
  const handleLvl1Transpose = () => {
    if (step1State === 'start') {
      setStep1State('transposed');
      onAddScore(100);
      showFeedback('✨ Ottimo! Trasportando [+6] a destra è diventato [-6]!');
    }
  };

  const handleLvl1Merge = () => {
    if (step1State === 'transposed') {
      setStep1State('merged');
      onAddScore(150);
      showFeedback('⚡ Calcolo completato: 14 - 6 = 8!');
    }
  };

  const handleLvl1Divide = () => {
    if (step1State === 'merged') {
      setStep1State('solved');
      onAddScore(250);
      showFeedback('🎉 Perfetto! 8 diviso 2 dà x = 4!');
      onSuccess('x = 4', 3);
    }
  };

  // ----------------------------------------------------
  // GESTURE HANDLERS PER LIVELLO 2: 3x + 5 = 20
  // ----------------------------------------------------
  const handleLvl2Transpose = () => {
    if (step2State === 'start') {
      setStep2State('transposed');
      onAddScore(100);
      showFeedback('✨ Trasporto riuscito: +5 è diventato -5 a destra!');
    }
  };

  const handleLvl2Merge = () => {
    if (step2State === 'transposed') {
      setStep2State('merged');
      onAddScore(150);
      showFeedback('⚡ Calcolo completato: 20 - 5 = 15!');
    }
  };

  const handleLvl2Divide = () => {
    if (step2State === 'merged') {
      setStep2State('solved');
      onAddScore(250);
      showFeedback('🎉 Fantastico! 15 diviso 3 dà x = 5!');
      onSuccess('x = 5', 3);
    }
  };

  // ----------------------------------------------------
  // SCOMPOSIZIONE LIVELLO 3: 9 - x^2
  // ----------------------------------------------------
  const handleLvl3Factor = () => {
    if (!step3Factored) {
      setStep3Factored(true);
      onAddScore(300);
      showFeedback('🎉 Riconosciuta la differenza di quadrati: (3 - x)(3 + x)!');
      onSuccess('(3 - x)(3 + x)', 1);
    }
  };

  // ----------------------------------------------------
  // SCOMPOSIZIONE LIVELLO 4: -2x^2 + 8
  // ----------------------------------------------------
  const handleLvl4Step1 = () => {
    if (step4State === 'start') {
      setStep4State('factored_out');
      onAddScore(150);
      showFeedback('⚡ Estratto il fattore comune -2! Ora scomponi (x² - 4).');
    }
  };

  const handleLvl4Step2 = () => {
    if (step4State === 'factored_out') {
      setStep4State('fully_factored');
      onAddScore(250);
      showFeedback('🎉 Scomposizione completata: -2(x - 2)(x + 2)!');
      onSuccess('-2(x - 2)(x + 2)', 2);
    }
  };

  // ----------------------------------------------------
  // SCOMPOSIZIONE LIVELLO 5: 4x^2 + 12x + 9
  // ----------------------------------------------------
  const handleLvl5Factor = () => {
    if (!step5Factored) {
      setStep5Factored(true);
      onAddScore(300);
      showFeedback('🎉 Quadrato di binomio perfetto: (2x + 3)²!');
      onSuccess('(2x + 3)²', 1);
    }
  };

  // ----------------------------------------------------
  // DICHIARAZIONE LIVELLO 6: x^2 + 4
  // ----------------------------------------------------
  const handleLvl6Declare = () => {
    if (!step6Declared) {
      setStep6Declared(true);
      onAddScore(300);
      showFeedback('🎯 Esatto! È una somma di quadrati positiva, non ha radici reali!');
      onSuccess('x² + 4 (Irriducibile su ℝ)', 1);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '440px',
      padding: '2rem 1rem',
      position: 'relative',
    }}>
      {/* Indicatore Gesto Guidato */}
      <div style={{
        marginBottom: '2rem',
        fontSize: '0.95rem',
        color: '#94a3b8',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'rgba(255, 255, 255, 0.04)',
        padding: '6px 16px',
        borderRadius: '999px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <span>👆</span>
        <span>
          {level.id === 'lvl-1' && (
            step1State === 'start' ? 'Trascina col mouse o col dito il blocco [+6] a destra dell\'uguale!' :
            step1State === 'transposed' ? 'Trascina [-6] sopra il [14] per calcolare la sottrazione!' :
            step1State === 'merged' ? 'Trascina il [2] sotto l\'[8] per dividere!' :
            'Equazione risolta con successo!'
          )}
          {level.id === 'lvl-2' && (
            step2State === 'start' ? 'Trascina [+5] a destra dell\'uguale!' :
            step2State === 'transposed' ? 'Trascina [-5] sopra il [20] per calcolare!' :
            step2State === 'merged' ? 'Trascina il [3] sotto il [15] per dividere!' :
            'Equazione risolta con successo!'
          )}
          {level.id === 'lvl-3' && 'Trascina o clicca i due termini per aprire la differenza di quadrati!'}
          {level.id === 'lvl-4' && (
            step4State === 'start' ? 'Trascina fuori il fattore comune [-2]!' :
            step4State === 'factored_out' ? 'Scomponi (x² - 4) trascinando i due quadrati!' :
            'Scomposizione completata!'
          )}
          {level.id === 'lvl-5' && 'Riconosci le due basi (2x) e (3): tocca per chiudere in (2x + 3)²!'}
          {level.id === 'lvl-6' && 'Questa espressione si può scomporre su ℝ? Dichiara la tua mossa!'}
        </span>
      </div>

      {/* ============================================================ */}
      {/* LIVELLO 1: 2x + 6 = 14                                      */}
      {/* ============================================================ */}
      {level.id === 'lvl-1' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          {/* Membro Sinistro */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Termine con x */}
            {step1State !== 'solved' ? (
              <div
                draggable={step1State === 'merged'}
                onDragStart={() => setDraggedItem('lvl1-coeff-2')}
                onClick={() => {
                  if (step1State === 'merged') handleLvl1Divide();
                }}
                className={`math-tile ${step1State === 'merged' ? 'animate-pop' : ''}`}
                style={{
                  padding: '1rem 1.4rem',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: step1State === 'merged' ? '2px dashed var(--color-var)' : '1px solid var(--border-card)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: 'var(--color-var)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                }}
                title={step1State === 'merged' ? 'Trascina o clicca per dividere per 2!' : 'Termine con incognita'}
              >
                2x
              </div>
            ) : (
              <div
                className="animate-pop"
                style={{
                  padding: '1rem 1.4rem',
                  borderRadius: '16px',
                  background: 'rgba(0, 240, 255, 0.15)',
                  border: '2px solid var(--color-var)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: 'var(--color-var)',
                }}
              >
                x
              </div>
            )}

            {/* Termine +6 da trasportare */}
            {step1State === 'start' && (
              <div
                draggable={true}
                onDragStart={() => setDraggedItem('lvl1-plus-6')}
                onClick={handleLvl1Transpose}
                className="math-tile animate-pop"
                style={{
                  padding: '1rem 1.4rem',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: '2px solid var(--color-plus)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: 'var(--color-plus)',
                  boxShadow: '0 6px 20px rgba(52, 211, 153, 0.25)',
                }}
                title="Trascina o clicca per trasportare a destra dell'uguale!"
              >
                +6
              </div>
            )}
          </div>

          {/* Segno Uguale */}
          <div style={{
            fontFamily: 'var(--font-math)',
            fontSize: '3rem',
            fontWeight: 900,
            color: 'var(--color-equal)',
            padding: '0 0.5rem',
            textShadow: '0 0 15px rgba(192, 132, 252, 0.5)',
          }}>
            =
          </div>

          {/* Membro Destro (Dropzone per il trasporto e fusione) */}
          <div
            onDragOver={e => {
              e.preventDefault();
              setIsDropTargetActive(true);
            }}
            onDragLeave={() => setIsDropTargetActive(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDropTargetActive(false);
              if (draggedItem === 'lvl1-plus-6') handleLvl1Transpose();
              if (draggedItem === 'lvl1-minus-6') handleLvl1Merge();
              if (draggedItem === 'lvl1-coeff-2') handleLvl1Divide();
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              border: isDropTargetActive ? '2px dashed var(--color-var)' : '2px dashed transparent',
              background: isDropTargetActive ? 'rgba(0, 240, 255, 0.08)' : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {step1State === 'start' && (
              <div style={{
                padding: '1rem 1.4rem',
                borderRadius: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                fontFamily: 'var(--font-math)',
                fontSize: '2.4rem',
                fontWeight: 800,
                color: 'var(--color-num)',
              }}>
                14
              </div>
            )}

            {step1State === 'transposed' && (
              <>
                <div
                  onClick={handleLvl1Merge}
                  style={{
                    padding: '1rem 1.4rem',
                    borderRadius: '16px',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-card)',
                    fontFamily: 'var(--font-math)',
                    fontSize: '2.4rem',
                    fontWeight: 800,
                    color: 'var(--color-num)',
                    cursor: 'pointer',
                  }}
                  title="Clicca o trascina -6 qui sopra per fondere!"
                >
                  14
                </div>

                <div
                  draggable={true}
                  onDragStart={() => setDraggedItem('lvl1-minus-6')}
                  onClick={handleLvl1Merge}
                  className="math-tile animate-pop"
                  style={{
                    padding: '1rem 1.4rem',
                    borderRadius: '16px',
                    background: 'rgba(248, 113, 113, 0.15)',
                    border: '2px solid var(--color-minus)',
                    fontFamily: 'var(--font-math)',
                    fontSize: '2.4rem',
                    fontWeight: 800,
                    color: 'var(--color-minus)',
                    boxShadow: '0 6px 20px rgba(248, 113, 113, 0.3)',
                  }}
                  title="Trascina sopra il 14 per calcolare 14 - 6!"
                >
                  −6
                </div>
              </>
            )}

            {step1State === 'merged' && (
              <div
                onClick={handleLvl1Divide}
                className="math-tile animate-pop"
                style={{
                  padding: '1rem 1.4rem',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: '2px solid var(--color-num)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: 'var(--color-num)',
                  boxShadow: '0 6px 20px rgba(251, 191, 36, 0.25)',
                  cursor: 'pointer',
                }}
                title="Tocca per dividere per 2!"
              >
                8
              </div>
            )}

            {step1State === 'solved' && (
              <div
                className="animate-pop"
                style={{
                  padding: '1rem 1.6rem',
                  borderRadius: '16px',
                  background: 'rgba(52, 211, 153, 0.2)',
                  border: '2px solid var(--color-plus)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.6rem',
                  fontWeight: 900,
                  color: 'var(--color-plus)',
                }}
              >
                4
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* LIVELLO 2: 3x + 5 = 20                                      */}
      {/* ============================================================ */}
      {level.id === 'lvl-2' && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1.25rem',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {step2State !== 'solved' ? (
              <div
                onClick={() => {
                  if (step2State === 'merged') handleLvl2Divide();
                }}
                className={`math-tile ${step2State === 'merged' ? 'animate-pop' : ''}`}
                style={{
                  padding: '1rem 1.4rem',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: step2State === 'merged' ? '2px dashed var(--color-var)' : '1px solid var(--border-card)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: 'var(--color-var)',
                }}
              >
                3x
              </div>
            ) : (
              <div className="animate-pop" style={{
                padding: '1rem 1.4rem',
                borderRadius: '16px',
                background: 'rgba(0, 240, 255, 0.15)',
                border: '2px solid var(--color-var)',
                fontFamily: 'var(--font-math)',
                fontSize: '2.5rem',
                fontWeight: 900,
                color: 'var(--color-var)',
              }}>
                x
              </div>
            )}

            {step2State === 'start' && (
              <div
                onClick={handleLvl2Transpose}
                className="math-tile animate-pop"
                style={{
                  padding: '1rem 1.4rem',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: '2px solid var(--color-plus)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: 'var(--color-plus)',
                }}
              >
                +5
              </div>
            )}
          </div>

          <div style={{ fontFamily: 'var(--font-math)', fontSize: '3rem', fontWeight: 900, color: 'var(--color-equal)' }}>
            =
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {step2State === 'start' && (
              <div style={{
                padding: '1rem 1.4rem',
                borderRadius: '16px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                fontFamily: 'var(--font-math)',
                fontSize: '2.4rem',
                fontWeight: 800,
                color: 'var(--color-num)',
              }}>
                20
              </div>
            )}

            {step2State === 'transposed' && (
              <>
                <div onClick={handleLvl2Merge} style={{
                  padding: '1rem 1.4rem',
                  borderRadius: '16px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-card)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: 'var(--color-num)',
                  cursor: 'pointer',
                }}>
                  20
                </div>
                <div onClick={handleLvl2Merge} className="math-tile animate-pop" style={{
                  padding: '1rem 1.4rem',
                  borderRadius: '16px',
                  background: 'rgba(248, 113, 113, 0.15)',
                  border: '2px solid var(--color-minus)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.4rem',
                  fontWeight: 800,
                  color: 'var(--color-minus)',
                }}>
                  −5
                </div>
              </>
            )}

            {step2State === 'merged' && (
              <div onClick={handleLvl2Divide} className="math-tile animate-pop" style={{
                padding: '1rem 1.4rem',
                borderRadius: '16px',
                background: 'var(--bg-card)',
                border: '2px solid var(--color-num)',
                fontFamily: 'var(--font-math)',
                fontSize: '2.4rem',
                fontWeight: 800,
                color: 'var(--color-num)',
              }}>
                15
              </div>
            )}

            {step2State === 'solved' && (
              <div className="animate-pop" style={{
                padding: '1rem 1.6rem',
                borderRadius: '16px',
                background: 'rgba(52, 211, 153, 0.2)',
                border: '2px solid var(--color-plus)',
                fontFamily: 'var(--font-math)',
                fontSize: '2.6rem',
                fontWeight: 900,
                color: 'var(--color-plus)',
              }}>
                5
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* LIVELLO 3: 9 - x^2                                          */}
      {/* ============================================================ */}
      {level.id === 'lvl-3' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          {!step3Factored ? (
            <div
              onClick={handleLvl3Factor}
              className="math-tile animate-pop"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem 2rem',
                borderRadius: '20px',
                background: 'var(--bg-card)',
                border: '2px solid var(--color-var)',
                boxShadow: '0 8px 30px rgba(0, 240, 255, 0.25)',
                cursor: 'pointer',
              }}
              title="Tocca per scomporre la differenza di quadrati!"
            >
              <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.8rem', fontWeight: 800, color: 'var(--color-num)' }}>
                9
              </span>
              <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.8rem', fontWeight: 900, color: 'var(--color-minus)' }}>
                −
              </span>
              <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.8rem', fontWeight: 800, color: 'var(--color-var)' }}>
                x²
              </span>
            </div>
          ) : (
            <div
              className="animate-pop"
              style={{
                padding: '1.25rem 2.25rem',
                borderRadius: '20px',
                background: 'rgba(52, 211, 153, 0.15)',
                border: '2px solid var(--color-plus)',
                fontFamily: 'var(--font-math)',
                fontSize: '2.8rem',
                fontWeight: 900,
                color: 'var(--color-plus)',
              }}
            >
              (3 − x)(3 + x)
            </div>
          )}

          {!step3Factored && (
            <button
              onClick={handleLvl3Factor}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1rem',
                boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)',
              }}
            >
              🧩 Scomponi Differenza di Quadrati: a² − b²
            </button>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* LIVELLO 4: -2x^2 + 8                                        */}
      {/* ============================================================ */}
      {level.id === 'lvl-4' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          {step4State === 'start' && (
            <div
              onClick={handleLvl4Step1}
              className="math-tile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '1.25rem 2rem',
                borderRadius: '20px',
                background: 'var(--bg-card)',
                border: '2px solid var(--color-num)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.6rem', fontWeight: 800, color: 'var(--color-var)' }}>
                −2x²
              </span>
              <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.6rem', fontWeight: 800, color: 'var(--color-num)' }}>
                + 8
              </span>
            </div>
          )}

          {step4State === 'factored_out' && (
            <div
              onClick={handleLvl4Step2}
              className="math-tile animate-pop"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '1.25rem 2rem',
                borderRadius: '20px',
                background: 'var(--bg-card)',
                border: '2px solid var(--color-plus)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.6rem', fontWeight: 900, color: 'var(--color-minus)' }}>
                −2
              </span>
              <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.6rem', fontWeight: 800, color: '#fff' }}>
                (x² − 4)
              </span>
            </div>
          )}

          {step4State === 'fully_factored' && (
            <div
              className="animate-pop"
              style={{
                padding: '1.25rem 2rem',
                borderRadius: '20px',
                background: 'rgba(52, 211, 153, 0.15)',
                border: '2px solid var(--color-plus)',
                fontFamily: 'var(--font-math)',
                fontSize: '2.6rem',
                fontWeight: 900,
                color: 'var(--color-plus)',
              }}
            >
              −2(x − 2)(x + 2)
            </div>
          )}

          {step4State === 'start' && (
            <button
              onClick={handleLvl4Step1}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#000',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              ⚡ Raccogli il Fattore Comune: −2
            </button>
          )}

          {step4State === 'factored_out' && (
            <button
              onClick={handleLvl4Step2}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              🧩 Scomponi la Differenza di Quadrati (x² − 4)
            </button>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* LIVELLO 5: 4x^2 + 12x + 9                                    */}
      {/* ============================================================ */}
      {level.id === 'lvl-5' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          {!step5Factored ? (
            <div
              onClick={handleLvl5Factor}
              className="math-tile"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '1.25rem 2rem',
                borderRadius: '20px',
                background: 'var(--bg-card)',
                border: '2px solid var(--color-var)',
                cursor: 'pointer',
              }}
            >
              <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.6rem', fontWeight: 800, color: 'var(--color-var)' }}>
                4x²
              </span>
              <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.6rem', fontWeight: 800, color: '#38bdf8' }}>
                + 12x
              </span>
              <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.6rem', fontWeight: 800, color: 'var(--color-num)' }}>
                + 9
              </span>
            </div>
          ) : (
            <div
              className="animate-pop"
              style={{
                padding: '1.25rem 2.25rem',
                borderRadius: '20px',
                background: 'rgba(52, 211, 153, 0.15)',
                border: '2px solid var(--color-plus)',
                fontFamily: 'var(--font-math)',
                fontSize: '2.8rem',
                fontWeight: 900,
                color: 'var(--color-plus)',
              }}
            >
              (2x + 3)²
            </div>
          )}

          {!step5Factored && (
            <button
              onClick={handleLvl5Factor}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #c084fc, #9333ea)',
                color: '#fff',
                fontWeight: 800,
                fontSize: '1rem',
              }}
            >
              🧩 Chiudi nel Quadrato di Binomio: (a + b)²
            </button>
          )}
        </div>
      )}

      {/* ============================================================ */}
      {/* LIVELLO 6: x^2 + 4                                          */}
      {/* ============================================================ */}
      {level.id === 'lvl-6' && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{
            padding: '1.25rem 2.5rem',
            borderRadius: '20px',
            background: 'var(--bg-card)',
            border: step6Declared ? '2px solid var(--color-plus)' : '2px solid var(--border-card)',
            fontFamily: 'var(--font-math)',
            fontSize: '2.8rem',
            fontWeight: 800,
            color: step6Declared ? 'var(--color-plus)' : 'var(--color-var)',
          }}>
            x² + 4
          </div>

          {!step6Declared ? (
            <button
              onClick={handleLvl6Declare}
              style={{
                padding: '0.85rem 1.75rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                color: '#fff',
                fontWeight: 900,
                fontSize: '1.05rem',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
              }}
            >
              🚫 Dichiara Irriducibile su ℝ (Somma di Quadrati)
            </button>
          ) : (
            <div style={{ color: 'var(--color-plus)', fontWeight: 700, fontSize: '1.1rem' }}>
              ✓ Riconosciuto correttamente come irriducibile su ℝ!
            </div>
          )}
        </div>
      )}

      {/* Feedback a scomparsa in una riga */}
      {actionMessage && (
        <div
          className="animate-pop"
          style={{
            marginTop: '2rem',
            padding: '0.6rem 1.25rem',
            borderRadius: '999px',
            background: 'rgba(52, 211, 153, 0.12)',
            border: '1px solid rgba(52, 211, 153, 0.3)',
            color: '#6ee7b7',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          {actionMessage}
        </div>
      )}
    </div>
  );
};
