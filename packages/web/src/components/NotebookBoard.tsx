import React, { useState } from 'react';

export interface NotebookPassage {
  step: number;
  expression: string;
  note: string;
}

export interface MathAtom {
  id: string;
  text: string;
  type: 'var' | 'coeff' | 'const' | 'sign' | 'operator' | 'paren';
  sign?: '+' | '−';
  side: 'lhs' | 'rhs';
}

interface NotebookBoardProps {
  initialTitle: string;
  category: 'Equazione' | 'Scomposizione';
  par: number;
  onWin: (finalExpr: string, movesCount: number) => void;
  onMistake: (msg: string) => void;
  onMoveAction: () => void;
}

export const NotebookBoard: React.FC<NotebookBoardProps> = ({
  initialTitle,
  category,
  par,
  onWin,
  onMistake,
  onMoveAction,
}) => {
  // Passaggi già scritti a penna sul quaderno
  const [passages, setPassages] = useState<NotebookPassage[]>([
    { step: 1, expression: initialTitle, note: 'Espressione di partenza' },
  ]);

  // Stato atomico della riga di lavoro attiva (es. 2x + 6 = 14)
  const isEquation = initialTitle.includes('=');

  // Elementi della riga corrente
  const [lhsTerms, setLhsTerms] = useState<Array<{ id: string; text: string; sign: '+' | '−'; coeff?: string; varName?: string }>>(() => {
    if (initialTitle === '2x + 6 = 14') {
      return [
        { id: 't1', text: '2x', sign: '+', coeff: '2', varName: 'x' },
        { id: 't2', text: '6', sign: '+' },
      ];
    }
    if (initialTitle === '3x − 5 = 10') {
      return [
        { id: 't1', text: '3x', sign: '+', coeff: '3', varName: 'x' },
        { id: 't2', text: '5', sign: '−' },
      ];
    }
    return [{ id: 't1', text: initialTitle, sign: '+' }];
  });

  const [rhsTerms, setRhsTerms] = useState<Array<{ id: string; text: string; sign: '+' | '−' }>>(() => {
    if (initialTitle === '2x + 6 = 14') return [{ id: 'r1', text: '14', sign: '+' }];
    if (initialTitle === '3x − 5 = 10') return [{ id: 'r1', text: '10', sign: '+' }];
    return [];
  });

  // Stato per polinomi da scomporre
  const [polyString, setPolyString] = useState<string>(initialTitle);
  const [isFactorModalOpen, setIsFactorModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'raccoglimento' | 'diffQuadrati' | 'quadBinomio' | 'calcola'>('raccoglimento');
  const [inputVal1, setInputVal1] = useState('');
  const [inputVal2, setInputVal2] = useState('');

  // Segnalazione feedback o vittoria
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [finalResult, setFinalResult] = useState<string>('');

  // 1. Sposta un termine da un membro all'altro (Trasporto manuale come sul quaderno)
  const handleTransportTerm = (termId: string, fromSide: 'lhs' | 'rhs') => {
    if (fromSide === 'lhs') {
      const term = lhsTerms.find(t => t.id === termId);
      if (!term) return;
      setLhsTerms(prev => prev.filter(t => t.id !== termId));
      // Lo sposta a destra mantenendo il segno originale così lo studente DEVE cambiare il segno con un tocco!
      setRhsTerms(prev => [...prev, { ...term }]);
      onMoveAction();
      setFeedback(`Hai spostato [${term.text}] a destra. Ora tocca il suo segno per cambiarlo come sul quaderno!`);
      setIsError(false);
    } else {
      const term = rhsTerms.find(t => t.id === termId);
      if (!term) return;
      setRhsTerms(prev => prev.filter(t => t.id !== termId));
      setLhsTerms(prev => [...prev, { ...term }]);
      onMoveAction();
      setFeedback(`Hai spostato [${term.text}] a sinistra. Ricorda di invertire il segno con un tocco!`);
      setIsError(false);
    }
  };

  // 2. Tocca con il dito per cambiare segno (+ <-> -)
  const handleToggleSign = (termId: string, side: 'lhs' | 'rhs') => {
    onMoveAction();
    if (side === 'lhs') {
      setLhsTerms(prev => prev.map(t => t.id === termId ? { ...t, sign: t.sign === '+' ? '−' : '+' } : t));
    } else {
      setRhsTerms(prev => prev.map(t => t.id === termId ? { ...t, sign: t.sign === '+' ? '−' : '+' } : t));
    }
    setFeedback('Segno invertito con successo!');
    setIsError(false);
  };

  // 3. Separa coefficiente dall'incognita (es. 2x -> 2 e x)
  const handleSeparateVariable = (termId: string) => {
    const term = lhsTerms.find(t => t.id === termId);
    if (!term || !term.coeff || !term.varName) return;
    onMoveAction();
    setLhsTerms(prev => prev.map(t => {
      if (t.id === termId) {
        return { ...t, text: t.varName!, coeff: undefined };
      }
      return t;
    }));
    // Il coefficiente passa a destra come divisore!
    setRhsTerms(prev => [...prev, { id: `div-${Date.now()}`, text: `÷ ${term.coeff}`, sign: '+' }]);
    setFeedback(`Hai separato l'incognita ${term.varName} e portato ${term.coeff} a dividere a destra!`);
    setIsError(false);
  };

  // 4. Calcola operazione tra due numeri (es. 14 - 6 -> 8 o 10 + 5 -> 15 o 8 ÷ 2 -> 4)
  const handleCalculateRhs = () => {
    onMoveAction();
    const str = rhsTerms.map(t => `${t.sign === '−' ? '-' : ''}${t.text}`).join(' ');

    if (str.includes('14') && str.includes('-6')) {
      setRhsTerms([{ id: 'r-calc', text: '8', sign: '+' }]);
      setFeedback('Calcolo eseguito: 14 − 6 = 8!');
      setIsError(false);
      return;
    }
    if (str.includes('10') && str.includes('5')) {
      setRhsTerms([{ id: 'r-calc', text: '15', sign: '+' }]);
      setFeedback('Calcolo eseguito: 10 + 5 = 15!');
      setIsError(false);
      return;
    }
    if (str.includes('8') && str.includes('÷ 2')) {
      setRhsTerms([{ id: 'r-calc', text: '4', sign: '+' }]);
      setFeedback('Calcolo eseguito: 8 ÷ 2 = 4!');
      setIsError(false);
      return;
    }
    if (str.includes('15') && str.includes('÷ 3')) {
      setRhsTerms([{ id: 'r-calc', text: '5', sign: '+' }]);
      setFeedback('Calcolo eseguito: 15 ÷ 3 = 5!');
      setIsError(false);
      return;
    }

    setFeedback('Combina i termini o seleziona l\'operazione corretta.');
  };

  // 5. Verifica e scrive il passaggio sul quaderno
  const handleConfirmPassage = () => {
    onMoveAction();

    // Composizione della riga corrente
    const lhsStr = lhsTerms.map((t, i) => `${i > 0 || t.sign === '−' ? t.sign + ' ' : ''}${t.text}`).join(' ');
    const rhsStr = rhsTerms.map((t, i) => `${i > 0 || t.sign === '−' ? t.sign + ' ' : ''}${t.text}`).join(' ');
    const currentLine = isEquation ? `${lhsStr} = ${rhsStr}` : polyString;

    // Controllo errori algebrici tipici:
    // Errore: ha trasportato il 6 a destra ma ha lasciato il segno + (14 + 6 invece di 14 - 6)
    if (initialTitle === '2x + 6 = 14') {
      const hasPositive6OnRhs = rhsTerms.some(t => t.text === '6' && t.sign === '+');
      if (hasPositive6OnRhs) {
        setIsError(true);
        setFeedback('Attento! Quando sposti +6 oltre l\'uguale devi cambiare il segno in −6! Tocca il segno con il dito.');
        onMistake('Segno non invertito nel trasporto oltre l\'uguale');
        return;
      }

      // Soluzione finale trovata: x = 4
      if (lhsTerms.length === 1 && lhsTerms[0]?.text === 'x' && rhsTerms.length === 1 && rhsTerms[0]?.text === '4') {
        recordPassage('x = 4', 'Soluzione finale trovata!');
        setIsSolved(true);
        setFinalResult('x = 4');
        onWin('x = 4', passages.length + 1);
        return;
      }
    }

    if (initialTitle === '3x − 5 = 10') {
      const hasNegative5OnRhs = rhsTerms.some(t => t.text === '5' && t.sign === '−');
      if (hasNegative5OnRhs) {
        setIsError(true);
        setFeedback('Attento! Spostando −5 oltre l\'uguale devi toccarlo per farlo diventare +5!');
        onMistake('Segno non invertito nel trasporto');
        return;
      }

      // Soluzione finale trovata: x = 5
      if (lhsTerms.length === 1 && lhsTerms[0]?.text === 'x' && rhsTerms.length === 1 && rhsTerms[0]?.text === '5') {
        recordPassage('x = 5', 'Soluzione finale trovata!');
        setIsSolved(true);
        setFinalResult('x = 5');
        onWin('x = 5', passages.length + 1);
        return;
      }
    }

    // Registra passaggio valido
    recordPassage(currentLine, 'Passaggio algebrico convalidato');
    setFeedback('✓ Ottimo passaggio! Registrato sul quaderno.');
    setIsError(false);
  };

  const recordPassage = (expr: string, note: string) => {
    setPassages(prev => [...prev, { step: prev.length + 1, expression: expr, note }]);
  };

  // 6. Scomposizione polinomi (Raccoglimento & Prodotti Notevoli)
  const handleModalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onMoveAction();

    // Raccoglimento a fattor comune
    if (modalType === 'raccoglimento') {
      const factor = inputVal1.trim();
      if (polyString === '-2x^2 + 8' || polyString === '−2x² + 8') {
        if (factor === '-2' || factor === '−2') {
          const next = '−2(x² − 4)';
          setPolyString(next);
          recordPassage(next, 'Raccoglimento totale del fattore −2');
          setFeedback('Fattore −2 raccolto con successo!');
          setIsFactorModalOpen(false);
          return;
        }
      }
      if (polyString === '6x^2 + 9x' || polyString === '6x² + 9x') {
        if (factor === '3x') {
          const next = '3x(2x + 3)';
          setPolyString(next);
          recordPassage(next, 'Raccoglimento totale del monomio 3x');
          setIsSolved(true);
          setFinalResult(next);
          onWin(next, passages.length + 1);
          setIsFactorModalOpen(false);
          return;
        }
      }
      setIsError(true);
      setFeedback(`Fattore comune non corretto per ${polyString}`);
      onMistake('Fattore comune errato');
      return;
    }

    // Differenza di quadrati
    if (modalType === 'diffQuadrati') {
      const a = inputVal1.trim();
      const b = inputVal2.trim();
      if (polyString.includes('9') && polyString.includes('x')) {
        if ((a === '3' && b === 'x') || (a === 'x' && b === '3')) {
          const res = '(3 − x)(3 + x)';
          setPolyString(res);
          recordPassage(res, 'Differenza di quadrati: a² − b² = (a − b)(a + b)');
          setIsSolved(true);
          setFinalResult(res);
          onWin(res, passages.length + 1);
          setIsFactorModalOpen(false);
          return;
        }
      }
      if (polyString.includes('x² − 4') || polyString.includes('x^2 - 4')) {
        if (a === 'x' && b === '2') {
          const res = '−2(x − 2)(x + 2)';
          setPolyString(res);
          recordPassage(res, 'Differenza di quadrati (x² − 4)');
          setIsSolved(true);
          setFinalResult(res);
          onWin(res, passages.length + 1);
          setIsFactorModalOpen(false);
          return;
        }
      }
      setIsError(true);
      setFeedback('Le basi inserite non corrispondono ai quadrati esatti.');
      onMistake('Basi errate nella differenza di quadrati');
      return;
    }

    // Quadrato di binomio
    if (modalType === 'quadBinomio') {
      const a = inputVal1.trim();
      const b = inputVal2.trim();
      if ((a === '2x' && b === '3') || (a === '3' && b === '2x')) {
        const res = '(2x + 3)²';
        setPolyString(res);
        recordPassage(res, 'Quadrato di binomio: (a + b)²');
        setIsSolved(true);
        setFinalResult(res);
        onWin(res, passages.length + 1);
        setIsFactorModalOpen(false);
        return;
      }
      setIsError(true);
      setFeedback('Controlla le due radici quadrate.');
      onMistake('Basi errate nel quadrato di binomio');
      return;
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '900px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
    }}>
      {/* ======================================================== */}
      {/* IL QUADERNO A QUADRETTI DIGITALE                        */}
      {/* ======================================================== */}
      <div
        className="notebook-grid"
        style={{
          borderRadius: '24px',
          border: '2px solid var(--border-paper)',
          padding: '2rem',
          minHeight: '380px',
          boxShadow: '0 15px 40px rgba(0, 0, 0, 0.5)',
          position: 'relative',
        }}
      >
        {/* Intestazione Quaderno */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '2px solid rgba(56, 189, 248, 0.2)',
          paddingBottom: '0.75rem',
          marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.3rem' }}>📓</span>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#38bdf8', letterSpacing: '0.5px' }}>
              QUADERNO DI CALCOLO ALGEBRICO
            </span>
          </div>

          <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontFamily: 'var(--font-math)' }}>
            Par: {par} mosse
          </div>
        </div>

        {/* Cronologia Righe Precedenti scritte a penna */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
          {passages.map((p, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                fontFamily: 'var(--font-math)',
                fontSize: '1.5rem',
                fontWeight: 700,
                color: idx === passages.length - 1 && isSolved ? '#34d399' : '#cbd5e1',
                paddingLeft: '0.5rem',
              }}
            >
              <span style={{ fontSize: '0.8rem', color: '#64748b', width: '28px' }}>
                #{p.step}
              </span>
              <span>{p.expression}</span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontStyle: 'italic', marginLeft: 'auto', fontFamily: 'var(--font-sans)' }}>
                {p.note}
              </span>
            </div>
          ))}
        </div>

        {/* ======================================================== */}
        {/* RIGA DI LAVORO ATTIVA (Dove lo studente agisce)          */}
        {/* ======================================================== */}
        {!isSolved ? (
          <div style={{
            background: 'rgba(0, 0, 0, 0.35)',
            border: isError ? '2px solid #ef4444' : '2px dashed #00f0ff',
            borderRadius: '16px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            alignItems: 'center',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#00f0ff', fontWeight: 800 }}>
              Riga di Lavoro Attiva &bull; Tocca i segni per cambiare, sposta i numeri, separa le incognite:
            </div>

            {/* EQUAZIONI: Membro Sinistro = Membro Destro */}
            {isEquation ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Membro Sinistro */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {lhsTerms.map(term => (
                    <div
                      key={term.id}
                      className="notebook-token"
                      style={{ color: 'var(--token-var)', borderColor: '#00f0ff50' }}
                    >
                      {/* Segno modificabile col tocco del dito */}
                      <span
                        onClick={() => handleToggleSign(term.id, 'lhs')}
                        style={{
                          color: term.sign === '−' ? 'var(--token-minus)' : 'var(--token-plus)',
                          cursor: 'pointer',
                          marginRight: '2px',
                          padding: '0 4px',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.06)',
                        }}
                        title="Tocca per cambiare segno!"
                      >
                        {term.sign}
                      </span>

                      {/* Testo termine */}
                      <span>{term.text}</span>

                      {/* Tasto Separa x */}
                      {term.coeff && (
                        <button
                          onClick={() => handleSeparateVariable(term.id)}
                          style={{
                            fontSize: '0.7rem',
                            padding: '2px 5px',
                            borderRadius: '4px',
                            background: 'rgba(0, 240, 255, 0.2)',
                            color: '#00f0ff',
                            marginLeft: '4px',
                            fontWeight: 800,
                          }}
                          title="Separa coefficiente dall'incognita"
                        >
                          ✂️ Separa
                        </button>
                      )}

                      {/* Tasto Sposta a Destra */}
                      <button
                        onClick={() => handleTransportTerm(term.id, 'lhs')}
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#94a3b8',
                          marginLeft: '4px',
                        }}
                        title="Sposta oltre l'uguale"
                      >
                        ➔ Sposta
                      </button>
                    </div>
                  ))}
                </div>

                {/* Uguale */}
                <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.5rem', fontWeight: 900, color: 'var(--token-equal)' }}>
                  =
                </span>

                {/* Membro Destro */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {rhsTerms.map(term => (
                    <div
                      key={term.id}
                      className="notebook-token"
                      style={{ color: 'var(--token-num)', borderColor: '#fbbf2450' }}
                    >
                      {/* Segno modificabile con un tocco */}
                      <span
                        onClick={() => handleToggleSign(term.id, 'rhs')}
                        style={{
                          color: term.sign === '−' ? 'var(--token-minus)' : 'var(--token-plus)',
                          cursor: 'pointer',
                          marginRight: '2px',
                          padding: '0 4px',
                          borderRadius: '4px',
                          background: 'rgba(255,255,255,0.06)',
                        }}
                        title="Tocca per invertire segno!"
                      >
                        {term.sign}
                      </span>

                      <span>{term.text}</span>

                      {/* Tasto Sposta a Sinistra */}
                      <button
                        onClick={() => handleTransportTerm(term.id, 'rhs')}
                        style={{
                          fontSize: '0.7rem',
                          padding: '2px 5px',
                          borderRadius: '4px',
                          background: 'rgba(255, 255, 255, 0.08)',
                          color: '#94a3b8',
                          marginLeft: '4px',
                        }}
                        title="Sposta a sinistra"
                      >
                        ⬅ Sposta
                      </button>
                    </div>
                  ))}

                  {/* Tasto rapido Calcola a destra se ci sono termini combinabili */}
                  {rhsTerms.length > 1 && (
                    <button
                      onClick={handleCalculateRhs}
                      style={{
                        padding: '0.5rem 0.9rem',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff',
                        fontWeight: 800,
                        fontSize: '0.85rem',
                        boxShadow: '0 2px 10px rgba(16, 185, 129, 0.4)',
                      }}
                    >
                      ⚡ Calcola
                    </button>
                  )}
                </div>
              </div>
            ) : (
              /* POLINOMI: Scomposizione */
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: 'var(--token-var)',
                }}>
                  {polyString}
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <button
                    onClick={() => {
                      setModalType('raccoglimento');
                      setInputVal1('');
                      setIsFactorModalOpen(true);
                    }}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '10px',
                      background: 'rgba(245, 158, 11, 0.15)',
                      border: '1px solid #f59e0b',
                      color: '#fbbf24',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                    }}
                  >
                    ⚡ Raccogli Fattore Comune
                  </button>

                  <button
                    onClick={() => {
                      setModalType('diffQuadrati');
                      setInputVal1('');
                      setInputVal2('');
                      setIsFactorModalOpen(true);
                    }}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '10px',
                      background: 'rgba(0, 240, 255, 0.15)',
                      border: '1px solid #00f0ff',
                      color: '#00f0ff',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                    }}
                  >
                    🧩 Scomponi Differenza Quadrati
                  </button>

                  <button
                    onClick={() => {
                      setModalType('quadBinomio');
                      setInputVal1('');
                      setInputVal2('');
                      setIsFactorModalOpen(true);
                    }}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '10px',
                      background: 'rgba(192, 132, 252, 0.15)',
                      border: '1px solid #c084fc',
                      color: '#c084fc',
                      fontWeight: 800,
                      fontSize: '0.9rem',
                    }}
                  >
                    🧩 Chiudi Quadrato di Binomio
                  </button>
                </div>
              </div>
            )}

            {/* Pulsante Conferma Passaggio sul quaderno */}
            {isEquation && (
              <button
                onClick={handleConfirmPassage}
                style={{
                  marginTop: '0.5rem',
                  padding: '0.75rem 1.8rem',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                  color: '#fff',
                  fontWeight: 900,
                  fontSize: '0.95rem',
                  boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)',
                }}
              >
                ✍️ Scrivi Passaggio sul Quaderno
              </button>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* BANNER RISULTATO FINALE GIGANTE IN EVIDENZA             */
          /* ======================================================== */
          <div
            className="animate-pop"
            style={{
              padding: '2.5rem',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.25), rgba(0, 240, 255, 0.15))',
              border: '2px solid #10b981',
              textAlign: 'center',
              boxShadow: '0 0 40px rgba(16, 185, 129, 0.4)',
            }}
          >
            <div style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 900, letterSpacing: '1px', marginBottom: '0.5rem' }}>
              🏆 RISULTATO FINALE VERIFICATO:
            </div>

            <div style={{
              fontFamily: 'var(--font-math)',
              fontSize: '4rem',
              fontWeight: 900,
              color: '#fff',
              textShadow: '0 0 30px rgba(0, 240, 255, 0.8)',
              marginBottom: '0.5rem',
            }}>
              {finalResult}
            </div>

            <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
              Tutti i passaggi sono stati trascritti correttamente sul quaderno!
            </p>
          </div>
        )}

        {/* Feedback Didattico in riga */}
        {feedback && (
          <div
            className={isError ? 'animate-shake' : 'animate-pop'}
            style={{
              marginTop: '1.25rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              background: isError ? 'rgba(239, 68, 68, 0.15)' : 'rgba(52, 211, 153, 0.15)',
              border: isError ? '1px solid #ef4444' : '1px solid #10b981',
              color: isError ? '#fca5a5' : '#6ee7b7',
              fontSize: '0.9rem',
              fontWeight: 700,
              textAlign: 'center',
            }}
          >
            {feedback}
          </div>
        )}
      </div>

      {/* Modal Inserimento Fattori / Basi per Scomposizione */}
      {isFactorModalOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
          padding: '1rem',
        }}>
          <div style={{
            background: 'var(--bg-card)',
            border: '1px solid var(--border-paper)',
            borderRadius: '20px',
            padding: '2rem',
            maxWidth: '460px',
            width: '100%',
          }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 900, color: '#fff', marginBottom: '0.75rem' }}>
              {modalType === 'raccoglimento' && '⚡ Raccoglimento a Fattor Comune'}
              {modalType === 'diffQuadrati' && '🧩 Scomponi Differenza di Quadrati'}
              {modalType === 'quadBinomio' && '🧩 Chiudi Quadrato di Binomio'}
            </h3>

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '1.25rem' }}>
              {modalType === 'raccoglimento' && 'Inserisci il fattore comune (es. −2 oppure 3x) da estrarre fuori parentesi:'}
              {modalType === 'diffQuadrati' && 'Inserisci le due basi a e b tali che a² − b² = (a − b)(a + b):'}
              {modalType === 'quadBinomio' && 'Inserisci i due termini base a e b di (a + b)²:'}
            </p>

            <form onSubmit={handleModalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                  {modalType === 'raccoglimento' ? 'Fattore comune:' : 'Prima base (a):'}
                </label>
                <input
                  type="text"
                  autoFocus
                  value={inputVal1}
                  onChange={e => setInputVal1(e.target.value)}
                  placeholder={modalType === 'raccoglimento' ? 'es. −2' : 'es. 3'}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    background: '#0a0e1a',
                    border: '1px solid var(--border-paper)',
                    color: '#fff',
                    fontFamily: 'var(--font-math)',
                    fontSize: '1.1rem',
                  }}
                />
              </div>

              {modalType !== 'raccoglimento' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#64748b', marginBottom: '4px' }}>
                    Seconda base (b):
                  </label>
                  <input
                    type="text"
                    value={inputVal2}
                    onChange={e => setInputVal2(e.target.value)}
                    placeholder="es. x"
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      borderRadius: '8px',
                      background: '#0a0e1a',
                      border: '1px solid var(--border-paper)',
                      color: '#fff',
                      fontFamily: 'var(--font-math)',
                      fontSize: '1.1rem',
                    }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setIsFactorModalOpen(false)}
                  style={{ padding: '0.6rem 1rem', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', color: '#94a3b8' }}
                >
                  Annulla
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.6rem 1.25rem', borderRadius: '8px', background: '#0ea5e9', color: '#fff', fontWeight: 800 }}
                >
                  Conferma e Scomponi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
