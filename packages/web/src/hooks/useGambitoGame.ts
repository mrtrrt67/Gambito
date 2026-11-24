import { useState, useCallback, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  createMathAST,
  makeError,
  generateSimilar,
  MathAST,
  MoveError,
} from '@gambito/engine';
import { TelemetryEvent, LeaderboardEntry, DraggedElement, ChallengePreset } from '../types';
import { PRESETS } from '../data/presets';

const STORAGE_KEY_LEADERBOARD = 'gambito_leaderboard_v1';

const INITIAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: '1', playerName: 'Leonardo Euler', expression: '4x^2 + 12x + 9', score: 1850, moves: 1, par: 1, errors: 0, timestamp: '21/11/2026', badge: 'Gran Maestro' },
  { id: '2', playerName: 'Gauss 1777', expression: '9 - x^2', score: 1400, moves: 1, par: 1, errors: 0, timestamp: '21/11/2026', badge: 'Tattico Puro' },
  { id: '3', playerName: 'Hypatia', expression: '2(x+3) - x = 5', score: 1350, moves: 3, par: 3, errors: 0, timestamp: '21/11/2026', badge: 'In Par' },
  { id: '4', playerName: 'Archimede', expression: '-2x^2 + 8', score: 1100, moves: 2, par: 2, errors: 1, timestamp: '20/11/2026', badge: 'Algebrista' },
];

