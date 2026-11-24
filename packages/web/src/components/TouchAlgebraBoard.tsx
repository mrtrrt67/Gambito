import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SubType } from '../types';
import {
  arePolynomialsEquivalent,
  isFullyFactored,
  verifyEquationStep,
  isExactSquareOfBinomial,
  isExactCubeOfBinomial,
  isExactSquareOfTrinomial,
  isExactCubeOfTrinomial,
} from '../utils/mathChecker';

interface TouchAlgebraBoardProps {
  initialTitle: string;
  category: 'Equazione' | 'Scomposizione';
  par: number;
  onWin: (finalExpr: string, movesCount: number) => void;
  onMistake: (msg: string) => void;
  onMoveAction: () => void;
  subType?: SubType;
  metadata?: any;
  onOpenHint?: () => void;
}

export const TouchAlgebraBoard: React.FC<TouchAlgebraBoardProps> = ({
  initialTitle,
  category,
  par,
  onWin,
  onMistake,
  onMoveAction,
  subType,
  metadata,
  onOpenHint,
}) => {
  // L'espressione pulita di partenza (es. "3x³ − 4x² − 9x + 12" o "2x + 6 = 14")
  const cleanOriginalExpr = initialTitle.replace(/^.*:\s*/, '').trim();
  const isEquation = category === 'Equazione' || cleanOriginalExpr.includes('=');

  // Cronologia dei passaggi convalidati sul quaderno (inizia con l'esercizio dato)
  const [history, setHistory] = useState<string[]>([cleanOriginalExpr]);

  // Riga di scrittura attiva del ragazzo (ciò che sta componendo ora sul foglio)
  const [currentWriting, setCurrentWriting] = useState<string>('');

  // Stato feedback e animazioni
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSuccessStep, setIsSuccessStep] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [finalResultStr, setFinalResultStr] = useState<string>('');

  // Drag and drop per trascinare tessere dal pannello sulla riga di scrittura
  const [isDraggingOverLine, setIsDraggingOverLine] = useState(false);
  const writingLineRef = useRef<HTMLDivElement>(null);

  // Reset del quaderno quando cambia l'esercizio
  useEffect(() => {
    setHistory([cleanOriginalExpr]);
    setCurrentWriting('');
    setFeedback(null);
    setIsError(false);
    setIsSuccessStep(false);
    setIsSolved(false);
    setFinalResultStr('');
  }, [cleanOriginalExpr]);

  // Inserimento simbolo o pezzetto matematico
  const insertSymbol = useCallback((sym: string) => {
    onMoveAction();
    setCurrentWriting(prev => {
      // Se l'utente digita un numero subito dopo '^', trasformiamo in esponente
      if (prev.endsWith('^')) {
        const expMap: Record<string, string> = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
          '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
        };
        if (expMap[sym]) {
          return prev.slice(0, -1) + expMap[sym];
        }
      }
      return prev + sym;
    });
    setFeedback(null);
    setIsError(false);
  }, [onMoveAction]);

  // Cancellazione dell'ultimo simbolo (Backspace)
  const handleBackspace = useCallback(() => {
    setCurrentWriting(prev => {
      if (!prev) return '';
      // Gestione cancellazione token di 2 caratteri come x², x³, x⁴, y²
      if (prev.endsWith('x²') || prev.endsWith('x³') || prev.endsWith('x⁴') || prev.endsWith('y²')) {
        return prev.slice(0, -2);
      }
      return prev.slice(0, -1);
    });
    setFeedback(null);
    setIsError(false);
  }, []);

  // Svuota l'intera riga corrente
  const handleClearLine = useCallback(() => {
    setCurrentWriting('');
    setFeedback(null);
    setIsError(false);
  }, []);

  // Tessere rapide contestuali (suggerite per velocizzare la scrittura, cliccabili o trascinabili)
  const getQuickChips = (): string[] => {
    const list: string[] = [];
    if (metadata?.chips && Array.isArray(metadata.chips)) {
      list.push(...metadata.chips);
    }
    if (metadata?.d1 && metadata?.d2) {
      list.push(metadata.d1, metadata.d2);
    }
    if (metadata?.mcd1 && metadata?.quot1) {
      list.push(metadata.mcd1, `(${metadata.quot1})`);
    }
    if (metadata?.finalCommon && metadata?.finalOther) {
      list.push(`(${metadata.finalCommon})`, `(${metadata.finalOther})`);
    }
    // Rimuove duplicati e valori vuoti
    return Array.from(new Set(list.filter(Boolean)));
  };

  const quickChips = getQuickChips();

  // Verifica del passaggio matematico scritto dal ragazzo
  const handleVerifyStep = () => {
    const written = currentWriting.trim();
    if (!written) {
      setIsError(true);
      setFeedback('⚠️ Scrivi il tuo passaggio sul quaderno prima di verificare!');
      return;
    }

    // =========================================================================
    // 1. VERIFICA EQUAZIONE DI PRIMO GRADO
    // =========================================================================
    if (isEquation) {
      if (!written.includes('=')) {
        setIsError(true);
        onMistake('Equazione incompleta: manca il segno =');
        setFeedback('⚠️ Un\'equazione deve contenere il segno = (es. 2x = 8 oppure x = 4)');
        return;
      }

      const check = verifyEquationStep(written, cleanOriginalExpr);
      if (!check.isEquivalent) {
        setIsError(true);
        onMistake('Passaggio equazione errato');
        setFeedback('⚠️ Questo passaggio non è equivalente: controlla i segni del trasporto o i calcoli!');
        return;
      }

      // Se ha isolato la soluzione finale (es. x = 4)
      if (check.isSolved) {
        onMoveAction();
        setHistory(h => [...h, written]);
        setIsSolved(true);
        setFinalResultStr(written);
        setIsError(false);
        setFeedback(`🏆 Equazione risolta con successo: ${written}!`);
        onWin(written, history.length);
        return;
      }

      // Passaggio intermedio corretto (es. 2x = 14 - 6 o 2x = 8)
      onMoveAction();
      setHistory(h => [...h, written]);
      setCurrentWriting('');
      setIsError(false);
      setIsSuccessStep(true);
      setFeedback('✨ Ottimo passaggio! Continua per ricavare il valore di x.');
      setTimeout(() => setIsSuccessStep(false), 2500);
      return;
    }

    // =========================================================================
    // 2. VERIFICA SCOMPOSIZIONE DI POLINOMI (2, 3, 4, 5 TERMINI)
    // =========================================================================
    // Verifica equivalenza algebrica con il polinomio originale
    const isEquiv = arePolynomialsEquivalent(written, cleanOriginalExpr);
    if (!isEquiv) {
      setIsError(true);
      onMistake('Calcolo o segno errato nella scomposizione');
      setFeedback('⚠️ I calcoli o i segni non tornano: controlla con attenzione ogni termine.');
      return;
    }

    // Identificazione didattica: è un Quadrato/Cubo di Binomio o Quadrato/Cubo di Trinomio?
    const isSquareOfBinomial =
      subType === 'square_binomial' ||
      /quadrato\s+di\s+binomio/i.test(initialTitle) ||
      /quadrato\s+di\s+binomio/i.test(metadata?.title || '') ||
      isExactSquareOfBinomial(cleanOriginalExpr);

    const isCubeOfBinomial =
      subType === 'cube_binomial' ||
      /cubo\s+di\s+binomio/i.test(initialTitle) ||
      /cubo\s+di\s+binomio/i.test(metadata?.title || '') ||
      isExactCubeOfBinomial(cleanOriginalExpr);

    const isSquareOfTrinomial =
      subType === 'square_trinomial' ||
      /quadrato\s+di\s+trinomio/i.test(initialTitle) ||
      /quadrato\s+di\s+trinomio/i.test(metadata?.title || '');

    const isCubeOfTrinomial =
      subType === 'cube_trinomial' ||
      /cubo\s+di\s+trinomio/i.test(initialTitle) ||
      /cubo\s+di\s+trinomio/i.test(metadata?.title || '');

    // Se l'esercizio è un Quadrato di Binomio: la scomposizione parziale è ERRATA!
    if (isSquareOfBinomial) {
      const isSquarePower = /\)[²2]/.test(written) || /\)\^2/.test(written);
      if (!isSquarePower) {
        setIsError(true);
        onMistake('Scomposizione parziale non consentita: è un Quadrato di Binomio (A ± B)²');
        setFeedback('⚠️ Scomposizione parziale errata! Questo trinomio è un Quadrato di Binomio: individua i due quadrati e il doppio prodotto, e scrivi direttamente la forma (A ± B)². Non applicare raccoglimenti parziali!');
        return;
      }
    }

    // Se l'esercizio è un Cubo di Binomio: la scomposizione parziale è ERRATA!
    if (isCubeOfBinomial) {
      const isCubePower = /\)[³3]/.test(written) || /\)\^3/.test(written);
      if (!isCubePower) {
        setIsError(true);
        onMistake('Scomposizione parziale non consentita: è un Cubo di Binomio (A ± B)³');
        setFeedback('⚠️ Scomposizione parziale errata! Questo quadrinomio è un Cubo di Binomio: individua i due cubi estremi A³ e B³ e verifica i tripli prodotti. Scrivi direttamente la forma (A ± B)³ senza tentare raccoglimenti parziali!');
        return;
      }
    }

    // Se l'esercizio è un Quadrato di Trinomio: la scomposizione parziale è ERRATA!
    if (isSquareOfTrinomial) {
      const isSquarePower = /\)[²2]/.test(written) || /\)\^2/.test(written);
      if (!isSquarePower) {
        setIsError(true);
        onMistake('Scomposizione parziale non consentita: è un Quadrato di Trinomio (A ± B ± C)²');
        setFeedback('⚠️ Scomposizione parziale errata! Questo polinomio a 6 termini è un Quadrato di Trinomio: individua i tre quadrati (A², B², C²) e i tre doppi prodotti, e scrivi direttamente la forma (A ± B ± C)². Non applicare raccoglimenti parziali!');
        return;
      }
    }

    // Se l'esercizio è un Cubo di Trinomio: la scomposizione parziale è ERRATA!
    if (isCubeOfTrinomial) {
      const isCubePower = /\)[³3]/.test(written) || /\)\^3/.test(written);
      if (!isCubePower) {
        setIsError(true);
        onMistake('Scomposizione parziale non consentita: è un Cubo di Trinomio (A ± B ± C)³');
        setFeedback('⚠️ Scomposizione parziale errata! Questo polinomio è un Cubo di Trinomio: individua i cubi fondamentali e scrivi direttamente la forma (A ± B ± C)³. Non applicare raccoglimenti parziali!');
        return;
      }
    }

    // Se è algebricamente equivalente, controlliamo se è completamente fattorizzata
    const isFactored = isFullyFactored(written);

    if (isFactored) {
      // Scomposizione finale completa raggiunta!
      onMoveAction();
      setHistory(h => [...h, written]);
      setIsSolved(true);
      setFinalResultStr(written);
      setIsError(false);
      setFeedback(`🏆 Polinomio scomposto perfettamente: ${written}!`);
      onWin(written, history.length);
    } else {
      // Passaggio intermedio valido (es. raccoglimento a fattor comune 2(x² + 5x + 6) o parziale x²(3x − 4) − 3(3x − 4))
      onMoveAction();
      setHistory(h => [...h, written]);
      setCurrentWriting('');
      setIsError(false);
      setIsSuccessStep(true);
      if (written.includes('(')) {
        setFeedback('✨ Ottimo passaggio! Il calcolo è corretto, ma la scomposizione non è ancora completa: continua a scomporre il fattore tra parentesi!');
      } else {
        setFeedback('✨ Bravissimo! Passaggio corretto. Ora completa raccogliendo il fattore comune!');
      }
      setTimeout(() => setIsSuccessStep(false), 3500);
    }
  };

  // Supporto tastiera fisica (quando il ragazzo usa PC o tablet con tastiera)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isSolved) return;
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleVerifyStep();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClearLine();
      } else if (/^[0-9xyzabc+\-=/()^²³⁴⁵]$/i.test(e.key)) {
        e.preventDefault();
        const sym = e.key === '-' ? '−' : e.key.toLowerCase();
        insertSymbol(sym);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleBackspace, handleClearLine, insertSymbol, isSolved, currentWriting]);

  // Drag & drop da palette
  const handleDragStart = (e: React.DragEvent, text: string) => {
    e.dataTransfer.setData('text/plain', text);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverLine(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOverLine(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverLine(false);
    const data = e.dataTransfer.getData('text/plain');
    if (data) {
      insertSymbol(data);
    }
  };

  return (
    <div style={{
      width: '100%',
      maxWidth: '880px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      userSelect: 'none',
    }}>
      {/* ===================================================================== */}
      {/* IL FOGLIO A QUADRETTI (IL VERO QUADERNO SCOLASTICO)                   */}
      {/* ===================================================================== */}
      <div
        className="notebook-grid"
        style={{
          borderRadius: '24px',
          border: '2px solid rgba(56, 189, 248, 0.3)',
          padding: '1.75rem 1.5rem',
          position: 'relative',
          boxShadow: '0 12px 40px rgba(0, 0, 0, 0.45)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        {/* Margine rosso del quaderno di scuola sulla sinistra */}
        <div style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '52px',
          width: '2px',
          background: 'rgba(239, 68, 68, 0.35)',
          zIndex: 1,
        }} />

        {/* Intestazione del Foglio */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px',
          paddingBottom: '0.9rem',
          borderBottom: '1.5px solid rgba(56, 189, 248, 0.2)',
          zIndex: 2,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.3rem' }}>📓</span>
            <span style={{
              fontWeight: 900,
              fontSize: '1.1rem',
              color: '#38bdf8',
              letterSpacing: '0.4px',
              fontFamily: 'var(--font-sans)',
            }}>
              {isEquation ? 'Equazioni di 1° Grado' : 'Scomposizione di Polinomi'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ fontSize: '0.9rem', color: '#94a3b8', fontFamily: 'var(--font-math)' }}>
              Obiettivo: <strong style={{ color: '#fbbf24', fontSize: '1.05rem' }}>{par}</strong> mosse
            </div>

            {/* Pulsante AIUTO DISCRETO: solo su richiesta esplicita, zero spoiler! */}
            {onOpenHint && (
              <button
                type="button"
                onClick={onOpenHint}
                title="Chiedi un consiglio mirato se ti trovi in difficoltà"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '0.4rem 0.9rem',
                  borderRadius: '10px',
                  background: 'rgba(251, 191, 36, 0.12)',
                  border: '1.5px solid rgba(251, 191, 36, 0.45)',
                  color: '#fbbf24',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <span>💡</span>
                <span>Chiedi Aiuto</span>
              </button>
            )}
          </div>
        </div>

        {/* Righe del Quaderno di Calcolo */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1.1rem',
          paddingLeft: '48px', // spazio dopo il margine rosso
          zIndex: 2,
        }}>
          {/* Riga 1: L'esercizio di partenza */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Esercizio:
            </span>
            <div style={{
              fontSize: '2.5rem',
              fontFamily: 'var(--font-math)',
              fontWeight: 900,
              color: '#fff',
              whiteSpace: 'nowrap',
              overflowX: 'auto',
              maxWidth: '100%',
              lineHeight: 1.2,
            }}>
              {cleanOriginalExpr}
            </div>
          </div>

          {/* Passaggi precedenti convalidati con spunta verde */}
          {history.slice(1).map((step, idx) => (
            <div
              key={idx}
              className="animate-pop"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '2.2rem',
                fontFamily: 'var(--font-math)',
                fontWeight: 900,
                color: idx === history.length - 2 && isSolved ? '#00f0ff' : '#6ee7b7',
                whiteSpace: 'nowrap',
                overflowX: 'auto',
                maxWidth: '100%',
                paddingLeft: '0.5rem',
                borderLeft: '3px solid #10b981',
              }}
            >
              <span style={{ color: '#10b981', fontSize: '1.6rem' }}>✓</span>
              <span>{step}</span>
            </div>
          ))}

          {/* Riga di Scrittura Attiva (dove scrive il ragazzo) se non è ancora risolto */}
          {!isSolved && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.3rem' }}>
              <span style={{ fontSize: '0.8rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase' }}>
                ✍️ La tua scrittura sul quaderno:
              </span>

              <div
                ref={writingLineRef}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                style={{
                  minHeight: '68px',
                  padding: '0.6rem 1.25rem',
                  borderRadius: '16px',
                  background: isDraggingOverLine
                    ? 'rgba(0, 240, 255, 0.22)'
                    : 'rgba(10, 16, 32, 0.85)',
                  border: isDraggingOverLine
                    ? '2.5px dashed #00f0ff'
                    : (isError ? '2px solid #ef4444' : '2px solid rgba(56, 189, 248, 0.5)'),
                  boxShadow: isDraggingOverLine
                    ? '0 0 25px rgba(0, 240, 255, 0.5)'
                    : 'inset 0 2px 10px rgba(0, 0, 0, 0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontFamily: 'var(--font-math)',
                  fontSize: '2.5rem',
                  fontWeight: 900,
                  color: '#00f0ff',
                  whiteSpace: 'nowrap',
                  overflowX: 'auto',
                  maxWidth: '100%',
                  transition: 'all 0.15s ease',
                }}
              >
                {currentWriting ? (
                  <>
                    <span>{currentWriting}</span>
                    <span style={{
                      display: 'inline-block',
                      width: '3px',
                      height: '2.2rem',
                      background: '#00f0ff',
                      marginLeft: '4px',
                      animation: 'pulse 1s infinite',
                    }} />
                  </>
                ) : (
                  <span style={{
                    color: 'rgba(148, 163, 184, 0.45)',
                    fontSize: '1.25rem',
                    fontStyle: 'italic',
                    fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                  }}>
                    Tocca i simboli in basso o trascina qui per scrivere il passaggio...
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Feedback Messaggio */}
          {feedback && (
            <div
              className={isError ? 'animate-shake' : 'animate-pop'}
              style={{
                padding: '0.75rem 1.25rem',
                borderRadius: '12px',
                background: isError ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                border: isError ? '1.5px solid #ef4444' : '1.5px solid #10b981',
                color: isError ? '#fecaca' : '#a7f3d0',
                fontSize: '1rem',
                fontWeight: 800,
                textAlign: 'center',
              }}
            >
              {feedback}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* CASSETTA DEGLI ATTREZZI IN BASSO (PANNELLO TESSERE & SIMBOLI)         */}
      {/* ===================================================================== */}
      {!isSolved && (
        <div style={{
          background: 'rgba(10, 15, 30, 0.95)',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '22px',
          padding: '1.2rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        }}>
          {/* Fila Tessere Rapide Contestuali (se presenti) */}
          {quickChips.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase' }}>
                ⭐ Tessere Rapide:
              </span>
              {quickChips.map((chip, idx) => (
                <div
                  key={idx}
                  draggable
                  onDragStart={e => handleDragStart(e, chip)}
                  onClick={() => insertSymbol(chip)}
                  className="notebook-token"
                  style={{
                    padding: '0.4rem 0.85rem',
                    fontSize: '1.35rem',
                    color: '#fbbf24',
                    background: 'rgba(251, 191, 36, 0.1)',
                    border: '1.5px solid #fbbf24',
                    borderRadius: '10px',
                    cursor: 'grab',
                    fontWeight: 900,
                    fontFamily: 'var(--font-math)',
                  }}
                >
                  {chip}
                </div>
              ))}
            </div>
          )}

          {/* Fila 1: Numeri da 0 a 9 */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(num => (
              <button
                key={num}
                type="button"
                draggable
                onDragStart={e => handleDragStart(e, num)}
                onClick={() => insertSymbol(num)}
                style={{
                  minWidth: '42px',
                  height: '42px',
                  padding: '0 0.5rem',
                  borderRadius: '10px',
                  background: 'rgba(251, 191, 36, 0.08)',
                  border: '1.5px solid rgba(251, 191, 36, 0.35)',
                  color: '#fbbf24',
                  fontFamily: 'var(--font-math)',
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  transition: 'all 0.1s ease',
                }}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Fila 2: Esponenti & Potenze (In Evidenza) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            flexWrap: 'wrap',
            background: 'rgba(168, 85, 247, 0.08)',
            border: '1px solid rgba(168, 85, 247, 0.25)',
            borderRadius: '14px',
            padding: '0.45rem 0.75rem',
          }}>
            <span style={{
              fontSize: '0.8rem',
              color: '#c084fc',
              fontWeight: 900,
              letterSpacing: '0.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              marginRight: '2px',
            }}>
              <span>⚡</span> ESPONENTI:
            </span>

            {/* Esponenti Puri (da applicare a parentesi, lettere o numeri) */}
            {[
              { sym: '²', label: '²', title: 'Esponente 2 (Quadrato)' },
              { sym: '³', label: '³', title: 'Esponente 3 (Cubo)' },
              { sym: '⁴', label: '⁴', title: 'Esponente 4' },
              { sym: '⁵', label: '⁵', title: 'Esponente 5' },
              { sym: '^', label: 'xⁿ', title: 'Esponente (^)' },
            ].map(item => (
              <button
                key={item.sym}
                type="button"
                draggable
                onDragStart={e => handleDragStart(e, item.sym)}
                onClick={() => insertSymbol(item.sym)}
                title={item.title}
                style={{
                  minWidth: '44px',
                  height: '42px',
                  padding: '0 0.55rem',
                  borderRadius: '10px',
                  background: 'rgba(168, 85, 247, 0.18)',
                  border: '1.5px solid #c084fc',
                  color: '#e9d5ff',
                  fontFamily: 'var(--font-math)',
                  fontSize: item.sym === '^' ? '1.1rem' : '1.5rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  boxShadow: '0 2px 8px rgba(168, 85, 247, 0.2)',
                  transition: 'all 0.15s ease',
                }}
              >
                {item.label}
              </button>
            ))}

            {/* Divisore sottile */}
            <div style={{ width: '1px', height: '28px', background: 'rgba(168, 85, 247, 0.3)', margin: '0 4px' }} />

            {/* Scorciatoie potenze con variabile */}
            {[
              { sym: 'x²', label: 'x²' },
              { sym: 'x³', label: 'x³' },
              { sym: 'x⁴', label: 'x⁴' },
              { sym: 'y²', label: 'y²' },
            ].map(p => (
              <button
                key={p.sym}
                type="button"
                draggable
                onDragStart={e => handleDragStart(e, p.sym)}
                onClick={() => insertSymbol(p.sym)}
                style={{
                  minWidth: '44px',
                  height: '42px',
                  padding: '0 0.55rem',
                  borderRadius: '10px',
                  background: 'rgba(0, 240, 255, 0.1)',
                  border: '1.5px solid rgba(0, 240, 255, 0.45)',
                  color: '#00f0ff',
                  fontFamily: 'var(--font-math)',
                  fontSize: '1.3rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Fila 3: Variabili, Segni, Parentesi & Controlli */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['x', 'y', 'z', 'a', 'b', 'c'].map(v => (
              <button
                key={v}
                type="button"
                draggable
                onDragStart={e => handleDragStart(e, v)}
                onClick={() => insertSymbol(v)}
                style={{
                  minWidth: '40px',
                  height: '42px',
                  padding: '0 0.5rem',
                  borderRadius: '10px',
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1.5px solid rgba(0, 240, 255, 0.35)',
                  color: '#00f0ff',
                  fontFamily: 'var(--font-math)',
                  fontSize: '1.3rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {v}
              </button>
            ))}

            {['+', '−', '='].map(s => (
              <button
                key={s}
                type="button"
                draggable
                onDragStart={e => handleDragStart(e, s)}
                onClick={() => insertSymbol(s)}
                style={{
                  minWidth: '42px',
                  height: '42px',
                  padding: '0 0.5rem',
                  borderRadius: '10px',
                  background: s === '=' ? 'rgba(192, 132, 252, 0.12)' : 'rgba(248, 113, 113, 0.1)',
                  border: s === '=' ? '1.5px solid #c084fc' : '1.5px solid rgba(248, 113, 113, 0.4)',
                  color: s === '=' ? '#c084fc' : '#f87171',
                  fontFamily: 'var(--font-math)',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                }}
              >
                {s}
              </button>
            ))}

            {['(', ')', '/'].map(p => (
              <button
                key={p}
                type="button"
                draggable
                onDragStart={e => handleDragStart(e, p)}
                onClick={() => insertSymbol(p)}
                style={{
                  minWidth: '40px',
                  height: '42px',
                  borderRadius: '10px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1.5px solid rgba(255, 255, 255, 0.2)',
                  color: '#e2e8f0',
                  fontFamily: 'var(--font-math)',
                  fontSize: '1.3rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}

            <button
              type="button"
              onClick={handleBackspace}
              style={{
                height: '42px',
                padding: '0 0.85rem',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1.5px solid rgba(239, 68, 68, 0.45)',
                color: '#f87171',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ⌫ Canc
            </button>

            <button
              type="button"
              onClick={handleClearLine}
              style={{
                height: '42px',
                padding: '0 0.85rem',
                borderRadius: '10px',
                background: 'rgba(148, 163, 184, 0.1)',
                border: '1.5px solid rgba(148, 163, 184, 0.3)',
                color: '#94a3b8',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              C Svuota
            </button>
          </div>

          {/* Pulsante Grande di Verifica Passaggio */}
          <button
            type="button"
            onClick={handleVerifyStep}
            style={{
              marginTop: '0.5rem',
              width: '100%',
              padding: '0.95rem',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              border: 'none',
              color: '#fff',
              fontSize: '1.25rem',
              fontWeight: 900,
              cursor: 'pointer',
              boxShadow: '0 0 25px rgba(16, 185, 129, 0.45)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              transition: 'all 0.15s ease',
            }}
          >
            <span>✓</span>
            <span>Verifica Passaggio</span>
          </button>
        </div>
      )}

      {/* Box di Vittoria sul Foglio */}
      {isSolved && (
        <div
          className="animate-pop glow-win"
          style={{
            padding: '2.5rem 2rem',
            borderRadius: '24px',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(0, 240, 255, 0.2))',
            border: '2.5px solid #10b981',
            textAlign: 'center',
            boxShadow: '0 0 50px rgba(16, 185, 129, 0.4)',
          }}
        >
          <div style={{ fontSize: '1.1rem', textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 900, letterSpacing: '2px', marginBottom: '0.5rem' }}>
            🏆 RISULTATO FINALE SCOMPOSTO:
          </div>
          <div style={{
            fontFamily: 'var(--font-math)',
            fontSize: 'clamp(2rem, 6vw, 3.5rem)',
            fontWeight: 900,
            color: '#fff',
            textShadow: '0 0 40px rgba(0, 240, 255, 0.95)',
            marginBottom: '0.5rem',
            whiteSpace: 'nowrap',
            overflowX: 'auto',
            maxWidth: '100%',
          }}>
            {finalResultStr}
          </div>
          <p style={{ color: '#e2e8f0', fontSize: '1.15rem', fontWeight: 600 }}>
            Passaggi verificati e completati con successo sul quaderno!
          </p>
        </div>
      )}
    </div>
  );
};
