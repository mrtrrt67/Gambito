import React, { useState } from 'react';

export interface LevelData {
  id: string;
  title: string;
  category: 'Equazione' | 'Scomposizione';
  par: number;
  baseScore: number;
  hint: string;
}

export const GAME_LEVELS: LevelData[] = [
  {
    id: 'lvl-1',
    title: 'Equazione: 2x + 6 = 14',
    category: 'Equazione',
    par: 3,
    baseScore: 2000,
    hint: 'Sposta il blocco +6 a destra dell\'uguale: cambierà di segno in −6!',
  },
  {
    id: 'lvl-2',
    title: 'Equazione: 3x − 5 = 10',
    category: 'Equazione',
    par: 3,
    baseScore: 2000,
    hint: 'Sposta il blocco −5 a destra dell\'uguale: cambierà di segno in +5!',
  },
  {
    id: 'lvl-3',
    title: 'Scomposizione: 9 − x²',
    category: 'Scomposizione',
    par: 1,
    baseScore: 2200,
    hint: 'Differenza di quadrati: le radici sono 3 e x. Scomponi in (3 − x)(3 + x).',
  },
  {
    id: 'lvl-4',
    title: 'Scomposizione: 4x² + 12x + 9',
    category: 'Scomposizione',
    par: 1,
    baseScore: 2400,
    hint: 'Quadrato di binomio: le basi sono 2x e 3. Chiudi in (2x + 3)²',
  },
  {
    id: 'lvl-5',
    title: 'Scomposizione: x² + 4',
    category: 'Scomposizione',
    par: 1,
    baseScore: 2000,
    hint: 'Somma di due quadrati positivi: non ha radici reali, è irriducibile su ℝ.',
  },
];

interface AlgebraCanvasProps {
  level: LevelData;
  onMoveSuccess: () => void;
  onMoveMistake: (msg: string) => void;
  onCompleteLevel: (finalResult: string) => void;
}