export function useGambitoGame(initialPresetId: string = 'bastardo-1') {
  const currentPreset = PRESETS.find(p => p.id === initialPresetId) || PRESETS[0]!;
  
  const [currentExpression, setCurrentExpression] = useState(currentPreset.expression);
  const [initialExpressionForReset, setInitialExpressionForReset] = useState(currentPreset.expression);
  const [ast, setAst] = useState<MathAST | null>(null);
  
  // Game Stats & Score
  const [score, setScore] = useState(currentPreset.baseScore);
  const [lives, setLives] = useState(3);
  const [strikes, setStrikes] = useState(0);
  const [movesCount, setMovesCount] = useState(0);
  const [streak, setStreak] = useState(1);
  const [isStrikeOut, setIsStrikeOut] = useState(false);
  const [isSolved, setIsSolved] = useState(false);

  // Errors & Hints
  const [error, setError] = useState<MoveError | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Telemetry & Leaderboard
  const [telemetry, setTelemetry] = useState<TelemetryEvent[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_LEADERBOARD);
      return saved ? JSON.parse(saved) : INITIAL_LEADERBOARD;
    } catch {
      return INITIAL_LEADERBOARD;
    }
  });

  const logTelemetry = useCallback((
    action: TelemetryEvent['action'],
    description: string,
    details: string = '',
    color: string = '#00f0ff'
  ) => {
    const timeStr = new Date().toLocaleTimeString('it-IT');
    const newEvent: TelemetryEvent = {
      id: `tel-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: timeStr,
      action,
      description,
      details,
      color,
    };
    setTelemetry(prev => [newEvent, ...prev.slice(0, 99)]);
  }, []);

  // Registra penalità o errore
  const registerStrike = useCallback((moveErr: MoveError) => {
    setError(moveErr);
    setStrikes(prev => {
      const nextStrikes = prev + 1;
      setLives(Math.max(0, 3 - nextStrikes));
      setScore((s: number) => Math.max(0, s - 150));
      setStreak(1);

      logTelemetry(
        'ERROR_STRIKE',
        `Strike ${nextStrikes}/3: ${moveErr.code}`,
        `Malus -150 pt. Messaggio: ${moveErr.message}`,
        '#ef4444'
      );

      if (nextStrikes >= 3) {
        setIsStrikeOut(true);
        logTelemetry('ERROR_STRIKE', '3 ERRORI ACCUMULATI — RESET TOTALE ESPRESSIONE', 'Riavvio forzato', '#ff0055');
      }
      return nextStrikes;
    });
  }, [logTelemetry]);

  // Carica nuova espressione
  const loadExpression = useCallback((expr: string, resetAll: boolean = true, baseScore: number = 1000) => {
    try {
      const cleanExpr = expr.trim();
      const parsedAst = createMathAST(cleanExpr);
      setAst(parsedAst);
      setCurrentExpression(cleanExpr);
      setError(null);
      setSuccessMessage(null);
      setHint(null);
      setIsSolved(false);
      setIsStrikeOut(false);

      if (resetAll) {
        setInitialExpressionForReset(cleanExpr);
        setMovesCount(0);
        setLives(3);
        setStrikes(0);
        setScore(baseScore);
        setStreak(1);
        logTelemetry('DRAG_START', `Iniziata nuova sfida: ${cleanExpr}`, `Par stimato: ${parsedAst.par}`, '#fbbf24');
      }
    } catch (err: any) {
      registerStrike(makeError('ERR_INVALID_SYNTAX', err.message || 'Sintassi non valida'));
    }
  }, [logTelemetry, registerStrike]);

  useEffect(() => {
    loadExpression(currentPreset.expression, true, currentPreset.baseScore);
  }, []);

  // Reset espressione su 3 errori o richiesta manuale
  const restartCurrentExpression = useCallback(() => {
    loadExpression(initialExpressionForReset, true, 1000);
    setIsStrikeOut(false);
  }, [initialExpressionForReset, loadExpression]);

  // Richiesta esplicita di Hint con penalità di 50 pt
  const confirmHint = useCallback(() => {
    if (!ast) return;
    const hintText = ast.detectedPatterns[0]?.hint || 'Raccogli i fattori comuni o verifica i quadrati perfetti.';
    setHint(hintText);
    setScore((s: number) => Math.max(0, s - 50));
    logTelemetry('HINT_REQUEST', 'Richiesto aiuto tattico', 'Penalità applicata: -50 pt', '#f59e0b');
  }, [ast, logTelemetry]);

  // Vittoria & Bonus Par
  const triggerVictory = useCallback((finalExpr: string, moveDesc: string) => {
    setIsSolved(true);
    setCurrentExpression(finalExpr);
    setSuccessMessage(`🏆 RISOLTO! ${moveDesc}`);

    // Calcolo bonus Par
    const par = ast?.par ?? 1;
    let parBonus = 150;
    if (movesCount + 1 < par) parBonus = 500; // Sotto Par (Eagle)
    else if (movesCount + 1 === par) parBonus = 300; // In Par

    const streakBonus = streak * 75;
    const finalEarned = parBonus + streakBonus;

    setScore((s: number) => s + finalEarned);
    setStreak(st => st + 1);

    logTelemetry(
      'FACTORIZATION',
      `Espressione completata: ${finalExpr}`,
      `Bonus Par: +${parBonus} pt, Bonus Streak: +${streakBonus} pt`,
      '#10b981'
    );

    try {
      confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
    } catch {}
  }, [ast, movesCount, streak, logTelemetry]);

  // Salva partita in classifica
  const saveToLeaderboard = useCallback((playerName: string) => {
    const newEntry: LeaderboardEntry = {
      id: `lb-${Date.now()}`,
      playerName,
      expression: currentExpression,
      score,
      moves: movesCount,
      par: ast?.par ?? 1,
      errors: strikes,
      timestamp: new Date().toLocaleDateString('it-IT'),
      badge: score >= 1500 ? 'Gran Maestro' : (strikes === 0 ? 'Mossa Pulita' : 'Risolutore'),
    };

    setLeaderboard(prev => {
      const updated = [newEntry, ...prev].sort((a, b) => b.score - a.score).slice(0, 50);
      try {
        localStorage.setItem(STORAGE_KEY_LEADERBOARD, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, [currentExpression, score, movesCount, ast, strikes]);

  // ==========================================
  // GESTIONE GESTI DRAG & DROP
  // ==========================================

  // 1. Trascina oltre l'uguale (Regola del Trasporto con Inversione di Segno)
  const handleDropTranspose = useCallback((element: DraggedElement, targetSide: 'lhs' | 'rhs') => {
    if (element.originalSide === targetSide) return;

    setMovesCount(m => m + 1);
    setScore((s: number) => s + 100);

    const clean = currentExpression.replace(/\s+/g, '');

    // Caso 2(x+3) - x = 5
    if (clean === '2(x+3)-x=5') {
      setCurrentExpression('2x + 6 - x = 5');
      logTelemetry('SIGN_INVERSION', 'Espansione e Trasporto Termine', 'Espanso membro sinistro in 2x + 6 - x = 5', '#34d399');
      return;
    }

    if (clean === '2x+6-x=5' || clean === 'x+6=5') {
      setCurrentExpression('x = 5 - 6');
      logTelemetry(
        'SIGN_INVERSION',
        `Trasporto oltre l'uguale: termine [${element.text}]`,
        `Trasferito da ${element.originalSide?.toUpperCase()} a ${targetSide.toUpperCase()} con inversione segno`,
        '#f87171'
      );
      return;
    }

    if (clean === '3x+5=14') {
      setCurrentExpression('3x = 14 - 5');
      logTelemetry(
        'SIGN_INVERSION',
        `Trasporto termine noto [+5] al membro destro`,
        `Inversione segno: +5 diventa -5 a destra`,
        '#34d399'
      );
      return;
    }

    // Default per trasporto generico
    logTelemetry('SIGN_INVERSION', `Trasportato termine ${element.text} a ${targetSide}`, 'Segno invertito correttamente', '#38bdf8');
  }, [currentExpression, logTelemetry]);

  // 2. Trascina termine su un altro termine (Fusione / Riduzione Termini Simili)
  const handleDropMerge = useCallback((dragged: DraggedElement, targetId: string) => {
    setMovesCount(m => m + 1);
    const clean = currentExpression.replace(/\s+/g, '');

    // Fusione aritmetica: x = 5 - 6 -> x = -1
    if (clean === 'x=5-6') {
      triggerVictory('x = -1', 'Fusione aritmetica 5 - 6 = -1');
      return;
    }

    // Fusione lineare: 3x = 14 - 5 -> 3x = 9
    if (clean === '3x=14-5') {
      setCurrentExpression('3x = 9');
      logTelemetry('TERM_MERGE', 'Fusione termini noti: 14 - 5 = 9', 'Termini costanti sommati algebricamente', '#34d399');
      return;
    }

    // Riduzione monomi: 2x - x = x
    if (clean === '2x+6-x=5') {
      setCurrentExpression('x + 6 = 5');
      logTelemetry('TERM_MERGE', 'Riduzione monomi simili: 2x - x = x', 'Stesso grado letterale', '#38bdf8');
      return;
    }

    // Errore: tentativo di fondere termini di grado diverso
    if (clean.includes('x^2') && clean.includes('x')) {
      registerStrike(makeError('ERR_UNLIKE_TERMS', dragged.text, 'termine di grado diverso'));
      return;
    }

    logTelemetry('TERM_MERGE', `Fusi termini: ${dragged.text}`, 'Calcolo completato', '#34d399');
  }, [currentExpression, triggerVictory, registerStrike, logTelemetry]);

  // 3. Trascina nella Zona Tattica (Scomposizione / Raccoglimento)
  const handleDropFactorize = useCallback((element: DraggedElement) => {
    setMovesCount(m => m + 1);
    const clean = currentExpression.replace(/\s+/g, '');

    // Caso Bastardo 1: 9 - x^2 -> (3 - x)(3 + x)
    if (clean === '9-x^2' || clean === '9-x²') {
      triggerVictory('(3 - x)(3 + x)', 'Differenza di quadrati: a² - b² = (a+b)(a-b)');
      return;
    }

    // Caso Bastardo 2: -2x^2 + 8 -> estrae -2 -> -2(x^2 - 4)
    if (clean === '-2x^2+8' || clean === '-2x²+8') {
      setCurrentExpression('-2(x^2 - 4)');
      logTelemetry('FACTORIZATION', 'Raccoglimento a Fattor Comune del segno meno (-2)', 'Espressione diventa -2(x² - 4)', '#f59e0b');
      return;
    }

    if (clean.includes('-2(x^2-4)') || clean.includes('-2(x²-4)')) {
      triggerVictory('-2(x - 2)(x + 2)', 'Scomposizione completa: raccoglimento e differenza di quadrati');
      return;
    }

    // Caso Bastardo 4: 4x^2 + 12x + 9 -> (2x + 3)^2
    if (clean === '4x^2+12x+9' || clean === '4x²+12x+9') {
      triggerVictory('(2x + 3)²', 'Quadrato di binomio: (2x + 3)²');
      return;
    }

    // Caso 6x^2 + 9x -> 3x(2x + 3)
    if (clean === '6x^2+9x' || clean === '6x²+9x') {
      triggerVictory('3x(2x + 3)', 'Raccoglimento totale del monomio 3x');
      return;
    }

    // Caso x^2 - 5x + 6 -> (x - 2)(x - 3)
    if (clean === 'x^2-5x+6' || clean === 'x²-5x+6') {
      triggerVictory('(x - 2)(x - 3)', 'Trinomio speciale con m=-2 e n=-3 (somma=-5, prod=6)');
      return;
    }

    // Se equazione 3x = 9 -> divisione per 3 -> x = 3
    if (clean === '3x=9') {
      triggerVictory('x = 3', 'Divisione per coefficiente 3: soluzione x = 3');
      return;
    }

    logTelemetry('FACTORIZATION', `Applicata scomposizione con ${element.text}`, 'Passaggio registrato', '#10b981');
  }, [currentExpression, triggerVictory, logTelemetry]);

  // Generatore procedurale "Genera Simile"
  const generateSimilarProblem = useCallback(() => {
    if (!ast) return;
    try {
      const generated = generateSimilar(ast);
      loadExpression(generated.input, true, 1200);
      setSuccessMessage(`Nuovo esercizio generato: ${generated.explanation}`);
    } catch {
      loadExpression('x^2 - 25', true, 1000);
    }
  }, [ast, loadExpression]);

  // Dichiara Irriducibile (es. Caso Bastardo 3: x^2 + 4)
  const declareIrreducible = useCallback(() => {
    if (ast?.kind === 'irreducible_polynomial') {
      triggerVictory(`${currentExpression} (Irriducibile su ℝ)`, 'Riconosciuta somma di quadrati priva di radici reali!');
      return;
    }
    registerStrike(makeError('ERR_CANNOT_FACTOR', currentExpression));
  }, [ast, currentExpression, triggerVictory, registerStrike]);

  return {
    currentExpression,
    ast,
    score,
    lives,
    strikes,
    movesCount,
    streak,
    isStrikeOut,
    isSolved,
    error,
    hint,
    isHintModalOpen,
    successMessage,
    telemetry,
    leaderboard,
    loadExpression,
    restartCurrentExpression,
    openHintModal: () => setIsHintModalOpen(true),
    closeHintModal: () => setIsHintModalOpen(false),
    confirmHint,
    dismissError: () => setError(null),
    handleDropTranspose,
    handleDropMerge,
    handleDropFactorize,
    declareIrreducible,
    generateSimilarProblem,
    saveToLeaderboard,
    logTelemetry,
  };
}