export const AlgebraCanvas: React.FC<AlgebraCanvasProps> = ({
  level,
  onMoveSuccess,
  onMoveMistake,
  onCompleteLevel,
}) => {
  // Step progression per livello
  const [step, setStep] = useState<number>(0);
  const [isCompleted, setIsCompleted] = useState<boolean>(false);
  const [finalResultStr, setFinalResultStr] = useState<string>('');

  // ----------------------------------------------------------------
  // LIVELLO 1: 2x + 6 = 14
  // Step 0: 2x + 6 = 14
  // Step 1: 2x = 14 - 6
  // Step 2: 2x = 8
  // Step 3: x = 4 (Risolto!)
  // ----------------------------------------------------------------
  const handleLvl1Step1 = () => {
    if (step === 0) {
      setStep(1);
      onMoveSuccess();
    }
  };

  const handleLvl1Step2 = () => {
    if (step === 1) {
      setStep(2);
      onMoveSuccess();
    }
  };

  const handleLvl1Step3 = () => {
    if (step === 2) {
      setStep(3);
      setIsCompleted(true);
      setFinalResultStr('x = 4');
      onMoveSuccess();
      onCompleteLevel('x = 4');
    }
  };

  // ----------------------------------------------------------------
  // LIVELLO 2: 3x - 5 = 10
  // Step 0: 3x - 5 = 10
  // Step 1: 3x = 10 + 5
  // Step 2: 3x = 15
  // Step 3: x = 5 (Risolto!)
  // ----------------------------------------------------------------
  const handleLvl2Step1 = () => {
    if (step === 0) {
      setStep(1);
      onMoveSuccess();
    }
  };

  const handleLvl2Step2 = () => {
    if (step === 1) {
      setStep(2);
      onMoveSuccess();
    }
  };

  const handleLvl2Step3 = () => {
    if (step === 2) {
      setStep(3);
      setIsCompleted(true);
      setFinalResultStr('x = 5');
      onMoveSuccess();
      onCompleteLevel('x = 5');
    }
  };

  // ----------------------------------------------------------------
  // LIVELLO 3: 9 - x^2 -> (3 - x)(3 + x)
  // ----------------------------------------------------------------
  const handleLvl3Solve = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      setFinalResultStr('(3 − x)(3 + x)');
      onMoveSuccess();
      onCompleteLevel('(3 − x)(3 + x)');
    }
  };

  // ----------------------------------------------------------------
  // LIVELLO 4: 4x^2 + 12x + 9 -> (2x + 3)^2
  // ----------------------------------------------------------------
  const handleLvl4Solve = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      setFinalResultStr('(2x + 3)²');
      onMoveSuccess();
      onCompleteLevel('(2x + 3)²');
    }
  };

  // ----------------------------------------------------------------
  // LIVELLO 5: x^2 + 4 -> Irriducibile su R
  // ----------------------------------------------------------------
  const handleLvl5Solve = () => {
    if (!isCompleted) {
      setIsCompleted(true);
      setFinalResultStr('x² + 4 (Irriducibile su ℝ)');
      onMoveSuccess();
      onCompleteLevel('x² + 4 (Irriducibile su ℝ)');
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '850px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
    }}>
      {/* Barra Istruzione Passo-Passo */}
      {!isCompleted ? (
        <div style={{
          marginBottom: '2rem',
          fontSize: '1rem',
          fontWeight: 700,
          color: '#38bdf8',
          background: 'rgba(56, 189, 248, 0.1)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          padding: '8px 20px',
          borderRadius: '999px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          <span>👆</span>
          <span>
            {level.id === 'lvl-1' && (
              step === 0 ? 'Passo 1: Trascina o tocca il blocco [+6] per spostarlo a destra dell\'uguale!' :
              step === 1 ? 'Passo 2: Trascina [-6] sopra il [14] per calcolare 14 − 6!' :
              'Passo 3: Trascina il [2] sotto l\'[8] per dividere e trovare x!'
            )}
            {level.id === 'lvl-2' && (
              step === 0 ? 'Passo 1: Trascina o tocca il blocco [−5] per spostarlo a destra!' :
              step === 1 ? 'Passo 2: Trascina [+5] sopra il [10] per calcolare 10 + 5!' :
              'Passo 3: Trascina il [3] sotto il [15] per dividere e trovare x!'
            )}
            {level.id === 'lvl-3' && 'Trascina i due termini per aprire la differenza di quadrati: a² − b²!'}
            {level.id === 'lvl-4' && 'Riconosci le basi (2x) e (3): tocca per chiudere in quadrato di binomio!'}
            {level.id === 'lvl-5' && 'Somma di due quadrati: dichiara se è riducibile o irriducibile su ℝ!'}
          </span>
        </div>
      ) : (
        /* ======================================================= */
        /* RISULTATO FINALE GIGANTE BEN VISIBILE                   */
        /* ======================================================= */
        <div
          className="animate-pop"
          style={{
            marginBottom: '2.5rem',
            width: '100%',
            textAlign: 'center',
            padding: '2rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.18), rgba(0, 240, 255, 0.12))',
            border: '2px solid #10b981',
            boxShadow: '0 0 40px rgba(16, 185, 129, 0.35)',
          }}
        >
          <div style={{ fontSize: '0.85rem', textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 900, letterSpacing: '1px', marginBottom: '0.5rem' }}>
            ✓ RISOLUZIONE COMPLETATA CON SUCCESSO!
          </div>

          <div style={{
            fontFamily: 'var(--font-math)',
            fontSize: '3.5rem',
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 0 25px rgba(0, 240, 255, 0.7)',
            marginBottom: '0.5rem',
          }}>
            {finalResultStr}
          </div>

          <div style={{ fontSize: '1rem', color: '#94a3b8' }}>
            Ottimo lavoro! Ogni singolo numero e segno è stato spostato e risolto correttamente.
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* LA FORMULA DINAMICA CENTRALE                           */}
      {/* ======================================================= */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexWrap: 'wrap',
        gap: '1.25rem',
        padding: '2rem',
        borderRadius: '24px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-card)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        minHeight: '140px',
        width: '100%',
      }}>
        {/* ================= LIVELLO 1: 2x + 6 = 14 ================= */}
        {level.id === 'lvl-1' && (
          <>
            {/* Lato Sinistro */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                draggable={step === 2}
                onDragStart={() => {}}
                onClick={handleLvl1Step3}
                style={{
                  padding: '1rem 1.6rem',
                  borderRadius: '16px',
                  background: step === 3 ? 'rgba(0, 240, 255, 0.15)' : '#0c101d',
                  border: step === 2 ? '2px dashed var(--color-var)' : '2px solid var(--color-var)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: 'var(--color-var)',
                  cursor: step === 2 ? 'pointer' : 'default',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
                  transition: 'all 0.2s ease',
                }}
                title={step === 2 ? 'Tocca o trascina per dividere per 2!' : ''}
              >
                {step < 3 ? '2x' : 'x'}
              </div>

              {step === 0 && (
                <div
                  draggable={true}
                  onClick={handleLvl1Step1}
                  className="math-tile animate-pop"
                  style={{
                    padding: '1rem 1.6rem',
                    borderRadius: '16px',
                    background: '#0c101d',
                    border: '2px solid var(--color-plus)',
                    fontFamily: 'var(--font-math)',
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: 'var(--color-plus)',
                    boxShadow: '0 4px 15px rgba(52, 211, 153, 0.3)',
                    cursor: 'grab',
                  }}
                  title="Trascina a destra dell'uguale per trasportare!"
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
            }}>
              =
            </div>

            {/* Lato Destro */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {step === 0 && (
                <div style={{
                  padding: '1rem 1.6rem',
                  borderRadius: '16px',
                  background: '#0c101d',
                  border: '2px solid var(--color-num)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: 'var(--color-num)',
                }}>
                  14
                </div>
              )}

              {step === 1 && (
                <>
                  <div
                    onClick={handleLvl1Step2}
                    style={{
                      padding: '1rem 1.6rem',
                      borderRadius: '16px',
                      background: '#0c101d',
                      border: '2px solid var(--color-num)',
                      fontFamily: 'var(--font-math)',
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      color: 'var(--color-num)',
                      cursor: 'pointer',
                    }}
                  >
                    14
                  </div>
                  <div
                    onClick={handleLvl1Step2}
                    className="math-tile animate-pop"
                    style={{
                      padding: '1rem 1.6rem',
                      borderRadius: '16px',
                      background: 'rgba(248, 113, 113, 0.15)',
                      border: '2px solid var(--color-minus)',
                      fontFamily: 'var(--font-math)',
                      fontSize: '2.5rem',
                      fontWeight: 900,
                      color: 'var(--color-minus)',
                      boxShadow: '0 4px 15px rgba(248, 113, 113, 0.3)',
                      cursor: 'pointer',
                    }}
                    title="Tocca per calcolare 14 − 6!"
                  >
                    −6
                  </div>
                </>
              )}

              {step === 2 && (
                <div
                  onClick={handleLvl1Step3}
                  className="math-tile animate-pop"
                  style={{
                    padding: '1rem 1.6rem',
                    borderRadius: '16px',
                    background: '#0c101d',
                    border: '2px solid var(--color-num)',
                    fontFamily: 'var(--font-math)',
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: 'var(--color-num)',
                    boxShadow: '0 4px 15px rgba(251, 191, 36, 0.3)',
                    cursor: 'pointer',
                  }}
                  title="Tocca per dividere per 2!"
                >
                  8
                </div>
              )}

              {step === 3 && (
                <div
                  className="animate-pop"
                  style={{
                    padding: '1rem 1.8rem',
                    borderRadius: '16px',
                    background: 'rgba(52, 211, 153, 0.2)',
                    border: '2px solid var(--color-plus)',
                    fontFamily: 'var(--font-math)',
                    fontSize: '2.8rem',
                    fontWeight: 900,
                    color: 'var(--color-plus)',
                  }}
                >
                  4
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= LIVELLO 2: 3x - 5 = 10 ================= */}
        {level.id === 'lvl-2' && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div
                onClick={handleLvl2Step3}
                style={{
                  padding: '1rem 1.6rem',
                  borderRadius: '16px',
                  background: step === 3 ? 'rgba(0, 240, 255, 0.15)' : '#0c101d',
                  border: step === 2 ? '2px dashed var(--color-var)' : '2px solid var(--color-var)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: 'var(--color-var)',
                  cursor: step === 2 ? 'pointer' : 'default',
                }}
              >
                {step < 3 ? '3x' : 'x'}
              </div>

              {step === 0 && (
                <div
                  onClick={handleLvl2Step1}
                  className="math-tile animate-pop"
                  style={{
                    padding: '1rem 1.6rem',
                    borderRadius: '16px',
                    background: '#0c101d',
                    border: '2px solid var(--color-minus)',
                    fontFamily: 'var(--font-math)',
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: 'var(--color-minus)',
                    cursor: 'pointer',
                  }}
                  title="Trascina a destra per trasportare!"
                >
                  −5
                </div>
              )}
            </div>

            <div style={{ fontFamily: 'var(--font-math)', fontSize: '3rem', fontWeight: 900, color: 'var(--color-equal)' }}>
              =
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              {step === 0 && (
                <div style={{
                  padding: '1rem 1.6rem',
                  borderRadius: '16px',
                  background: '#0c101d',
                  border: '2px solid var(--color-num)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: 'var(--color-num)',
                }}>
                  10
                </div>
              )}

              {step === 1 && (
                <>
                  <div onClick={handleLvl2Step2} style={{
                    padding: '1rem 1.6rem',
                    borderRadius: '16px',
                    background: '#0c101d',
                    border: '2px solid var(--color-num)',
                    fontFamily: 'var(--font-math)',
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: 'var(--color-num)',
                    cursor: 'pointer',
                  }}>
                    10
                  </div>
                  <div onClick={handleLvl2Step2} className="math-tile animate-pop" style={{
                    padding: '1rem 1.6rem',
                    borderRadius: '16px',
                    background: 'rgba(52, 211, 153, 0.15)',
                    border: '2px solid var(--color-plus)',
                    fontFamily: 'var(--font-math)',
                    fontSize: '2.5rem',
                    fontWeight: 900,
                    color: 'var(--color-plus)',
                    cursor: 'pointer',
                  }}>
                    +5
                  </div>
                </>
              )}

              {step === 2 && (
                <div onClick={handleLvl2Step3} className="math-tile animate-pop" style={{
                  padding: '1rem 1.6rem',
                  borderRadius: '16px',
                  background: '#0c101d',
                  border: '2px solid var(--color-num)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: 'var(--color-num)',
                  cursor: 'pointer',
                }}>
                  15
                </div>
              )}

              {step === 3 && (
                <div className="animate-pop" style={{
                  padding: '1rem 1.8rem',
                  borderRadius: '16px',
                  background: 'rgba(52, 211, 153, 0.2)',
                  border: '2px solid var(--color-plus)',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.8rem',
                  fontWeight: 900,
                  color: 'var(--color-plus)',
                }}>
                  5
                </div>
              )}
            </div>
          </>
        )}

        {/* ================= LIVELLO 3: 9 - x^2 ================= */}
        {level.id === 'lvl-3' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!isCompleted ? (
              <div
                onClick={handleLvl3Solve}
                className="math-tile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '1.2rem 2.2rem',
                  borderRadius: '20px',
                  background: '#0c101d',
                  border: '2px solid var(--color-var)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontFamily: 'var(--font-math)', fontSize: '3rem', fontWeight: 900, color: 'var(--color-num)' }}>9</span>
                <span style={{ fontFamily: 'var(--font-math)', fontSize: '3rem', fontWeight: 900, color: 'var(--color-minus)' }}>−</span>
                <span style={{ fontFamily: 'var(--font-math)', fontSize: '3rem', fontWeight: 900, color: 'var(--color-var)' }}>x²</span>
              </div>
            ) : (
              <div className="animate-pop" style={{
                padding: '1.2rem 2.2rem',
                borderRadius: '20px',
                background: 'rgba(52, 211, 153, 0.15)',
                border: '2px solid var(--color-plus)',
                fontFamily: 'var(--font-math)',
                fontSize: '3rem',
                fontWeight: 900,
                color: 'var(--color-plus)',
              }}>
                (3 − x)(3 + x)
              </div>
            )}
          </div>
        )}

        {/* ================= LIVELLO 4: 4x^2 + 12x + 9 ================= */}
        {level.id === 'lvl-4' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {!isCompleted ? (
              <div
                onClick={handleLvl4Solve}
                className="math-tile"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.8rem',
                  padding: '1.2rem 2rem',
                  borderRadius: '20px',
                  background: '#0c101d',
                  border: '2px solid var(--color-var)',
                  cursor: 'pointer',
                }}
              >
                <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.6rem', fontWeight: 900, color: 'var(--color-var)' }}>4x²</span>
                <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.6rem', fontWeight: 900, color: '#38bdf8' }}>+ 12x</span>
                <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.6rem', fontWeight: 900, color: 'var(--color-num)' }}>+ 9</span>
              </div>
            ) : (
              <div className="animate-pop" style={{
                padding: '1.2rem 2.2rem',
                borderRadius: '20px',
                background: 'rgba(52, 211, 153, 0.15)',
                border: '2px solid var(--color-plus)',
                fontFamily: 'var(--font-math)',
                fontSize: '3rem',
                fontWeight: 900,
                color: 'var(--color-plus)',
              }}>
                (2x + 3)²
              </div>
            )}
          </div>
        )}

        {/* ================= LIVELLO 5: x^2 + 4 ================= */}
        {level.id === 'lvl-5' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{
              padding: '1.2rem 2.5rem',
              borderRadius: '20px',
              background: '#0c101d',
              border: isCompleted ? '2px solid var(--color-plus)' : '2px solid var(--border-card)',
              fontFamily: 'var(--font-math)',
              fontSize: '3rem',
              fontWeight: 900,
              color: isCompleted ? 'var(--color-plus)' : 'var(--color-var)',
            }}>
              x² + 4
            </div>

            {!isCompleted && (
              <button
                onClick={handleLvl5Solve}
                style={{
                  padding: '0.85rem 1.8rem',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '1.05rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                }}
              >
                🚫 Dichiara Irriducibile su ℝ
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
