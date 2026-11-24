import React, { useState, useRef, useEffect, useCallback } from 'react';
import { SubType } from '../types';

export type AtomType = 'coeff' | 'var' | 'sign' | 'num' | 'equals';

export interface MathAtom {
  id: string;
  text: string;
  type: AtomType;
  color: string;
  side: 'lhs' | 'rhs';
}

interface TouchAlgebraBoardProps {
  initialTitle: string;
  category: 'Equazione' | 'Scomposizione';
  par: number;
  onWin: (finalExpr: string, movesCount: number) => void;
  onMistake: (msg: string) => void;
  onMoveAction: () => void;
  subType?: SubType;
  metadata?: any;
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
}) => {
  const [history, setHistory] = useState<string[]>([initialTitle]);
  const cleanExpr = initialTitle.replace(/^.*:\s*/, '').trim();
  const isEquation = category === 'Equazione' || initialTitle.includes('=');

  // =========================================================================
  // EQUAZIONI: STATO FISICO A SLOT SEQUENZIALI
  // =========================================================================
  // LHS atoms: es. [5], [x], [sign], [num]
  const [lhsCoeff, setLhsCoeff] = useState<string>('2');
  const [lhsVar, setLhsVar] = useState<string>('x');
  const [lhsSign, setLhsSign] = useState<string | null>('+');
  const [lhsNum, setLhsNum] = useState<string | null>('6');

  // Termine con x su RHS (se presente, es. in 5x - 7 = 2x + 8)
  const [rhsVarCoeff, setRhsVarCoeff] = useState<string | null>(null);
  const [rhsVarName, setRhsVarName] = useState<string | null>(null);
  // Termine trasportato con x su LHS (es. dopo il 5x)
  const [lhsTransportedVarSign, setLhsTransportedVarSign] = useState<string | null>(null);
  const [lhsTransportedVarCoeff, setLhsTransportedVarCoeff] = useState<string | null>(null);

  // RHS atoms: es. [14], poi slot per il segno trasportato, poi slot per il numero trasportato
  const [rhsBaseNum, setRhsBaseNum] = useState<string>('14');
  const [rhsTransportedSign, setRhsTransportedSign] = useState<string | null>(null);
  const [rhsTransportedNum, setRhsTransportedNum] = useState<string | null>(null);

  // Frazione attiva su RHS (x = 8 / 2)
  const [fractionActive, setFractionActive] = useState<boolean>(false);
  const [fractionNum, setFractionNum] = useState<string>('8');
  const [fractionDen, setFractionDen] = useState<string>('2');

  // =========================================================================
  // SCOMPOSIZIONI ISTRUTTIVE (RAGIONAMENTO DELLO STUDENTE)
  // =========================================================================
  const [diffSqBases, setDiffSqBases] = useState<{ a: string | null; b: string | null }>({ a: null, b: null });
  const [diffSqSlots, setDiffSqSlots] = useState<{ a: string | null; b: string | null }>({ a: null, b: null });

  // Input scritti dallo studente per MCD (raccoglimento a fattore comune)
  const [mcdInputs, setMcdInputs] = useState<{ num: string; var: string; q1: string; q2: string }>({
    num: '', var: '', q1: '', q2: '',
  });

  // Input per Raccoglimento Parziale a 4 termini (es. 2x³ − 3x² + 4x − 6)
  const [partialStep, setPartialStep] = useState<1 | 2>(1);
  const [partialInputs, setPartialInputs] = useState<{
    mcd1: string;
    quot1: string;
    mcd2: string;
    quot2: string;
    finalCommon: string;
    finalOther: string;
  }>({
    mcd1: '',
    quot1: '',
    mcd2: '',
    quot2: '',
    finalCommon: '',
    finalOther: '',
  });

  // Input per Scomposizione Mista (-2x² + 8)
  const [mixedStep, setMixedStep] = useState<1 | 2>(1);
  const [mixedInputs, setMixedInputs] = useState<{ mcd: string; quot: string; f1: string; f2: string }>({
    mcd: '', quot: '', f1: '', f2: '',
  });

  // Input per Quadrato di Binomio (x² + 6x + 9)
  const [squareBinomInputs, setSquareBinomInputs] = useState<{ baseA: string; baseB: string; sign: string }>({
    baseA: '', baseB: '', sign: '+',
  });

  const [trinomSlots, setTrinomSlots] = useState<{ d1: string | null; d2: string | null }>({ d1: null, d2: null });

  // 1. Somma e Differenza di Cubi (2 Termini)
  const [cubesInputs, setCubesInputs] = useState<{ baseA: string; baseB: string; binom: string; trinom: string }>({
    baseA: '', baseB: '', binom: '', trinom: '',
  });

  // 2. Misto MCD + Trinomio (3 Termini)
  const [mixedTrinStep, setMixedTrinStep] = useState<1 | 2>(1);
  const [mixedTrinInputs, setMixedTrinInputs] = useState<{ mcd: string; quot: string; d1: string; d2: string }>({
    mcd: '', quot: '', d1: '', d2: '',
  });

  // 3. Trinomio a != 1 con sdoppiamento (3 Termini)
  const [trinAdvStep, setTrinAdvStep] = useState<1 | 2>(1);
  const [trinAdvInputs, setTrinAdvInputs] = useState<{ p1: string; p2: string; final: string }>({
    p1: '', p2: '', final: '',
  });

  // 4. Cubo di Binomio (4 Termini)
  const [cubeBinomInputs, setCubeBinomInputs] = useState<{ baseA: string; baseB: string; sign: string }>({
    baseA: '', baseB: '', sign: '+',
  });

  // 5. Raggruppamento (3+1) (4 Termini)
  const [group31Step, setGroup31Step] = useState<1 | 2>(1);
  const [group31Inputs, setGroup31Inputs] = useState<{ sqTrinom: string; finalRes: string }>({
    sqTrinom: '', finalRes: '',
  });

  // 6. Raggruppamento (3+2) (5 Termini)
  const [group32Step, setGroup32Step] = useState<1 | 2>(1);
  const [group32Inputs, setGroup32Inputs] = useState<{ triStep: string; linStep: string; finalRes: string }>({
    triStep: '', linStep: '', finalRes: '',
  });

  // 7. Ruffini su Polinomio di 4° Grado (5 Termini)
  const [ruffiniStep, setRuffiniStep] = useState<1 | 2>(1);
  const [ruffiniInputs, setRuffiniInputs] = useState<{ root: string; quot: string }>({
    root: '', quot: '',
  });

  // 8. MCD su 5 Termini (5 Termini)
  const [mcd5Inputs, setMcd5Inputs] = useState<{ mcd: string; quot: string }>({
    mcd: '', quot: '',
  });

  // Ultimo campo input attivo (per pulsanti scorciatoia simboli algebrici)
  const [lastFocusedInput, setLastFocusedInput] = useState<string | null>(null);

  // Drag Engine
  const [draggedTokenId, setDraggedTokenId] = useState<string | null>(null);
  const [draggedTokenText, setDraggedTokenText] = useState<string>('');
  const [draggedTokenColor, setDraggedTokenColor] = useState<string>('#fff');
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [hoverDropZone, setHoverDropZone] = useState<string | null>(null);
  const [isCrossedEqual, setIsCrossedEqual] = useState<boolean>(false);

  const boardRef = useRef<HTMLDivElement>(null);
  const equalDividerX = useRef<number>(0);

  // Feedback e stato
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isError, setIsError] = useState(false);
  const [isSolved, setIsSolved] = useState(false);
  const [finalResultStr, setFinalResultStr] = useState<string>('');

  const updateEqualPos = useCallback(() => {
    const eqElem = document.getElementById('atomic-equal-center');
    if (eqElem) {
      const rect = eqElem.getBoundingClientRect();
      equalDividerX.current = rect.left + rect.width / 2;
    } else if (boardRef.current) {
      const rect = boardRef.current.getBoundingClientRect();
      equalDividerX.current = rect.left + rect.width / 2;
    }
  }, []);

  useEffect(() => {
    updateEqualPos();
    window.addEventListener('resize', updateEqualPos);
    return () => window.removeEventListener('resize', updateEqualPos);
  }, [updateEqualPos]);

  // Reset del livello
  useEffect(() => {
    setHistory([initialTitle]);
    setIsSolved(false);
    setIsError(false);
    setFinalResultStr('');
    setFeedback(null);
    setFractionActive(false);

    setDiffSqBases({ a: null, b: null });
    setDiffSqSlots({ a: null, b: null });
    setMcdInputs({ num: '', var: '', q1: '', q2: '' });
    setPartialStep(1);
    setPartialInputs({ mcd1: '', quot1: '', mcd2: '', quot2: '', finalCommon: '', finalOther: '' });
    setMixedStep(1);
    setMixedInputs({ mcd: '', quot: '', f1: '', f2: '' });
    setSquareBinomInputs({ baseA: '', baseB: '', sign: '+' });
    setTrinomSlots({ d1: null, d2: null });
    setCubesInputs({ baseA: '', baseB: '', binom: '', trinom: '' });
    setMixedTrinStep(1);
    setMixedTrinInputs({ mcd: '', quot: '', d1: '', d2: '' });
    setTrinAdvStep(1);
    setTrinAdvInputs({ p1: '', p2: '', final: '' });
    setCubeBinomInputs({ baseA: '', baseB: '', sign: '+' });
    setGroup31Step(1);
    setGroup31Inputs({ sqTrinom: '', finalRes: '' });
    setGroup32Step(1);
    setGroup32Inputs({ triStep: '', linStep: '', finalRes: '' });
    setRuffiniStep(1);
    setRuffiniInputs({ root: '', quot: '' });
    setMcd5Inputs({ mcd: '', quot: '' });
    setLastFocusedInput(null);

    // Helper per resettare tutti gli stati equazione
    const resetEqState = (
      lCoeff: string,
      lVar: string,
      lSign: string | null,
      lNum: string | null,
      rBase: string,
      rVarC: string | null = null,
      rVarN: string | null = null
    ) => {
      setLhsCoeff(lCoeff);
      setLhsVar(lVar);
      setLhsSign(lSign);
      setLhsNum(lNum);
      setRhsBaseNum(rBase);
      setRhsVarCoeff(rVarC);
      setRhsVarName(rVarN);
      setLhsTransportedVarSign(null);
      setLhsTransportedVarCoeff(null);
      setRhsTransportedSign(null);
      setRhsTransportedNum(null);
    };

    // Parser universale per espressioni algebriche
    const cleanExpr = initialTitle
      .replace(/^.*:\s*/, '')
      .trim();

    if (cleanExpr.includes('=')) {
      const [leftRaw, rightRaw] = cleanExpr.split('=').map(s => s.trim());

      // Caso parentesi: a(x ± b)
      const parenMatch = leftRaw.match(/^(\d+)\s*\(\s*([a-zA-Z])\s*([+−\-])\s*(\d+)\s*\)$/);
      if (parenMatch) {
        const factor = parseInt(parenMatch[1], 10);
        const v = parenMatch[2];
        const s = parenMatch[3] === '-' ? '−' : parenMatch[3];
        const innerNum = parseInt(parenMatch[4], 10);
        const expandedNum = (factor * innerNum).toString();
        resetEqState(factor.toString(), v, s, expandedNum, rightRaw);
      } else {
        // Estrazione termine x a sinistra
        const leftVarMatch = leftRaw.match(/(-?\d*)([a-zA-Z])/);
        const lCoeffVal = leftVarMatch ? (leftVarMatch[1] === '' || leftVarMatch[1] === '+' ? '1' : (leftVarMatch[1] === '-' ? '-1' : leftVarMatch[1])) : '1';
        const lVarVal = leftVarMatch ? leftVarMatch[2] : 'x';

        // Estrazione termine numerico a sinistra
        const leftNumMatch = leftRaw.match(/([+−\-])\s*(\d+)(?![a-zA-Z])/);
        const lSignVal = leftNumMatch ? (leftNumMatch[1] === '-' ? '−' : leftNumMatch[1]) : null;
        const lNumVal = leftNumMatch ? leftNumMatch[2] : null;

        // Estrazione eventuale termine x a destra (es. 2x)
        const rightVarMatch = rightRaw.match(/(-?\d*)([a-zA-Z])/);
        const rVarCoeffVal = rightVarMatch ? (rightVarMatch[1] === '' || rightVarMatch[1] === '+' ? '1' : rightVarMatch[1]) : null;
        const rVarNameVal = rightVarMatch ? rightVarMatch[2] : null;

        // Estrazione termine numerico a destra
        const rightNumMatch = rightRaw.match(/([+−\-]?\s*\d+)(?![a-zA-Z])/);
        const rBaseVal = rightNumMatch ? rightNumMatch[1].replace(/\s+/g, '').replace('-', '−') : '0';

        resetEqState(
          lCoeffVal,
          lVarVal,
          lSignVal,
          lNumVal,
          rBaseVal.replace('−', '-').replace('+', ''),
          rVarCoeffVal,
          rVarNameVal
        );
      }
    } else {
      resetEqState('2', 'x', '+', '6', '14');
    }
  }, [initialTitle]);

  // =========================================================================
  // NORMALIZZAZIONE E VERIFICA SCOMPOSIZIONI (RAGIONAMENTO STUDENTE)
  // =========================================================================
  const normalizeAlg = (str: string) => {
    return str
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[−–—]/g, '-')
      .replace(/\^2/g, '²')
      .replace(/\^3/g, '³')
      .replace(/^\(/, '')
      .replace(/\)$/, '');
  };

  const getDefaultActiveSlot = (): string => {
    switch (subType) {
      case 'diff_squares':
        if (!diffSqSlots.a) return 'diffsq-baseA';
        return 'diffsq-baseB';
      case 'trinomial':
        if (!trinomSlots.d1) return 'trinom-d1';
        return 'trinom-d2';
      case 'common_mcd':
        if (!mcdInputs.num) return 'mcd-num';
        if (!mcdInputs.var) return 'mcd-var';
        if (!mcdInputs.q1) return 'mcd-q1';
        return 'mcd-q2';
      case 'partial_grouping':
        if (partialStep === 1) {
          if (!partialInputs.mcd1) return 'partial-mcd1';
          if (!partialInputs.quot1) return 'partial-quot1';
          if (!partialInputs.mcd2) return 'partial-mcd2';
          return 'partial-quot2';
        }
        if (!partialInputs.finalCommon) return 'partial-finalCommon';
        return 'partial-finalOther';
      case 'mixed_mcd_squares':
        if (mixedStep === 1) {
          if (!mixedInputs.mcd) return 'mixed-mcd';
          return 'mixed-quot';
        }
        if (!mixedInputs.f1) return 'mixed-f1';
        return 'mixed-f2';
      case 'square_binomial':
        if (!squareBinomInputs.baseA) return 'sqb-baseA';
        return 'sqb-baseB';
      case 'sum_cubes':
      case 'diff_cubes':
        if (!cubesInputs.baseA) return 'cubes-baseA';
        if (!cubesInputs.baseB) return 'cubes-baseB';
        if (!cubesInputs.binom) return 'cubes-binom';
        return 'cubes-trinom';
      case 'mixed_mcd_trinomial':
        if (mixedTrinStep === 1) {
          if (!mixedTrinInputs.mcd) return 'mxtrin-mcd';
          return 'mxtrin-quot';
        }
        if (!mixedTrinInputs.d1) return 'mxtrin-d1';
        return 'mxtrin-d2';
      case 'trinomial_advanced':
        if (trinAdvStep === 1) {
          if (!trinAdvInputs.p1) return 'trinadv-p1';
          return 'trinadv-p2';
        }
        return 'trinadv-final';
      case 'cube_binomial':
        if (!cubeBinomInputs.baseA) return 'cubebinom-baseA';
        return 'cubebinom-baseB';
      case 'grouping_3_1':
        if (group31Step === 1) return 'grp31-sqTrinom';
        return 'grp31-finalRes';
      case 'grouping_3_2':
        if (group32Step === 1) {
          if (!group32Inputs.triStep) return 'grp32-triStep';
          return 'grp32-linStep';
        }
        return 'grp32-finalRes';
      case 'ruffini_degree4':
        if (ruffiniStep === 1) return 'ruff-root';
        return 'ruff-quot';
      case 'mcd_5terms':
        if (!mcd5Inputs.mcd) return 'mcd5-mcd';
        return 'mcd5-quot';
      default:
        return '';
    }
  };

  const getSlotDisplayName = (slotKey: string): string => {
    switch (slotKey) {
      case 'diffsq-baseA': return '1ª Base (Radice)';
      case 'diffsq-baseB': return '2ª Base (Radice)';
      case 'trinom-d1': return '1° Numero';
      case 'trinom-d2': return '2° Numero';
      case 'mcd-num': return 'MCD Numerico';
      case 'mcd-var': return 'MCD Letterale';
      case 'mcd-q1': return '1° Quoziente';
      case 'mcd-q2': return '2° Quoziente';
      case 'partial-mcd1': return 'Fattore 1ª Coppia';
      case 'partial-quot1': return 'Parentesi 1ª Coppia';
      case 'partial-mcd2': return 'Fattore 2ª Coppia';
      case 'partial-quot2': return 'Parentesi 2ª Coppia';
      case 'partial-finalCommon': return 'Binomio Comune';
      case 'partial-finalOther': return 'Fattori Esterni';
      case 'mixed-mcd': return 'MCD Negativo';
      case 'mixed-quot': return 'Differenza Quadrati';
      case 'mixed-f1': return '1° Fattore Coniugato';
      case 'mixed-f2': return '2° Fattore Coniugato';
      case 'sqb-baseA': return 'Base 1 Quadrato';
      case 'sqb-baseB': return 'Base 2 Quadrato';
      case 'cubes-baseA': return 'Base Cubo A';
      case 'cubes-baseB': return 'Base Cubo B';
      case 'cubes-binom': return 'Binomio (A±B)';
      case 'cubes-trinom': return 'Falso Quadrato';
      case 'mxtrin-mcd': return 'MCD Numerico';
      case 'mxtrin-quot': return 'Trinomio Interno';
      case 'mxtrin-d1': return 'Numero 1';
      case 'mxtrin-d2': return 'Numero 2';
      case 'trinadv-p1': return '1° Termine con x';
      case 'trinadv-p2': return '2° Termine con x';
      case 'trinadv-final': return 'Prodotto di Binomi';
      case 'cubebinom-baseA': return 'Base Cubo 1';
      case 'cubebinom-baseB': return 'Base Cubo 2';
      case 'grp31-sqTrinom': return 'Quadrato di Binomio';
      case 'grp31-finalRes': return 'Differenza di Quadrati';
      case 'grp32-triStep': return 'Quadrato di Binomio';
      case 'grp32-linStep': return 'Raccoglimento Lineare';
      case 'grp32-finalRes': return 'Scomposizione Finale';
      case 'ruff-root': return 'Zero del Polinomio (c)';
      case 'ruff-quot': return 'Quoziente Q(x)';
      case 'mcd5-mcd': return 'MCD Numerico';
      case 'mcd5-quot': return 'Polinomio Quoziente';
      default: return slotKey ? slotKey : 'Tocca un campo per selezionarlo';
    }
  };

  const getContextualChips = (): string[] => {
    switch (subType) {
      case 'diff_squares':
        return [metadata?.baseA || '3', metadata?.baseB || 'x', 'x', '3', '5'].filter(Boolean);
      case 'common_mcd':
        return [metadata?.mcdNum || '3', metadata?.mcdVar || 'x', metadata?.q1 || '2x', metadata?.q2 || '3'].filter(Boolean);
      case 'trinomial':
        return (metadata?.chips as string[]) || ['+2', '+3', '+1', '+6'];
      case 'partial_grouping':
        if (partialStep === 1) {
          return [metadata?.mcd1 || 'x²', metadata?.quot1 || '2x-3', metadata?.mcd2 || '2', metadata?.quot2 || '2x-3', 'x', 'x²', '2', '3'].filter(Boolean);
        }
        return [metadata?.finalCommon || '2x-3', metadata?.finalOther || 'x²+2'].filter(Boolean);
      case 'mixed_mcd_squares':
        return [metadata?.mixedMcd || '-2', metadata?.mixedQuot || 'x²-4', metadata?.f1 || 'x-2', metadata?.f2 || 'x+2'].filter(Boolean);
      case 'sum_cubes':
      case 'diff_cubes':
        return [metadata?.baseA || 'x', metadata?.baseB || '2', metadata?.binom || 'x+2'].filter(Boolean);
      case 'mixed_mcd_trinomial':
        return [metadata?.mcdNum || '2', metadata?.d1 || '2', metadata?.d2 || '3'].filter(Boolean);
      case 'trinomial_advanced':
        if (trinAdvStep === 1) {
          return [metadata?.split1 || '6x', metadata?.split2 || 'x'].filter(Boolean);
        }
        return [metadata?.finalResult || '(x+3)(2x+1)'].filter(Boolean);
      case 'grouping_3_1':
        return [metadata?.sqTrinom || '(x+3)²', 'y', 'y²'].filter(Boolean);
      case 'grouping_3_2':
        return [metadata?.triStep || '(x+3)²', metadata?.linStep || '4(x+3)'].filter(Boolean);
      case 'ruffini_degree4':
        return [metadata?.root || '1', '-1', '2', '-2', metadata?.divisor || 'x-1'].filter(Boolean);
      case 'mcd_5terms':
        return [metadata?.mcd || '2'].filter(Boolean);
      default:
        return [];
    }
  };

  const updateInputField = (target: string, updater: (prevVal: string) => string) => {
    if (target === 'diffsq-baseA') {
      setDiffSqSlots(prev => ({ ...prev, a: updater(prev.a || '') }));
    } else if (target === 'diffsq-baseB') {
      setDiffSqSlots(prev => ({ ...prev, b: updater(prev.b || '') }));
    } else if (target === 'trinom-d1') {
      setTrinomSlots(prev => ({ ...prev, d1: updater(prev.d1 || '') }));
    } else if (target === 'trinom-d2') {
      setTrinomSlots(prev => ({ ...prev, d2: updater(prev.d2 || '') }));
    } else if (target.startsWith('mcd-')) {
      const field = target.replace('mcd-', '') as keyof typeof mcdInputs;
      setMcdInputs(prev => ({ ...prev, [field]: updater(prev[field]) }));
    } else if (target.startsWith('partial-')) {
      const field = target.replace('partial-', '') as keyof typeof partialInputs;
      setPartialInputs(prev => ({ ...prev, [field]: updater(prev[field]) }));
    } else if (target.startsWith('mixed-')) {
      const field = target.replace('mixed-', '') as keyof typeof mixedInputs;
      setMixedInputs(prev => ({ ...prev, [field]: updater(prev[field]) }));
    } else if (target.startsWith('sqb-')) {
      const field = target.replace('sqb-', '') as keyof typeof squareBinomInputs;
      setSquareBinomInputs(prev => ({ ...prev, [field]: updater(prev[field]) }));
    } else if (target.startsWith('cubes-')) {
      const field = target.replace('cubes-', '') as keyof typeof cubesInputs;
      setCubesInputs(prev => ({ ...prev, [field]: updater(prev[field]) }));
    } else if (target.startsWith('mxtrin-')) {
      const field = target.replace('mxtrin-', '') as keyof typeof mixedTrinInputs;
      setMixedTrinInputs(prev => ({ ...prev, [field]: updater(prev[field]) }));
    } else if (target.startsWith('trinadv-')) {
      const field = target.replace('trinadv-', '') as keyof typeof trinAdvInputs;
      setTrinAdvInputs(prev => ({ ...prev, [field]: updater(prev[field]) }));
    } else if (target.startsWith('cubebinom-')) {
      const field = target.replace('cubebinom-', '') as keyof typeof cubeBinomInputs;
      setCubeBinomInputs(prev => ({ ...prev, [field]: updater(prev[field]) }));
    } else if (target.startsWith('grp31-')) {
      const field = target.replace('grp31-', '') as keyof typeof group31Inputs;
      setGroup31Inputs(prev => ({ ...prev, [field]: updater(prev[field]) }));
    } else if (target.startsWith('grp32-')) {
      const field = target.replace('grp32-', '') as keyof typeof group32Inputs;
      setGroup32Inputs(prev => ({ ...prev, [field]: updater(prev[field]) }));
    } else if (target.startsWith('ruff-')) {
      const field = target.replace('ruff-', '') as keyof typeof ruffiniInputs;
      setRuffiniInputs(prev => ({ ...prev, [field]: updater(prev[field]) }));
    } else if (target.startsWith('mcd5-')) {
      const field = target.replace('mcd5-', '') as keyof typeof mcd5Inputs;
      setMcd5Inputs(prev => ({ ...prev, [field]: updater(prev[field]) }));
    }
  };

  const insertSymbol = (sym: string, targetOverride?: string) => {
    const target = targetOverride || lastFocusedInput || getDefaultActiveSlot();
    if (!target) return;
    setLastFocusedInput(target);
    updateInputField(target, prev => prev + sym);
  };

  const handleBackspace = () => {
    const target = lastFocusedInput || getDefaultActiveSlot();
    if (!target) return;
    updateInputField(target, prev => (prev ? prev.slice(0, -1) : ''));
  };

  const handleClearSlot = () => {
    const target = lastFocusedInput || getDefaultActiveSlot();
    if (!target) return;
    updateInputField(target, () => '');
  };

  // Verifica Differenza di Due Quadrati
  const handleVerifyDiffSquares = () => {
    const expBaseA = metadata?.baseA || (initialTitle.includes('25') ? '5' : (initialTitle.includes('9') ? '3' : 'x'));
    const expBaseB = metadata?.baseB || (initialTitle.includes('4x²') ? '2x' : (initialTitle.includes('16') ? '4' : 'x'));

    const uA = normalizeAlg(diffSqSlots.a || '');
    const uB = normalizeAlg(diffSqSlots.b || '');

    if (uA !== normalizeAlg(expBaseA)) {
      setIsError(true);
      onMistake('1a base errata');
      setFeedback('⚠️ Radice quadrata del primo termine errata: trova la base che elevata al quadrato dà il primo termine.');
      return;
    }
    if (uB !== normalizeAlg(expBaseB)) {
      setIsError(true);
      onMistake('2a base errata');
      setFeedback('⚠️ Radice quadrata del secondo termine errata: trova la base che elevata al quadrato dà il secondo termine.');
      return;
    }

    onMoveAction();
    const final = `(${expBaseA} − ${expBaseB})(${expBaseA} + ${expBaseB})`;
    setHistory(h => [...h, final]);
    setIsSolved(true);
    setFinalResultStr(final);
    setFeedback(`🏆 Differenza di quadrati scomposta con successo: ${final}!`);
    setIsError(false);
    onWin(final, history.length + 1);
  };

  // Verifica Trinomio Notevole (Somma e Prodotto)
  const handleVerifyTrinomial = () => {
    const parseSignedNum = (val: any): { str: string; num: number } | null => {
      if (val === undefined || val === null || val === '') return null;
      let s = String(val).trim().replace('-', '−');
      while (s.startsWith('++')) s = s.slice(1);
      const isMinus = s.startsWith('−');
      const cleanVal = s.replace('+', '').replace('−', '');
      const numVal = isMinus ? -parseFloat(cleanVal) : parseFloat(cleanVal);
      if (isNaN(numVal)) return null;
      const formatted = numVal >= 0 ? `+${numVal}` : `−${Math.abs(numVal)}`;
      return { str: formatted, num: numVal };
    };

    const target1 = parseSignedNum(metadata?.d1);
    const target2 = parseSignedNum(metadata?.d2);

    const user1 = parseSignedNum(trinomSlots.d1);
    const user2 = parseSignedNum(trinomSlots.d2);

    if (!user1 || !user2) {
      setIsError(true);
      onMistake('Numeri trinomio incompleti');
      setFeedback('⚠️ Inserisci entrambi i numeri (es. +2 e +3) per verificare la scomposizione.');
      return;
    }

    let isCorrect = false;

    if (target1 && target2) {
      // 1. Corrispondenza diretta dei fattori
      const matchDirect = (user1.str === target1.str && user2.str === target2.str) ||
        (user1.str === target2.str && user2.str === target1.str);
      // 2. Corrispondenza algebrica (somma e prodotto identici)
      const sumMatch = (user1.num + user2.num === target1.num + target2.num);
      const prodMatch = (user1.num * user2.num === target1.num * target2.num);
      isCorrect = matchDirect || (sumMatch && prodMatch);
    } else {
      // Fallback dal testo: es. x² + 5x + 6 => somma 5, prodotto 6
      const has5x = initialTitle.includes('+ 5x') || (cleanExpr && cleanExpr.includes('+ 5x'));
      const has6 = initialTitle.includes('+ 6') || (cleanExpr && cleanExpr.includes('+ 6'));
      if (has5x && has6 && user1.num + user2.num === 5 && user1.num * user2.num === 6) {
        isCorrect = true;
      }
    }

    if (!isCorrect) {
      setIsError(true);
      onMistake('Numeri trinomio errati');
      setFeedback('⚠️ I due numeri inseriti non soddisfano la somma e il prodotto richiesti dal trinomio.');
      return;
    }

    onMoveAction();
    const final = `(x ${user1.str})(x ${user2.str})`;
    setHistory(h => [...h, final]);
    setIsSolved(true);
    setFinalResultStr(final);
    setFeedback(`🏆 Trinomio notevole scomposto con successo: ${final}!`);
    setIsError(false);
    onWin(final, history.length + 1);
  };

  // Verifica MCD (Raccoglimento a fattore comune)
  const handleVerifyMcd = () => {
    const is6x2 = initialTitle.includes('6x²');
    const expNum = metadata?.mcdNum || (is6x2 ? '3' : '4');
    const expVar = metadata?.mcdVar || (is6x2 ? 'x' : 'x²');
    const expQ1 = metadata?.q1 || (is6x2 ? '2x' : 'x');
    const expQ2 = metadata?.q2 || (is6x2 ? '3' : (initialTitle.includes('−') ? '-2' : '2'));

    const userNum = normalizeAlg(mcdInputs.num);
    const userVar = normalizeAlg(mcdInputs.var);
    const userQ1 = normalizeAlg(mcdInputs.q1);
    const userQ2 = normalizeAlg(mcdInputs.q2);

    if (userNum !== expNum) {
      setIsError(true);
      onMistake('MCD numerico errato');
      setFeedback(`⚠️ Controlla l'MCD numerico tra i coefficienti! Qual è il massimo divisore comune?`);
      return;
    }
    if (userVar !== expVar && normalizeAlg(userVar) !== normalizeAlg(expVar)) {
      setIsError(true);
      onMistake('MCD letterale errato');
      setFeedback(`⚠️ Controlla l'MCD letterale! Prendi la lettera comune con l'esponente minore.`);
      return;
    }
    if (normalizeAlg(userQ1) !== normalizeAlg(expQ1)) {
      setIsError(true);
      onMistake('Primo quoziente errato');
      setFeedback(`⚠️ Controlla la divisione del 1° termine per l'MCD!`);
      return;
    }
    if (normalizeAlg(userQ2) !== normalizeAlg(expQ2) && normalizeAlg(userQ2) !== normalizeAlg(expQ2).replace('-', '')) {
      setIsError(true);
      onMistake('Secondo quoziente errato');
      setFeedback(`⚠️ Controlla la divisione del 2° termine per l'MCD!`);
      return;
    }

    // Successo
    onMoveAction();
    const finalStr = metadata?.mcdNum && metadata?.mcdVar && metadata?.q1 && metadata?.q2
      ? `${metadata.mcdNum}${metadata.mcdVar}(${metadata.q1} ${metadata.sign || '+'} ${metadata.q2})`
      : (is6x2 ? '3x(2x + 3)' : '4x²(x − 2)');
    setHistory(h => [...h, finalStr]);
    setIsSolved(true);
    setFinalResultStr(finalStr);
    setFeedback(`🏆 Complimenti! Hai ragionato e calcolato correttamente l'MCD: ${finalStr}!`);
    setIsError(false);
    onWin(finalStr, history.length + 1);
  };

  // Verifica Raccoglimento Parziale - Fase 1 (due a due)
  const handleVerifyPartialPhase1 = () => {
    const expM1 = metadata?.mcd1 || 'x²';
    const expQ1 = metadata?.quot1 || '2x-3';
    const expM2 = metadata?.mcd2 || '2';
    const expQ2 = metadata?.quot2 || '2x-3';
    const pairSign = metadata?.pairSign || '+';

    const uM1 = normalizeAlg(partialInputs.mcd1);
    const uQ1 = normalizeAlg(partialInputs.quot1);
    const uM2 = normalizeAlg(partialInputs.mcd2).replace('+', '').replace('−', '-');
    const uQ2 = normalizeAlg(partialInputs.quot2);

    if (uM1 !== normalizeAlg(expM1) && uM1 !== normalizeAlg(expM1).replace('²', '2')) {
      setIsError(true);
      onMistake('MCD prima coppia errato');
      if (uM1 === '2x²' || uM1 === '2x2') {
        setFeedback('⚠️ Attenzione: tra i coefficienti numerici non puoi raccogliere il 2! L\'unico fattore comune è la parte letterale.');
      } else {
        setFeedback('⚠️ Il fattore comune nella prima coppia non è corretto: cerca la massima potenza comune di x.');
      }
      return;
    }
    if (uQ1 !== normalizeAlg(expQ1)) {
      setIsError(true);
      onMistake('Quoziente prima coppia errato');
      setFeedback('⚠️ Calcolo errato nella prima parentesi: dividi ciascun termine della 1ª coppia per il fattore comune raccolto.');
      return;
    }

    const normExpM2 = normalizeAlg(expM2).replace('+', '').replace('−', '-');
    const isM2Valid = (uM2 === normExpM2) || (uM2 === normExpM2.replace('-', '')) || (uM2 === `-${normExpM2}`);
    if (!isM2Valid) {
      setIsError(true);
      onMistake('MCD seconda coppia errato');
      setFeedback('⚠️ Il fattore comune nella seconda coppia non è corretto: cerca il massimo divisore comune tra i numeri.');
      return;
    }
    if (uQ2 !== normalizeAlg(expQ2)) {
      setIsError(true);
      onMistake('Quoziente seconda coppia errato');
      setFeedback('⚠️ Calcolo errato nella seconda parentesi: dividi ciascun termine della 2ª coppia per il fattore comune raccolto.');
      return;
    }

    onMoveAction();
    const step1Line = `${expM1}(${expQ1}) ${pairSign} ${expM2}(${expQ2})`;
    setPartialStep(2);
    setHistory(h => [...h, step1Line]);
    setFeedback(`✅ 1° PASSAGGIO CORRETTO! Raccoglimento a due a due completato. Ora raccogli il binomio comune!`);
    setIsError(false);
  };

  // Verifica Raccoglimento Parziale - Fase 2 (binomio comune)
  const handleVerifyPartialPhase2 = () => {
    const expCommon = metadata?.finalCommon || '2x-3';
    const expOther = metadata?.finalOther || (metadata?.pairSign === '−' ? 'x²-2' : 'x²+2');

    const uC = normalizeAlg(partialInputs.finalCommon);
    const uO = normalizeAlg(partialInputs.finalOther);

    const isOtherValid = (val: string) => {
      const v = normalizeAlg(val);
      const target = normalizeAlg(expOther);
      return v === target || v === target.replace('²', '2');
    };
    const isCommonValid = (val: string) => {
      return normalizeAlg(val) === normalizeAlg(expCommon);
    };

    const isMatch = (isCommonValid(uC) && isOtherValid(uO)) || (isOtherValid(uC) && isCommonValid(uO));

    if (!isMatch) {
      setIsError(true);
      onMistake('Scomposizione finale parziale errata');
      setFeedback('⚠️ Raccogli il binomio comune e moltiplicalo per la somma dei fattori esterni!');
      return;
    }

    onMoveAction();
    const finalStr = `(${expCommon})(${expOther})`;
    setHistory(h => [...h, finalStr]);
    setIsSolved(true);
    setFinalResultStr(finalStr);
    setFeedback(`🏆 Bravissimo! Raccoglimento parziale completato con successo: ${finalStr}!`);
    setIsError(false);
    onWin(finalStr, history.length + 1);
  };

  // Verifica Scomposizione Mista
  const handleVerifyMixedStep1 = () => {
    const expM = metadata?.mixedMcd || '-2';
    const expQ = metadata?.mixedQuot || 'x²-4';

    const uM = normalizeAlg(mixedInputs.mcd);
    const uQ = normalizeAlg(mixedInputs.quot);

    if (uM !== normalizeAlg(expM)) {
      setIsError(true);
      onMistake('MCD mista errato');
      if (normalizeAlg(uM) === '2' || normalizeAlg(uM) === '+2') {
        setFeedback('⚠️ Attenzione al segno: raccogli il fattore col segno negativo per lasciare il termine x² positivo!');
      } else {
        setFeedback('⚠️ Il fattore comune non è corretto: trova il massimo divisore comune tra i coefficienti numerici.');
      }
      return;
    }
    if (uQ !== normalizeAlg(expQ) && uQ !== normalizeAlg(expQ).replace('²', '2')) {
      setIsError(true);
      onMistake('Quoziente mista errato');
      if (uQ.includes('+') && expQ.includes('-')) {
        setFeedback('⚠️ Errore di segno: attenzione alla divisione (+ : − = −)! Quando dividi un termine positivo per uno negativo, il segno cambia in negativo.');
      } else {
        setFeedback('⚠️ Calcolo del quoziente errato: dividi ciascun termine iniziale per il fattore comune raccolto.');
      }
      return;
    }

    onMoveAction();
    const step1 = `${expM}(${expQ})`;
    setMixedStep(2);
    setHistory(h => [...h, step1]);
    setFeedback(`✨ Perfetto! Ora scomponi la differenza di quadrati interna nei suoi due fattori coniugati.`);
    setIsError(false);
  };

  const handleVerifyMixedStep2 = () => {
    const expF1 = metadata?.f1 || 'x-2';
    const expF2 = metadata?.f2 || 'x+2';
    const expM = metadata?.mixedMcd || '-2';

    const f1 = normalizeAlg(mixedInputs.f1);
    const f2 = normalizeAlg(mixedInputs.f2);

    const isMatch = (f1 === normalizeAlg(expF1) && f2 === normalizeAlg(expF2)) || (f1 === normalizeAlg(expF2) && f2 === normalizeAlg(expF1));
    if (!isMatch) {
      setIsError(true);
      onMistake('Fattori coniugati errati');
      setFeedback('⚠️ Ricorda la regola della differenza di quadrati: (A − B)(A + B). Controlla le radici estratte.');
      return;
    }

    onMoveAction();
    const finalStr = `${expM}(${expF1})(${expF2})`;
    setHistory(h => [...h, finalStr]);
    setIsSolved(true);
    setFinalResultStr(finalStr);
    setFeedback(`🏆 Scomposizione mista completata con successo: ${finalStr}!`);
    setIsError(false);
    onWin(finalStr, history.length + 1);
  };

  // Verifica Quadrato di Binomio
  const handleVerifySquareBinom = () => {
    const expBaseA = metadata?.sqBaseA || 'x';
    const expBaseB = metadata?.sqBaseB || '3';
    const expSign = metadata?.sqSign || '+';

    const bA = normalizeAlg(squareBinomInputs.baseA);
    const bB = normalizeAlg(squareBinomInputs.baseB);
    const s = squareBinomInputs.sign;

    if (bA !== normalizeAlg(expBaseA)) {
      setIsError(true);
      onMistake('Base 1 quadrato errata');
      setFeedback('⚠️ Radice quadrata del primo termine errata: qual è la base che elevata al quadrato dà il primo termine?');
      return;
    }
    if (bB !== normalizeAlg(expBaseB)) {
      setIsError(true);
      onMistake('Base 2 quadrato errata');
      setFeedback('⚠️ Radice quadrata dell\'ultimo termine errata: qual è la base che elevata al quadrato dà il termine noto?');
      return;
    }
    if (s !== expSign) {
      setIsError(true);
      onMistake('Segno doppio prodotto errato');
      setFeedback('⚠️ Controlla il segno del doppio prodotto (termine centrale)!');
      return;
    }

    onMoveAction();
    const finalStr = `(${expBaseA} ${expSign} ${expBaseB})²`;
    setHistory(h => [...h, finalStr]);
    setIsSolved(true);
    setFinalResultStr(finalStr);
    setFeedback(`🏆 Quadrato di binomio riconosciuto: ${finalStr}!`);
    setIsError(false);
    onWin(finalStr, history.length + 1);
  };

  // --- VERIFICA SOMMA E DIFFERENZA DI CUBI (2 TERMINI) ---
  const handleVerifyCubes = () => {
    const isSum = subType === 'sum_cubes';
    const expBaseA = metadata?.baseA || 'x';
    const expBaseB = metadata?.baseB || (isSum ? '2' : '3');
    const expBinom = metadata?.binom || (isSum ? `${expBaseA}+${expBaseB}` : `${expBaseA}-${expBaseB}`);
    const expTrinom = metadata?.trinom || (isSum ? `${expBaseA}²-${expBaseB}${expBaseA}+${Number(expBaseB) ** 2}` : `${expBaseA}²+${expBaseB}${expBaseA}+${Number(expBaseB) ** 2}`);

    const uA = normalizeAlg(cubesInputs.baseA);
    const uB = normalizeAlg(cubesInputs.baseB);
    const uBinom = normalizeAlg(cubesInputs.binom);
    const uTrinom = normalizeAlg(cubesInputs.trinom);

    if (uA !== normalizeAlg(expBaseA)) {
      setIsError(true);
      onMistake('Base cubo A errata');
      setFeedback('⚠️ Radice cubica del primo termine non corretta: calcola la radice cubica di A³.');
      return;
    }
    if (uB !== normalizeAlg(expBaseB)) {
      setIsError(true);
      onMistake('Base cubo B errata');
      setFeedback('⚠️ Radice cubica del secondo termine non corretta: quale numero elevato al cubo dà il termine noto?');
      return;
    }
    if (uBinom !== normalizeAlg(expBinom)) {
      setIsError(true);
      onMistake('Binomio cubi errato');
      setFeedback(`⚠️ Il binomio deve mantenere lo stesso segno dell'espressione iniziale: (${isSum ? 'A + B' : 'A − B'}).`);
      return;
    }
    if (uTrinom !== normalizeAlg(expTrinom) && uTrinom !== normalizeAlg(expTrinom).replace('²', '2')) {
      setIsError(true);
      onMistake('Falso quadrato errato');
      setFeedback(`⚠️ Controlla il falso quadrato (A² ${isSum ? '−' : '+'} AB + B²): ricorda che il termine centrale ha segno OPPOSTO al binomio e NON c'è il fattore 2!`);
      return;
    }

    onMoveAction();
    const finalStr = `(${expBinom})(${expTrinom})`;
    setHistory(h => [...h, finalStr]);
    setIsSolved(true);
    setFinalResultStr(finalStr);
    setFeedback(`🏆 Scomposizione in cubi completata: ${finalStr}!`);
    setIsError(false);
    onWin(finalStr, history.length + 1);
  };

  // --- VERIFICA MISTO MCD + TRINOMIO (3 TERMINI) ---
  const handleVerifyMixedTrinStep1 = () => {
    const expMcd = metadata?.mcdNum || '2';
    const expInner = metadata?.innerTrinom || 'x²+5x+6';

    const uMcd = normalizeAlg(mixedTrinInputs.mcd);
    const uQuot = normalizeAlg(mixedTrinInputs.quot);

    if (uMcd !== normalizeAlg(expMcd)) {
      setIsError(true);
      onMistake('MCD mista trinomio errato');
      setFeedback('⚠️ Trova il massimo divisore comune numerico tra tutti e tre i termini.');
      return;
    }
    if (uQuot !== normalizeAlg(expInner) && uQuot !== normalizeAlg(expInner).replace('²', '2')) {
      setIsError(true);
      onMistake('Quoziente trinomio errato');
      setFeedback('⚠️ Dividi ciascun termine iniziale per il fattore comune raccolto.');
      return;
    }

    onMoveAction();
    setMixedTrinStep(2);
    setHistory(h => [...h, `${expMcd}(${expInner})`]);
    setFeedback(`✨ Ottimo! Ora trova i due numeri con somma e prodotto per scomporre il trinomio interno.`);
    setIsError(false);
  };

  const handleVerifyMixedTrinStep2 = () => {
    const expMcd = metadata?.mcdNum || '2';
    const expD1 = metadata?.d1 || '2';
    const expD2 = metadata?.d2 || '3';

    const u1 = normalizeAlg(mixedTrinInputs.d1).replace('+', '');
    const u2 = normalizeAlg(mixedTrinInputs.d2).replace('+', '');

    const isMatch = (u1 === expD1 && u2 === expD2) || (u1 === expD2 && u2 === expD1);
    if (!isMatch) {
      setIsError(true);
      onMistake('Numeri trinomio errati');
      setFeedback('⚠️ I due numeri inseriti non soddisfano la somma e il prodotto richiesti per il trinomio.');
      return;
    }

    onMoveAction();
    const finalStr = `${expMcd}(x + ${expD1})(x + ${expD2})`;
    setHistory(h => [...h, finalStr]);
    setIsSolved(true);
    setFinalResultStr(finalStr);
    setFeedback(`🏆 Scomposizione mista completata con successo: ${finalStr}!`);
    setIsError(false);
    onWin(finalStr, history.length + 1);
  };

  // --- VERIFICA TRINOMIO CON A != 1 (SDOPPIAMENTO) (3 TERMINI) ---
  const handleVerifyTrinAdvStep1 = () => {
    const expP1 = metadata?.split1 || '6x';
    const expP2 = metadata?.split2 || 'x';

    const u1 = normalizeAlg(trinAdvInputs.p1);
    const u2 = normalizeAlg(trinAdvInputs.p2);

    const isMatch = (u1 === normalizeAlg(expP1) && u2 === normalizeAlg(expP2)) || (u1 === normalizeAlg(expP2) && u2 === normalizeAlg(expP1));
    if (!isMatch) {
      setIsError(true);
      onMistake('Sdoppiamento termine centrale errato');
      setFeedback('⚠️ Cerca due numeri la cui somma sia b e il cui prodotto sia a · c, poi moltiplicali per x.');
      return;
    }

    onMoveAction();
    setTrinAdvStep(2);
    const fourTerms = metadata?.fourTerms || '2x² + 6x + x + 3';
    setHistory(h => [...h, fourTerms]);
    setFeedback(`✨ Splendido! Il termine centrale è stato sdoppiato in 4 termini. Ora applica il raccoglimento parziale.`);
    setIsError(false);
  };

  const handleVerifyTrinAdvStep2 = () => {
    const expRes = metadata?.finalResult || '(x+3)(2x+1)';
    const uRes = normalizeAlg(trinAdvInputs.final);

    if (uRes !== normalizeAlg(expRes)) {
      setIsError(true);
      onMistake('Fattorizzazione finale trinomio a!=1 errata');
      setFeedback('⚠️ Raccogli a due a due i fattori ed estrai la parentesi comune per ottenere il prodotto di binomi.');
      return;
    }

    onMoveAction();
    setHistory(h => [...h, expRes]);
    setIsSolved(true);
    setFinalResultStr(expRes);
    setFeedback(`🏆 Trinomio con a ≠ 1 scomposto con successo: ${expRes}!`);
    setIsError(false);
    onWin(expRes, history.length + 1);
  };

  // --- VERIFICA CUBO DI BINOMIO (4 TERMINI) ---
  const handleVerifyCubeBinom = () => {
    const expBaseA = metadata?.baseA || 'x';
    const expBaseB = metadata?.baseB || '2';
    const expSign = metadata?.sign || '+';

    const uA = normalizeAlg(cubeBinomInputs.baseA);
    const uB = normalizeAlg(cubeBinomInputs.baseB);
    const uS = cubeBinomInputs.sign;

    if (uA !== normalizeAlg(expBaseA)) {
      setIsError(true);
      onMistake('Base A cubo errata');
      setFeedback('⚠️ Radice cubica del primo termine non corretta.');
      return;
    }
    if (uB !== normalizeAlg(expBaseB)) {
      setIsError(true);
      onMistake('Base B cubo errata');
      setFeedback('⚠️ Radice cubica dell\'ultimo termine non corretta.');
      return;
    }
    if (uS !== (expSign === '-' ? '−' : expSign) && uS !== expSign) {
      setIsError(true);
      onMistake('Segno cubo binomio errato');
      setFeedback('⚠️ Controlla l\'alternanza dei segni dei termini.');
      return;
    }

    onMoveAction();
    const finalStr = `(${expBaseA} ${expSign} ${expBaseB})³`;
    setHistory(h => [...h, finalStr]);
    setIsSolved(true);
    setFinalResultStr(finalStr);
    setFeedback(`🏆 Cubo di binomio verificato con successo: ${finalStr}!`);
    setIsError(false);
    onWin(finalStr, history.length + 1);
  };

  // --- VERIFICA RAGGRUPPAMENTO 3+1 (4 TERMINI) ---
  const handleVerifyGroup31Step1 = () => {
    const expSq = metadata?.sqTrinom || '(x+3)²';
    const uSq = normalizeAlg(group31Inputs.sqTrinom);

    if (uSq !== normalizeAlg(expSq) && uSq !== normalizeAlg(expSq).replace('²', '2')) {
      setIsError(true);
      onMistake('Quadrato trinomio 3+1 errato');
      setFeedback('⚠️ I primi 3 termini formano un quadrato di binomio: riconosci le due basi e verifica il doppio prodotto.');
      return;
    }

    onMoveAction();
    setGroup31Step(2);
    setHistory(h => [...h, `${expSq} − y²`]);
    setFeedback(`✨ Corretto! Ora hai la differenza di due quadrati: componi il prodotto di somma per differenza.`);
    setIsError(false);
  };

  const handleVerifyGroup31Step2 = () => {
    const expRes = metadata?.finalResult || '(x+3-y)(x+3+y)';
    const uRes = normalizeAlg(group31Inputs.finalRes);

    if (uRes !== normalizeAlg(expRes)) {
      setIsError(true);
      onMistake('Differenza quadrati 3+1 errata');
      setFeedback('⚠️ Ricorda: [Quadrato A] − [Quadrato B] = (A − B)(A + B).');
      return;
    }

    onMoveAction();
    setHistory(h => [...h, expRes]);
    setIsSolved(true);
    setFinalResultStr(expRes);
    setFeedback(`🏆 Raggruppamento (3+1) completato: ${expRes}!`);
    setIsError(false);
    onWin(expRes, history.length + 1);
  };

  // --- VERIFICA RAGGRUPPAMENTO 3+2 (5 TERMINI) ---
  const handleVerifyGroup32Step1 = () => {
    const expTri = metadata?.triStep || '(x+3)²';
    const expLin = metadata?.linStep || '4(x+3)';

    const uTri = normalizeAlg(group32Inputs.triStep);
    const uLin = normalizeAlg(group32Inputs.linStep);

    if (uTri !== normalizeAlg(expTri) && uTri !== normalizeAlg(expTri).replace('²', '2')) {
      setIsError(true);
      onMistake('Terna quadrato 3+2 errata');
      setFeedback('⚠️ I primi 3 termini formano un quadrato di binomio: controlla le basi.');
      return;
    }
    if (uLin !== normalizeAlg(expLin)) {
      setIsError(true);
      onMistake('Coppia lineare 3+2 errata');
      setFeedback('⚠️ Negli ultimi due termini raccogli il fattore comune numerico in modo da lasciare la stessa parentesi.');
      return;
    }

    onMoveAction();
    setGroup32Step(2);
    setHistory(h => [...h, `${expTri} + ${expLin}`]);
    setFeedback(`✨ Bravissimo! Entrambe le parti contengono la stessa parentesi. Raccogli il fattore comune per concludere.`);
    setIsError(false);
  };

  const handleVerifyGroup32Step2 = () => {
    const expRes = metadata?.finalResult || '(x+3)(x+7)';
    const uRes = normalizeAlg(group32Inputs.finalRes);

    if (uRes !== normalizeAlg(expRes)) {
      setIsError(true);
      onMistake('Fattorizzazione finale 3+2 errata');
      setFeedback('⚠️ Raccogli la parentesi comune e somma i termini rimanenti.');
      return;
    }

    onMoveAction();
    setHistory(h => [...h, expRes]);
    setIsSolved(true);
    setFinalResultStr(expRes);
    setFeedback(`🏆 Raggruppamento a 5 termini (3+2) completato: ${expRes}!`);
    setIsError(false);
    onWin(expRes, history.length + 1);
  };

  // --- VERIFICA RUFFINI 4° GRADO A 5 TERMINI (5 TERMINI) ---
  const handleVerifyRuffiniStep1 = () => {
    const expRoot = metadata?.root || '1';
    const uRoot = normalizeAlg(ruffiniInputs.root);

    if (uRoot !== normalizeAlg(expRoot)) {
      setIsError(true);
      onMistake('Zero del polinomio Ruffini errato');
      setFeedback('⚠️ Il valore inserito non annulla il polinomio P(c) ≠ 0! Prova con i divisori positivi e negativi del termine noto.');
      return;
    }

    onMoveAction();
    setRuffiniStep(2);
    const divisor = metadata?.divisor || 'x-1';
    setHistory(h => [...h, `Zero trovato: c = ${expRoot} ➔ Divisore: (${divisor})`]);
    setFeedback(`✨ Zero confermato! Ora inserisci il quoziente abbassato di grado ottenuto con la griglia di Ruffini.`);
    setIsError(false);
  };

  const handleVerifyRuffiniStep2 = () => {
    const expQuot = metadata?.quotient || 'x³+2x²-5x-6';
    const expRes = metadata?.finalResult || '(x-1)(x³+2x²-5x-6)';
    const uQuot = normalizeAlg(ruffiniInputs.quot);

    if (uQuot !== normalizeAlg(expQuot) && uQuot !== normalizeAlg(expQuot).replace('²', '2').replace('³', '3')) {
      setIsError(true);
      onMistake('Quoziente Ruffini errato');
      setFeedback('⚠️ Coefficienti del quoziente non corretti: verifica i calcoli riga per riga della tabella di Ruffini.');
      return;
    }

    onMoveAction();
    setHistory(h => [...h, expRes]);
    setIsSolved(true);
    setFinalResultStr(expRes);
    setFeedback(`🏆 Scomposizione con Ruffini completata con successo: ${expRes}!`);
    setIsError(false);
    onWin(expRes, history.length + 1);
  };

  // --- VERIFICA RACCOGLIMENTO TOTALE SU 5 TERMINI (5 TERMINI) ---
  const handleVerifyMcd5 = () => {
    const expMcd = metadata?.mcd || '2';
    const expQuot = metadata?.quot || 'x⁴-2x³+3x²-4x+5';
    const expRes = metadata?.finalResult || '2(x⁴-2x³+3x²-4x+5)';

    const uMcd = normalizeAlg(mcd5Inputs.mcd);
    const uQuot = normalizeAlg(mcd5Inputs.quot);

    if (uMcd !== normalizeAlg(expMcd)) {
      setIsError(true);
      onMistake('MCD 5 termini errato');
      setFeedback('⚠️ Trova il massimo divisore comune a tutti e 5 i termini del polinomio.');
      return;
    }
    if (uQuot !== normalizeAlg(expQuot) && uQuot !== normalizeAlg(expQuot).replace('²', '2').replace('³', '3').replace('⁴', '4')) {
      setIsError(true);
      onMistake('Quoziente 5 termini errato');
      setFeedback('⚠️ Dividi ciascuno dei 5 termini per il fattore comune raccolto.');
      return;
    }

    onMoveAction();
    setHistory(h => [...h, expRes]);
    setIsSolved(true);
    setFinalResultStr(expRes);
    setFeedback(`🏆 Raccoglimento totale su 5 termini completato: ${expRes}!`);
    setIsError(false);
    onWin(expRes, history.length + 1);
  };

  // =========================================================================
  // GESTORI EVENTI PUNTATORE (DRAG & DROP ATOMICO)
  // =========================================================================
  const startDrag = (e: React.PointerEvent, id: string, text: string, color: string) => {
    e.preventDefault();
    updateEqualPos();
    setDraggedTokenId(id);
    setDraggedTokenText(text);
    setDraggedTokenColor(color);
    setDragPos({ x: e.clientX, y: e.clientY });
    setIsCrossedEqual(equalDividerX.current > 0 ? (e.clientX > equalDividerX.current) : false);
  };

  const finishDrag = useCallback((dropX: number, dropY: number) => {
    if (!draggedTokenId) return;

    const tokenId = draggedTokenId;
    setDraggedTokenId(null);
    setDragPos(null);
    setHoverDropZone(null);
    setIsCrossedEqual(false);

    const el = document.elementFromPoint(dropX, dropY);
    const dropZone = el?.closest('[data-drop-zone]')?.getAttribute('data-drop-zone');

    updateEqualPos();
    const isPastEqual = equalDividerX.current > 0 ? (dropX > equalDividerX.current) : false;
    const isLeftOfEqual = equalDividerX.current > 0 ? (dropX < equalDividerX.current) : false;

    // GESTIONE DRAG DAI TOKEN DELLA PALETTE NEI VARI SLOT
    if (tokenId.startsWith('palette-')) {
      const sym = draggedTokenText;
      if (dropZone) {
        if (dropZone === 'trinom-bin-1') {
          setTrinomSlots(prev => ({ ...prev, d1: sym }));
          onMoveAction();
          return;
        }
        if (dropZone === 'trinom-bin-2') {
          setTrinomSlots(prev => ({ ...prev, d2: sym }));
          onMoveAction();
          return;
        }
        if (dropZone === 'slot-base-a') {
          setDiffSqBases(prev => ({ ...prev, a: sym }));
          onMoveAction();
          return;
        }
        if (dropZone === 'slot-base-b') {
          setDiffSqBases(prev => ({ ...prev, b: sym }));
          onMoveAction();
          return;
        }
        if (dropZone === 'conjugate-slot-a') {
          setDiffSqSlots(prev => ({ ...prev, a: sym }));
          onMoveAction();
          return;
        }
        if (dropZone === 'conjugate-slot-b') {
          setDiffSqSlots(prev => ({ ...prev, b: sym }));
          onMoveAction();
          return;
        }

        const targetSlot = dropZone.replace('slot-', '');
        insertSymbol(sym, targetSlot);
        onMoveAction();
        return;
      }
    }

    // =======================================================================
    // 1. EQUAZIONI: LOGICA DI TRASPORTO, POSIZIONAMENTO DOPO IL NUMERO E FRAZIONI
    // =======================================================================
    if (isEquation) {
      // A. TRASPORTO DEL SEGNO DI COSTANTE (LHS -> RHS):
      // "Se sposto il segno dall'altra parte dell'uguale deve cambiare segno.
      // Poi lo devo forzatamente mettere dopo il numero che già c'è."
      if (tokenId === 'lhs-sign-token') {
        const invertedSign = lhsSign === '+' ? '−' : '+';

        // Deve essere rilasciato NELLO SLOT SUBITO DOPO IL NUMERO BASE (es. dopo il 14 o dopo l'8)
        if (dropZone === 'rhs-slot-sign-after-base') {
          onMoveAction();
          setLhsSign(null);
          setRhsTransportedSign(invertedSign);
          const newLine = `${lhsCoeff}${lhsVar} ${lhsNum ? `[ ] ${lhsNum}` : ''} = ${rhsBaseNum} ${invertedSign} ...`;
          setHistory(h => [...h, `${lhsCoeff}${lhsVar} = ${rhsBaseNum} ${invertedSign} ...`]);
          setFeedback(`✨ Segno trasportato oltre l'uguale: è cambiato in [${invertedSign}] ed è stato posizionato dopo ${rhsBaseNum}!`);
          setIsError(false);
          return;
        } else if (isPastEqual) {
          setIsError(true);
          setFeedback(`⚠️ Devi posizionarlo forzatamente nello slot DOPO il numero ${rhsBaseNum} già presente!`);
          onMistake('Posizionamento segno errato: deve andare dopo il termine presente');
          return;
        } else {
          return;
        }
      }

      // B. TRASPORTO DEL NUMERO COSTANTE (LHS -> RHS):
      // Deve andare subito dopo il segno appena posizionato (es. 14 − 6)
      if (tokenId === 'lhs-num-token') {
        if (!rhsTransportedSign) {
          setIsError(true);
          setFeedback('⚠️ Prima sposta il segno oltre l\'uguale (cambierà segno) e posizionalo dopo il numero, poi sposta il numero!');
          onMistake('Ordine di trasporto errato');
          return;
        }

        if (dropZone === 'rhs-slot-num-after-sign') {
          onMoveAction();
          const numVal = lhsNum!;
          setLhsNum(null);
          setRhsTransportedNum(numVal);
          const newLine = `${lhsCoeff}${lhsVar} = ${rhsBaseNum} ${rhsTransportedSign} ${numVal}`;
          setHistory(h => [...h, newLine]);
          setFeedback(`✨ Numero ${numVal} posizionato dopo il segno: ${rhsBaseNum} ${rhsTransportedSign} ${numVal}! Ora trascinalo sul ${rhsBaseNum} per calcolare.`);
          setIsError(false);
          return;
        } else if (isPastEqual) {
          setIsError(true);
          setFeedback(`⚠️ Posizionalo forzatamente nello slot DOPO il segno [${rhsTransportedSign}]!`);
          onMistake('Posizionamento numero errato: deve andare dopo il segno');
          return;
        } else {
          return;
        }
      }

      // C. FUSIONE E CALCOLO NUMERICO SUL MEMBRO DESTRO: (14 − 6 = 8 o 8 + 7 = 15)
      if (tokenId === 'rhs-transported-num-token') {
        if (dropZone === 'rhs-base-num-target' || dropZone === 'rhs-calc-zone') {
          onMoveAction();
          const n1 = parseInt(rhsBaseNum, 10);
          const n2 = parseInt(rhsTransportedNum!, 10);
          const isMinus = rhsTransportedSign === '−';
          const calculated = isMinus ? (n1 - n2) : (n1 + n2);

          setRhsBaseNum(calculated.toString());
          setRhsTransportedSign(null);
          setRhsTransportedNum(null);

          const newLine = `${lhsCoeff}${lhsVar} = ${calculated}`;
          setHistory(h => [...h, newLine]);
          setFeedback(`⚡ Calcolato: ${n1} ${rhsTransportedSign} ${n2} = ${calculated}!`);
          setIsError(false);
          return;
        }
      }

      // D. TRASPORTO DEL TERMINE CON X DA DESTRA A SINISTRA (RHS -> LHS, es. 2x in 5x - 7 = 2x + 8):
      if (tokenId === 'rhs-var-token') {
        if (dropZone === 'lhs-slot-var-after-base' || isLeftOfEqual) {
          onMoveAction();
          const cVal = rhsVarCoeff || '1';
          setRhsVarCoeff(null);
          setLhsTransportedVarSign('−');
          setLhsTransportedVarCoeff(cVal);

          const newLine = `${lhsCoeff}${lhsVar} − ${cVal}${lhsVar} ... = ${rhsBaseNum}`;
          setHistory(h => [...h, newLine]);
          setFeedback(`✨ Termine ${cVal}x trasportato a sinistra: è diventato −${cVal}x ed è posizionato dopo ${lhsCoeff}x! Trascinalo su ${lhsCoeff} per unire i termini simili.`);
          setIsError(false);
          return;
        }
      }

      // E. FUSIONE TERMINI CON X SU LHS (5x − 2x = 3x):
      if (tokenId === 'lhs-transported-var-token') {
        if (dropZone === 'lhs-coeff-target' || dropZone === 'lhs-zone') {
          onMoveAction();
          const c1 = parseInt(lhsCoeff, 10);
          const c2 = parseInt(lhsTransportedVarCoeff!, 10);
          const mergedCoeff = (c1 - c2).toString();

          setLhsCoeff(mergedCoeff);
          setLhsTransportedVarSign(null);
          setLhsTransportedVarCoeff(null);

          const newLine = `${mergedCoeff}${lhsVar} = ${rhsBaseNum}`;
          setHistory(h => [...h, newLine]);
          setFeedback(`⚡ Termini simili uniti: ${c1}x − ${c2}x = ${mergedCoeff}x!`);
          setIsError(false);
          return;
        }
      }

      // F. INSERIMENTO SEGNO DI FRAZIONE: (trascina il coefficiente sotto il numero calcolato)
      if (
        tokenId === 'lhs-coeff-token' &&
        !lhsNum &&
        !lhsSign &&
        !rhsTransportedSign &&
        !rhsTransportedNum &&
        !rhsVarCoeff &&
        !lhsTransportedVarCoeff
      ) {
        if (dropZone === 'fraction-slot-under-rhs' || dropZone === 'fraction-bar-zone' || isPastEqual) {
          onMoveAction();
          const coeffVal = lhsCoeff;
          const numVal = rhsBaseNum;

          setFractionActive(true);
          setFractionNum(numVal);
          setFractionDen(coeffVal);

          const stepFrac = `x = ${numVal} / ${coeffVal}`;
          setHistory(h => [...h, stepFrac]);
          setFeedback(`✨ Segno di frazione inserito: x = ${numVal} / ${coeffVal}. Trascina ${coeffVal} sopra ${numVal} per semplificare (oppure a sinistra per invertire)!`);
          setIsError(false);
          return;
        }
      }

      // G. "E VICEVERSA" FRAZIONE:
      // Riporta il denominatore a sinistra per tornare a moltiplicare (2x = 8)
      if (fractionActive && tokenId === 'fraction-den-token') {
        if (isLeftOfEqual || dropZone === 'lhs-zone') {
          onMoveAction();
          const dVal = fractionDen;
          const nVal = fractionNum;

          setFractionActive(false);
          setLhsCoeff(dVal);
          setRhsBaseNum(nVal);

          const stepRevert = `${dVal}x = ${nVal}`;
          setHistory(h => [...h, stepRevert]);
          setFeedback(`🔄 Operazione inversa: il denominatore ${dVal} è tornato a sinistra moltiplicando la x: ${dVal}x = ${nVal}!`);
          setIsError(false);
          return;
        }

        // Semplificazione frazione: trascina il denominatore sul numeratore
        if (dropZone === 'fraction-num-target' || dropZone === 'fraction-bar-zone') {
          onMoveAction();
          const num = parseInt(fractionNum, 10);
          const den = parseInt(fractionDen, 10);
          const res = (num % den === 0) ? (num / den).toString() : (num / den).toFixed(2);
          const finalStr = `x = ${res}`;
          setHistory(h => [...h, finalStr]);
          setIsSolved(true);
          setFinalResultStr(finalStr);
          setFeedback(`🏆 Frazione semplificata con successo: x = ${res}!`);
          setIsError(false);
          onWin(finalStr, history.length + 1);
          return;
        }
      }
    }

    // =======================================================================
    // 2. SCOMPOSIZIONI: DIFFERENZA DI QUADRATI
    // =======================================================================
    if (subType === 'diff_squares' || initialTitle.includes('− x²') || initialTitle.includes('− 4x²') || initialTitle.includes('x² − 16')) {
      if (tokenId === 'sq-token-a' && dropZone === 'slot-base-a') {
        onMoveAction();
        const baseVal = metadata?.baseA || (initialTitle.includes('25') ? '5' : (initialTitle.includes('9') ? '3' : 'x'));
        setDiffSqBases(prev => ({ ...prev, a: baseVal }));
        setHistory(h => [...h, `Base A: √ = ${baseVal}`]);
        return;
      }
      if (tokenId === 'sq-token-b' && dropZone === 'slot-base-b') {
        onMoveAction();
        const baseVal = metadata?.baseB || (initialTitle.includes('4x²') ? '2x' : (initialTitle.includes('16') ? '4' : 'x'));
        setDiffSqBases(prev => ({ ...prev, b: baseVal }));
        setHistory(h => [...h, `Base B: √ = ${baseVal}`]);
        return;
      }
      if (tokenId === 'chip-placed-a' && dropZone === 'conjugate-slot-a') {
        onMoveAction();
        const baseVal = diffSqBases.a;
        setDiffSqSlots(prev => {
          const up = { ...prev, a: baseVal };
          if (up.b) {
            const final = `(${up.a} − ${up.b})(${up.a} + ${up.b})`;
            setHistory(h => [...h, final]);
            setIsSolved(true);
            setFinalResultStr(final);
            onWin(final, history.length + 1);
          }
          return up;
        });
        return;
      }
      if (tokenId === 'chip-placed-b' && dropZone === 'conjugate-slot-b') {
        onMoveAction();
        const baseVal = diffSqBases.b;
        setDiffSqSlots(prev => {
          const up = { ...prev, b: baseVal };
          if (up.a) {
            const final = `(${up.a} − ${up.b})(${up.a} + ${up.b})`;
            setHistory(h => [...h, final]);
            setIsSolved(true);
            setFinalResultStr(final);
            onWin(final, history.length + 1);
          }
          return up;
        });
        return;
      }
    }

    // =======================================================================
    // 4. SCOMPOSIZIONI: TRINOMIO NOTEVOLE (SOMMA E PRODOTTO)
    // =======================================================================
    if (subType === 'trinomial' || initialTitle.includes('x² + 5x + 6') || initialTitle.includes('x² − 7x + 12')) {
      if (tokenId.startsWith('trinom-chip-')) {
        const val = tokenId.replace('trinom-chip-', '');
        const targetD1 = metadata?.d1 || (initialTitle.includes('+ 5x') ? '+2' : '−3');
        const targetD2 = metadata?.d2 || (initialTitle.includes('+ 5x') ? '+3' : '−4');

        if (dropZone === 'trinom-bin-1') {
          onMoveAction();
          setTrinomSlots(prev => {
            const up = { ...prev, d1: val };
            if (up.d2) {
              const isMatch = (up.d1 === targetD1 && up.d2 === targetD2) || (up.d1 === targetD2 && up.d2 === targetD1);
              if (isMatch) {
                const final = `(x ${up.d1})(x ${up.d2})`;
                setHistory(h => [...h, final]);
                setIsSolved(true);
                setFinalResultStr(final);
                onWin(final, history.length + 1);
              } else {
                setIsError(true);
                onMistake('Coppia trinomio errata');
                setFeedback(`⚠️ Questa coppia di numeri non soddisfa la somma e il prodotto richiesti!`);
              }
            }
            return up;
          });
          return;
        }
        if (dropZone === 'trinom-bin-2') {
          onMoveAction();
          setTrinomSlots(prev => {
            const up = { ...prev, d2: val };
            if (up.d1) {
              const isMatch = (up.d1 === targetD1 && up.d2 === targetD2) || (up.d1 === targetD2 && up.d2 === targetD1);
              if (isMatch) {
                const final = `(x ${up.d1})(x ${up.d2})`;
                setHistory(h => [...h, final]);
                setIsSolved(true);
                setFinalResultStr(final);
                onWin(final, history.length + 1);
              } else {
                setIsError(true);
                onMistake('Coppia trinomio errata');
                setFeedback(`⚠️ Questa coppia di numeri non soddisfa la somma e il prodotto richiesti!`);
              }
            }
            return up;
          });
          return;
        }
      }
    }
  }, [
    draggedTokenId,
    isEquation,
    lhsSign,
    lhsNum,
    lhsCoeff,
    lhsVar,
    rhsBaseNum,
    rhsVarCoeff,
    rhsTransportedSign,
    rhsTransportedNum,
    lhsTransportedVarCoeff,
    fractionActive,
    fractionNum,
    fractionDen,
    diffSqBases,
    initialTitle,
    history,
    onMoveAction,
    onWin,
    onMistake,
    updateEqualPos,
  ]);

  // Window Listeners per il Dragging fluido
  useEffect(() => {
    if (!draggedTokenId) return;

    const onPointerMove = (e: PointerEvent) => {
      setDragPos({ x: e.clientX, y: e.clientY });

      const isAcross = equalDividerX.current > 0 ? (e.clientX > equalDividerX.current) : false;
      setIsCrossedEqual(isAcross);

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const target = el?.closest('[data-drop-zone]')?.getAttribute('data-drop-zone') || null;
      setHoverDropZone(target);
    };

    const onPointerUp = (e: PointerEvent) => {
      finishDrag(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: false });
    window.addEventListener('pointerup', onPointerUp, { passive: false });
    window.addEventListener('pointercancel', onPointerUp, { passive: false });

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
    };
  }, [draggedTokenId, finishDrag]);

  // Listener tastiera fisica per digitare direttamente nello slot attivo
  useEffect(() => {
    if (isEquation) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }
      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClearSlot();
      } else if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', 'x', 'y', '(', ')'].includes(e.key)) {
        e.preventDefault();
        const sym = e.key === '-' ? '−' : e.key;
        insertSymbol(sym);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [lastFocusedInput, isEquation]);

  // Helper grafico per renderizzare uno slot algebrico tattile
  const renderMathSlot = (
    slotId: string,
    value: string,
    placeholder: string,
    color: string = '#00f0ff',
    width: string = '130px',
    label?: string
  ) => {
    const isActive = (lastFocusedInput === slotId) || (!lastFocusedInput && getDefaultActiveSlot() === slotId);
    const isHovered = hoverDropZone === slotId || hoverDropZone === `slot-${slotId}`;

    return (
      <div
        key={slotId}
        data-drop-zone={slotId}
        onClick={() => setLastFocusedInput(slotId)}
        style={{
          display: 'inline-flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          margin: '0 4px',
          position: 'relative',
        }}
      >
        {label && (
          <span style={{ fontSize: '0.78rem', color: color, fontWeight: 800, marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {label}
          </span>
        )}
        <div
          data-drop-zone={slotId}
          style={{
            minWidth: width,
            minHeight: '52px',
            padding: '0.4rem 0.8rem',
            borderRadius: '14px',
            background: isActive ? 'rgba(0, 240, 255, 0.15)' : (isHovered ? 'rgba(251, 191, 36, 0.18)' : '#0c1222'),
            border: `2px ${isActive ? 'solid #00f0ff' : (isHovered ? 'dashed #fbbf24' : 'solid ' + color)}`,
            boxShadow: isActive ? '0 0 20px rgba(0, 240, 255, 0.45)' : (isHovered ? '0 0 18px rgba(251, 191, 36, 0.5)' : 'none'),
            color: color,
            fontFamily: 'var(--font-math)',
            fontSize: '1.9rem',
            fontWeight: 900,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease',
            userSelect: 'none',
          }}
        >
          {value || <span style={{ color: 'rgba(148, 163, 184, 0.45)', fontSize: '1.15rem', fontStyle: 'italic', fontWeight: 600 }}>{placeholder}</span>}
        </div>
      </div>
    );
  };

  // Pannello Tessere e Simboli Algebrici (Palette Tattile da cui estrapolare/trascinare/toccare)
  const renderMathTokenPalette = () => {
    const activeSlot = lastFocusedInput || getDefaultActiveSlot();
    const activeSlotLabel = getSlotDisplayName(activeSlot);
    const contextualChips = getContextualChips();

    return (
      <div
        style={{
          marginTop: '1.8rem',
          width: '100%',
          maxWidth: '820px',
          background: 'rgba(10, 15, 30, 0.95)',
          border: '1.5px solid rgba(56, 189, 248, 0.35)',
          borderRadius: '20px',
          padding: '1.2rem 1.4rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Intestazione Pannello con indicatore slot attivo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🧮</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#38bdf8', letterSpacing: '0.5px' }}>
              PANNELLO TESSERE & SIMBOLI (Trascina o tocca per inserire)
            </span>
          </div>

          <div style={{
            fontSize: '0.85rem',
            color: activeSlot ? '#6ee7b7' : '#94a3b8',
            fontWeight: 700,
            background: 'rgba(16, 185, 129, 0.12)',
            padding: '0.25rem 0.75rem',
            borderRadius: '8px',
            border: '1px solid rgba(16, 185, 129, 0.3)',
          }}>
            🎯 Inserimento in: <strong>{activeSlotLabel}</strong>
          </div>
        </div>

        {/* Tessere contestuali dell'esercizio (se presenti) */}
        {contextualChips.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', paddingBottom: '0.6rem', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: '0.82rem', color: '#fbbf24', fontWeight: 800, textTransform: 'uppercase' }}>
              ⭐ Tessere Rapide:
            </span>
            {contextualChips.map((chip, idx) => (
              <div
                key={idx}
                onPointerDown={e => startDrag(e, `palette-chip-${chip}`, chip, '#fbbf24')}
                onClick={() => insertSymbol(chip)}
                className="notebook-token"
                style={{
                  padding: '0.4rem 0.9rem',
                  fontSize: '1.4rem',
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

        {/* Tastiera Tattile: Numeri, Variabili, Operatori, Parentesi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {/* Fila 1: Numeri da 0 a 9 */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map(num => (
              <button
                key={num}
                type="button"
                onPointerDown={e => startDrag(e, `palette-num-${num}`, num, '#fbbf24')}
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
                  cursor: 'grab',
                  transition: 'all 0.1s ease',
                }}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Fila 2: Lettere, Potenze, Segni, Parentesi, Cancellazione */}
          <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {['x', 'x²', 'x³', 'x⁴', 'y'].map(v => (
              <button
                key={v}
                type="button"
                onPointerDown={e => startDrag(e, `palette-var-${v}`, v, '#00f0ff')}
                onClick={() => insertSymbol(v)}
                style={{
                  minWidth: '42px',
                  height: '42px',
                  padding: '0 0.5rem',
                  borderRadius: '10px',
                  background: 'rgba(0, 240, 255, 0.08)',
                  border: '1.5px solid rgba(0, 240, 255, 0.35)',
                  color: '#00f0ff',
                  fontFamily: 'var(--font-math)',
                  fontSize: '1.3rem',
                  fontWeight: 900,
                  cursor: 'grab',
                }}
              >
                {v}
              </button>
            ))}

            {['+', '−'].map(s => (
              <button
                key={s}
                type="button"
                onPointerDown={e => startDrag(e, `palette-sign-${s}`, s, '#f87171')}
                onClick={() => insertSymbol(s)}
                style={{
                  minWidth: '42px',
                  height: '42px',
                  padding: '0 0.5rem',
                  borderRadius: '10px',
                  background: 'rgba(248, 113, 113, 0.1)',
                  border: '1.5px solid rgba(248, 113, 113, 0.4)',
                  color: '#f87171',
                  fontFamily: 'var(--font-math)',
                  fontSize: '1.4rem',
                  fontWeight: 900,
                  cursor: 'grab',
                }}
              >
                {s}
              </button>
            ))}

            {['(', ')', '²', '³'].map(p => (
              <button
                key={p}
                type="button"
                onPointerDown={e => startDrag(e, `palette-paren-${p}`, p, '#c084fc')}
                onClick={() => insertSymbol(p)}
                style={{
                  minWidth: '42px',
                  height: '42px',
                  padding: '0 0.5rem',
                  borderRadius: '10px',
                  background: 'rgba(192, 132, 252, 0.08)',
                  border: '1.5px solid rgba(192, 132, 252, 0.35)',
                  color: '#c084fc',
                  fontFamily: 'var(--font-math)',
                  fontSize: '1.35rem',
                  fontWeight: 900,
                  cursor: 'grab',
                }}
              >
                {p}
              </button>
            ))}

            {/* Backspace & Svuota */}
            <button
              type="button"
              onClick={handleBackspace}
              style={{
                minWidth: '60px',
                height: '42px',
                padding: '0 0.6rem',
                borderRadius: '10px',
                background: 'rgba(239, 68, 68, 0.15)',
                border: '1.5px solid #ef4444',
                color: '#fca5a5',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ⌫ Canc
            </button>

            <button
              type="button"
              onClick={handleClearSlot}
              style={{
                minWidth: '55px',
                height: '42px',
                padding: '0 0.6rem',
                borderRadius: '10px',
                background: 'rgba(100, 116, 139, 0.15)',
                border: '1.5px solid #64748b',
                color: '#cbd5e1',
                fontSize: '0.95rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              C Svuota
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      ref={boardRef}
      style={{
        width: '100%',
        maxWidth: '960px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        touchAction: 'none',
      }}
    >
      {/* QUADERNO A QUADRETTI */}
      <div
        className="notebook-grid"
        style={{
          borderRadius: '24px',
          border: '2px solid var(--border-paper)',
          padding: '2rem',
          minHeight: '450px',
          boxShadow: '0 15px 45px rgba(0, 0, 0, 0.55)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Intestazione Quaderno Semplificata */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1.5px solid rgba(56, 189, 248, 0.2)',
          paddingBottom: '0.85rem',
          marginBottom: '1.25rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.3rem' }}>📓</span>
            <span style={{ fontWeight: 800, fontSize: '1.05rem', color: '#38bdf8', letterSpacing: '0.3px' }}>
              {isEquation
                ? 'Equazioni di 1° Grado'
                : subType === 'sum_cubes'
                  ? 'Somma di Due Cubi'
                  : subType === 'diff_cubes'
                    ? 'Differenza di Due Cubi'
                    : (subType === 'mixed_mcd_squares' || initialTitle.includes('−2x² + 8'))
                      ? 'MCD + Differenza di Quadrati'
                      : subType === 'diff_squares'
                        ? 'Differenza di Due Quadrati'
                        : (subType === 'common_mcd' || initialTitle.includes('MCD'))
                          ? 'Raccoglimento a Fattor Comune (MCD)'
                          : subType === 'square_binomial'
                            ? 'Quadrato di Binomio'
                            : subType === 'trinomial'
                              ? 'Trinomio Particolare (Somma e Prodotto)'
                              : subType === 'mixed_mcd_trinomial'
                                ? 'MCD + Trinomio Notevole'
                                : subType === 'trinomial_advanced'
                                  ? 'Trinomio con a ≠ 1 (Sdoppiamento)'
                                  : (subType === 'partial_grouping' || initialTitle.includes('2x³'))
                                    ? 'Raccoglimento Parziale a 4 Termini'
                                    : subType === 'cube_binomial'
                                      ? 'Cubo di Binomio'
                                      : subType === 'grouping_3_1'
                                        ? 'Raggruppamento (3+1 Termini)'
                                        : subType === 'grouping_3_2'
                                          ? 'Raggruppamento (3+2 Termini)'
                                          : subType === 'ruffini_degree4'
                                            ? 'Scomposizione con Regola di Ruffini'
                                            : subType === 'mcd_5terms'
                                              ? 'Raccoglimento Totale su 5 Termini'
                                              : 'Calcolo Algebrico'}
            </span>
          </div>

          <div style={{ fontSize: '0.92rem', color: '#94a3b8', fontFamily: 'var(--font-math)' }}>
            Obiettivo: <strong style={{ color: '#fbbf24', fontSize: '1.1rem' }}>{par}</strong> {par === 1 ? 'mossa' : 'mosse'}
          </div>
        </div>

        {/* Cronologia passaggi: SOLO se ci sono passaggi già effettuati */}
        {history.length > 1 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            marginBottom: '1.5rem',
            padding: '0.75rem 1.25rem',
            background: 'rgba(0, 0, 0, 0.25)',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.08)',
          }}>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '0.5px' }}>
              Passaggi completati:
            </span>
            {history.slice(0, -1).map((line, idx) => (
              <div key={idx} style={{ fontFamily: 'var(--font-math)', fontSize: '1.45rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#64748b', width: '24px' }}>#{idx + 1}</span>
                <span>{line}</span>
                <span style={{ color: '#10b981', fontSize: '1.1rem' }}>✓</span>
              </div>
            ))}
          </div>
        )}

        {/* ================================================================ */}
        {/* RIGA DI LAVORO FISICA (SEGNI SEPARATI, TRASPORTO ORDINATO)       */}
        {/* ================================================================ */}
        {!isSolved ? (
          <div>
            {/* ---------------- 1. EQUAZIONI (LOGICA DI TRASPORTO SINTATTICO) ---------------- */}
            {isEquation && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: isError ? '2px solid #ef4444' : '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                {/* Guida semplice */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>Sposta le x a sinistra e i numeri a destra (il segno cambia oltre =), poi semplifica</span>
                </div>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                  gap: '1.5rem',
                  position: 'relative',
                  width: '100%',
                }}>
                  {/* LATO SINISTRO (LHS) */}
                  <div
                    data-drop-zone="lhs-zone"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '16px',
                      minHeight: '85px',
                      minWidth: '160px',
                      background: hoverDropZone === 'lhs-zone' ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: hoverDropZone === 'lhs-zone' ? '2px dashed #00f0ff' : '1px dashed rgba(255, 255, 255, 0.15)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {fractionActive ? (
                      <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.8rem', fontWeight: 900, color: '#00f0ff' }}>
                        x
                      </span>
                    ) : (
                      <>
                        {/* Coefficiente di x (afferrabile quando non ci sono altri termini a sinistra) */}
                        <div
                          data-drop-zone="lhs-coeff-target"
                          onPointerDown={e => startDrag(e, 'lhs-coeff-token', lhsCoeff, '#fbbf24')}
                          style={{
                            padding: '0.75rem 1.1rem',
                            borderRadius: '14px',
                            background: '#0c1222',
                            border: (!lhsNum && !lhsSign && !rhsVarCoeff && !lhsTransportedVarCoeff) ? '2.5px solid #fbbf24' : '1.5px solid #fbbf2450',
                            color: '#fbbf24',
                            fontFamily: 'var(--font-math)',
                            fontSize: '2.5rem',
                            fontWeight: 900,
                            cursor: 'grab',
                            boxShadow: (!lhsNum && !lhsSign && !rhsVarCoeff && !lhsTransportedVarCoeff) ? '0 0 18px rgba(251, 191, 36, 0.5)' : 'none',
                            opacity: draggedTokenId === 'lhs-coeff-token' ? 0.25 : 1,
                            touchAction: 'none',
                          }}
                          title={(!lhsNum && !lhsSign && !rhsVarCoeff && !lhsTransportedVarCoeff) ? 'Trascina sotto il numero a destra per inserire la frazione!' : 'Coefficiente'}
                        >
                          {lhsCoeff}
                        </div>

                        {/* Variabile x */}
                        <span style={{ fontFamily: 'var(--font-math)', fontSize: '2.5rem', fontWeight: 900, color: '#00f0ff', padding: '0 0.3rem' }}>
                          {lhsVar}
                        </span>

                        {/* Slot o Termine x trasportato da RHS (es. −2x dopo 5x) */}
                        {lhsTransportedVarCoeff ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ color: '#f87171', fontSize: '2.5rem', fontWeight: 900 }}>
                              {lhsTransportedVarSign || '−'}
                            </span>
                            <div
                              onPointerDown={e => startDrag(e, 'lhs-transported-var-token', `${lhsTransportedVarCoeff}x`, '#00f0ff')}
                              style={{
                                padding: '0.75rem 1.1rem',
                                borderRadius: '14px',
                                background: '#0c1222',
                                border: '2px solid #00f0ff',
                                color: '#00f0ff',
                                fontFamily: 'var(--font-math)',
                                fontSize: '2.5rem',
                                fontWeight: 900,
                                cursor: 'grab',
                                boxShadow: '0 0 16px rgba(0, 240, 255, 0.5)',
                                opacity: draggedTokenId === 'lhs-transported-var-token' ? 0.25 : 1,
                                touchAction: 'none',
                              }}
                              title="Trascina sul coefficiente principale per unire i termini con la x!"
                            >
                              {lhsTransportedVarCoeff}x
                            </div>
                          </div>
                        ) : (
                          rhsVarCoeff && (
                            <div
                              data-drop-zone="lhs-slot-var-after-base"
                              style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '999px',
                                border: hoverDropZone === 'lhs-slot-var-after-base' ? '2px dashed #00f0ff' : '1.5px dashed rgba(0, 240, 255, 0.3)',
                                background: hoverDropZone === 'lhs-slot-var-after-base' ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
                                color: '#00f0ff',
                                fontSize: '1.1rem',
                                fontFamily: 'var(--font-math)',
                              }}
                            >
                              [ Sposta termine x ]
                            </div>
                          )
                        )}

                        {/* Segno separato (es. +) */}
                        {lhsSign && (
                          <div
                            onPointerDown={e => startDrag(e, 'lhs-sign-token', lhsSign, lhsSign === '+' ? '#34d399' : '#f87171')}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: '0.6rem 1rem',
                              borderRadius: '999px',
                              background: '#0c1222',
                              border: `2.5px solid ${lhsSign === '+' ? '#34d399' : '#f87171'}`,
                              color: lhsSign === '+' ? '#34d399' : '#f87171',
                              fontFamily: 'var(--font-math)',
                              fontSize: '2.5rem',
                              fontWeight: 900,
                              cursor: 'grab',
                              boxShadow: `0 0 16px ${lhsSign === '+' ? '#34d39940' : '#f8717140'}`,
                              opacity: draggedTokenId === 'lhs-sign-token' ? 0.25 : 1,
                              touchAction: 'none',
                            }}
                            title="Trascina oltre l'uguale: cambierà segno in automatico e andrà posizionato subito dopo il numero a destra!"
                          >
                            {lhsSign}
                          </div>
                        )}

                        {/* Numero separato (es. 6) */}
                        {lhsNum && (
                          <div
                            onPointerDown={e => startDrag(e, 'lhs-num-token', lhsNum, '#fbbf24')}
                            style={{
                              padding: '0.75rem 1.3rem',
                              borderRadius: '14px',
                              background: '#0c1222',
                              border: '2px solid #fbbf24',
                              color: '#fbbf24',
                              fontFamily: 'var(--font-math)',
                              fontSize: '2.5rem',
                              fontWeight: 900,
                              cursor: 'grab',
                              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                              opacity: draggedTokenId === 'lhs-num-token' ? 0.25 : 1,
                              touchAction: 'none',
                            }}
                            title="Trascina a destra dell'uguale subito dopo il segno!"
                          >
                            {lhsNum}
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* SEGNO UGUALE */}
                  <div id="atomic-equal-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '0 0.85rem' }}>
                    <span style={{
                      fontFamily: 'var(--font-math)',
                      fontSize: '3.5rem',
                      fontWeight: 900,
                      color: 'var(--token-equal)',
                      textShadow: '0 0 20px rgba(192, 132, 252, 0.8)',
                    }}>
                      =
                    </span>
                  </div>

                  {/* LATO DESTRO (RHS) */}
                  <div
                    data-drop-zone="rhs-zone"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      padding: '0.75rem 1.25rem',
                      borderRadius: '16px',
                      minHeight: '85px',
                      minWidth: '180px',
                      background: hoverDropZone === 'rhs-zone' ? 'rgba(0, 240, 255, 0.12)' : 'rgba(255, 255, 255, 0.02)',
                      border: hoverDropZone === 'rhs-zone' ? '2px dashed #00f0ff' : '1px dashed rgba(255, 255, 255, 0.15)',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {fractionActive ? (
                      /* MODALITA' FRAZIONE ATTIVA (es. 8 / 2) */
                      <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        padding: '0.5rem 1.2rem',
                        background: 'rgba(56, 189, 248, 0.06)',
                        borderRadius: '16px',
                        border: '1.5px dashed rgba(56, 189, 248, 0.4)',
                      }}>
                        {/* Numeratore */}
                        <div
                          data-drop-zone="fraction-num-target"
                          style={{
                            fontFamily: 'var(--font-math)',
                            fontSize: '2.5rem',
                            fontWeight: 900,
                            color: '#fbbf24',
                            padding: '0 0.5rem',
                          }}
                        >
                          {fractionNum}
                        </div>

                        {/* Linea di frazione */}
                        <div
                          data-drop-zone="fraction-bar-zone"
                          style={{
                            width: '90px',
                            height: '4px',
                            background: '#38bdf8',
                            borderRadius: '2px',
                            margin: '4px 0',
                            boxShadow: '0 0 12px rgba(56, 189, 248, 0.8)',
                          }}
                        />

                        {/* Denominatore trascinabile (su numeratore per calcolare, o a sinistra per invertire!) */}
                        <div
                          onPointerDown={e => startDrag(e, 'fraction-den-token', fractionDen, '#fbbf24')}
                          style={{
                            fontFamily: 'var(--font-math)',
                            fontSize: '2.5rem',
                            fontWeight: 900,
                            color: '#fbbf24',
                            padding: '0.4rem 1rem',
                            borderRadius: '12px',
                            background: '#0c1222',
                            border: '2px solid #fbbf24',
                            cursor: 'grab',
                            boxShadow: '0 0 16px rgba(251, 191, 36, 0.5)',
                            opacity: draggedTokenId === 'fraction-den-token' ? 0.25 : 1,
                            touchAction: 'none',
                          }}
                          title="Trascina sul numeratore per calcolare, oppure a sinistra dell'uguale per tornare a moltiplicare!"
                        >
                          {fractionDen}
                        </div>
                      </div>
                    ) : (
                      /* MEMBRO DESTRO NORMALE: NUMERO GIA' PRESENTE + SLOT SUCCESSIVI */
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                          {/* Eventuale termine x su RHS (es. 2x) */}
                          {rhsVarCoeff && (
                            <>
                              <div
                                onPointerDown={e => startDrag(e, 'rhs-var-token', `${rhsVarCoeff}x`, '#00f0ff')}
                                style={{
                                  padding: '0.75rem 1.1rem',
                                  borderRadius: '14px',
                                  background: '#0c1222',
                                  border: '2px solid #00f0ff',
                                  color: '#00f0ff',
                                  fontFamily: 'var(--font-math)',
                                  fontSize: '2.5rem',
                                  fontWeight: 900,
                                  cursor: 'grab',
                                  boxShadow: '0 0 16px rgba(0, 240, 255, 0.4)',
                                  opacity: draggedTokenId === 'rhs-var-token' ? 0.25 : 1,
                                  touchAction: 'none',
                                }}
                                title="Trascina a sinistra dell'uguale: diventerà negativo e andrà dopo il termine in x!"
                              >
                                {rhsVarCoeff}x
                              </div>
                              <span style={{ color: '#34d399', fontSize: '2.5rem', fontWeight: 900 }}>+</span>
                            </>
                          )}

                          {/* 1. Il numero che già c'è (es. 14 oppure 8) */}
                          <div
                            data-drop-zone="rhs-base-num-target"
                            style={{
                              padding: '0.75rem 1.4rem',
                              borderRadius: '14px',
                              background: hoverDropZone === 'rhs-base-num-target' ? 'rgba(251, 191, 36, 0.3)' : '#0c1222',
                              border: hoverDropZone === 'rhs-base-num-target' ? '2.5px solid #fbbf24' : '2px solid #fbbf2470',
                              color: '#fbbf24',
                              fontFamily: 'var(--font-math)',
                              fontSize: '2.5rem',
                              fontWeight: 900,
                              boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
                              transition: 'all 0.15s ease',
                            }}
                          >
                            {rhsBaseNum}
                          </div>

                          {/* 2. Il segno trasportato (deve andare forzatamente DOPO il numero base) */}
                          {rhsTransportedSign ? (
                            <div
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.6rem 1rem',
                                borderRadius: '999px',
                                background: '#0c1222',
                                border: `2.5px solid ${rhsTransportedSign === '+' ? '#34d399' : '#f87171'}`,
                                color: rhsTransportedSign === '+' ? '#34d399' : '#f87171',
                                fontFamily: 'var(--font-math)',
                                fontSize: '2.5rem',
                                fontWeight: 900,
                              }}
                            >
                              {rhsTransportedSign}
                            </div>
                          ) : (
                            /* Slot di drop obbligatorio DOPO il numero base */
                            <div
                              data-drop-zone="rhs-slot-sign-after-base"
                              style={{
                                padding: '0.6rem 1rem',
                                borderRadius: '999px',
                                border: hoverDropZone === 'rhs-slot-sign-after-base' ? '2.5px dashed #00f0ff' : '1.5px dashed rgba(255, 255, 255, 0.25)',
                                background: hoverDropZone === 'rhs-slot-sign-after-base' ? 'rgba(0, 240, 255, 0.2)' : 'transparent',
                                color: '#94a3b8',
                                fontSize: '1.2rem',
                                fontFamily: 'var(--font-math)',
                              }}
                            >
                              [ + / − ]
                            </div>
                          )}

                          {/* 3. Il numero trasportato (deve andare forzatamente DOPO il segno) */}
                          {rhsTransportedNum ? (
                            <div
                              data-drop-zone="rhs-calc-zone"
                              onPointerDown={e => startDrag(e, 'rhs-transported-num-token', rhsTransportedNum, '#fbbf24')}
                              style={{
                                padding: '0.75rem 1.3rem',
                                borderRadius: '14px',
                                background: '#0c1222',
                                border: '2px solid #fbbf24',
                                color: '#fbbf24',
                                fontFamily: 'var(--font-math)',
                                fontSize: '2.5rem',
                                fontWeight: 900,
                                cursor: 'grab',
                                boxShadow: '0 0 20px rgba(251, 191, 36, 0.5)',
                                opacity: draggedTokenId === 'rhs-transported-num-token' ? 0.25 : 1,
                                touchAction: 'none',
                              }}
                              title={`Trascina sopra il ${rhsBaseNum} per calcolare il risultato!`}
                            >
                              {rhsTransportedNum}
                            </div>
                          ) : (
                            rhsTransportedSign && (
                              /* Slot di drop obbligatorio DOPO il segno */
                              <div
                                data-drop-zone="rhs-slot-num-after-sign"
                                style={{
                                  padding: '0.75rem 1.3rem',
                                  borderRadius: '14px',
                                  border: hoverDropZone === 'rhs-slot-num-after-sign' ? '2.5px dashed #fbbf24' : '1.5px dashed rgba(255, 255, 255, 0.25)',
                                  background: hoverDropZone === 'rhs-slot-num-after-sign' ? 'rgba(251, 191, 36, 0.2)' : 'transparent',
                                  color: '#94a3b8',
                                  fontSize: '1.2rem',
                                  fontFamily: 'var(--font-math)',
                                }}
                              >
                                [ n ]
                              </div>
                            )
                          )}
                        </div>

                        {/* Linea di frazione visibile sotto il numero quando RHS è un numero singolo e LHS ha solo il coefficiente */}
                        {!lhsNum && !lhsSign && !rhsTransportedSign && !rhsTransportedNum && !rhsVarCoeff && !lhsTransportedVarCoeff && (
                          <div data-drop-zone="fraction-slot-under-rhs" style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{ width: '90px', height: '4px', background: hoverDropZone === 'fraction-slot-under-rhs' ? '#00f0ff' : 'rgba(56, 189, 248, 0.5)', borderRadius: '2px' }} />
                            <span style={{ fontSize: '0.78rem', color: '#38bdf8', marginTop: '4px', fontWeight: 600 }}>
                              [ Denominatore ]
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- 2. SCOMPOSIZIONE: DIFFERENZE DI QUADRATI ---------------- */}
            {(subType === 'diff_squares' || initialTitle.includes('− x²') || initialTitle.includes('− 4x²') || initialTitle.includes('x² − 16')) && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    Polinomio da Scomporre
                  </div>
                  <div style={{ fontSize: '3rem', fontFamily: 'var(--font-math)', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                    {cleanExpr || 'x² − 16'}
                  </div>
                </div>

                {/* Guida semplice */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>Calcola le radici quadrate dei due termini e scrivi il prodotto di fattori coniugati</span>
                </div>

                {/* Slot delle due basi e formula finale */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.3rem', color: '#cbd5e1' }}>
                    <span>Radici:</span>
                    {renderMathSlot('diffsq-baseA', diffSqSlots.a || '', 'Radice A', '#fbbf24', '120px', '1ª Base')}
                    {renderMathSlot('diffsq-baseB', diffSqSlots.b || '', 'Radice B', '#00f0ff', '120px', '2ª Base')}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '2.5rem', fontFamily: 'var(--font-math)', color: '#94a3b8' }}>
                    <span>(</span>
                    <span style={{ color: '#fbbf24', fontWeight: 900 }}>{diffSqSlots.a || '?'}</span>
                    <span style={{ color: '#f87171' }}>−</span>
                    <span style={{ color: '#00f0ff', fontWeight: 900 }}>{diffSqSlots.b || '?'}</span>
                    <span>) (</span>
                    <span style={{ color: '#fbbf24', fontWeight: 900 }}>{diffSqSlots.a || '?'}</span>
                    <span style={{ color: '#34d399' }}>+</span>
                    <span style={{ color: '#00f0ff', fontWeight: 900 }}>{diffSqSlots.b || '?'}</span>
                    <span>)</span>
                  </div>
                </div>

                {/* Palette Tessere & Simboli Algebrici */}
                {renderMathTokenPalette()}

                {/* Feedback Immediato */}
                {feedback && (
                  <div style={{
                    width: '100%',
                    maxWidth: '650px',
                    padding: '0.9rem 1.4rem',
                    borderRadius: '14px',
                    background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                    border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                    color: isError ? '#fecaca' : '#a7f3d0',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                  }}>
                    {feedback}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyDiffSquares}
                  style={{
                    padding: '0.85rem 2.4rem',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'var(--font-math)',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                  }}
                >
                  ✓ Verifica Differenza di Quadrati
                </button>
              </div>
            )}

            {/* ---------------- 3. SCOMPOSIZIONE: RACCOGLIMENTO COMUNE (MCD) ---------------- */}
            {(subType === 'common_mcd' || initialTitle.includes('6x² + 9x') || initialTitle.includes('4x³ − 8x²')) && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    Polinomio da Scomporre
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.8rem', fontSize: '3rem', fontFamily: 'var(--font-math)', fontWeight: 900, whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                    <span style={{ color: '#fbbf24' }}>{metadata?.term1 || (initialTitle.includes('6x²') ? '6x²' : '4x³')}</span>
                    <span style={{ color: (metadata?.sign === '−' || initialTitle.includes('−')) ? '#f87171' : '#34d399' }}>
                      {metadata?.sign || (initialTitle.includes('−') ? '−' : '+')}
                    </span>
                    <span style={{ color: '#00f0ff' }}>{metadata?.term2 || (initialTitle.includes('9x') ? '9x' : '8x²')}</span>
                  </div>
                </div>

                {/* Guida semplice */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>Calcola l'MCD (numero e lettera) e scrivi i due quozienti</span>
                </div>

                {/* Formula di scomposizione */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  fontSize: '2.4rem',
                  fontFamily: 'var(--font-math)',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                }}>
                  {renderMathSlot('mcd-num', mcdInputs.num, 'MCD N.', '#fbbf24', '110px', 'MCD Num')}
                  {renderMathSlot('mcd-var', mcdInputs.var, 'MCD L.', '#00f0ff', '110px', 'MCD Lett')}

                  <span style={{ color: '#94a3b8' }}>(</span>

                  {renderMathSlot('mcd-q1', mcdInputs.q1, 'Quoz. 1', '#38bdf8', '120px', 'Quoz. 1')}

                  <span style={{ color: (metadata?.sign === '−' || initialTitle.includes('−')) ? '#f87171' : '#34d399', fontWeight: 900 }}>
                    {metadata?.sign || (initialTitle.includes('−') ? '−' : '+')}
                  </span>

                  {renderMathSlot('mcd-q2', mcdInputs.q2, 'Quoz. 2', '#fbbf24', '110px', 'Quoz. 2')}

                  <span style={{ color: '#94a3b8' }}>)</span>
                </div>

                {/* Palette Tessere & Simboli Algebrici */}
                {renderMathTokenPalette()}

                {/* Feedback Immediato nel box MCD */}
                {feedback && (
                  <div style={{
                    width: '100%',
                    maxWidth: '560px',
                    padding: '0.85rem 1.25rem',
                    borderRadius: '14px',
                    background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                    border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                    color: isError ? '#fecaca' : '#a7f3d0',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                  }}>
                    {feedback}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyMcd}
                  style={{
                    padding: '0.85rem 2.4rem',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'var(--font-math)',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(14, 165, 233, 0.45)',
                  }}
                >
                  ✓ Verifica Scomposizione MCD
                </button>
              </div>
            )}

            {/* ---------------- 4. SCOMPOSIZIONE: RACCOGLIMENTO PARZIALE A 4 TERMINI ---------------- */}
            {(subType === 'partial_grouping' || initialTitle.includes('2x³ − 3x² + 4x − 6')) && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    Polinomio a 4 Termini (Raggruppato a Coppie)
                  </div>
                  <div style={{ fontSize: '2.6rem', fontFamily: 'var(--font-math)', color: '#fff', display: 'flex', gap: '0.8rem', alignItems: 'center', justifyContent: 'center', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                    <span style={{ color: '#fbbf24' }}>{metadata?.pair1 || '(2x³ − 3x²)'}</span>
                    <span style={{ color: metadata?.pairSign === '−' ? '#f87171' : '#38bdf8', fontWeight: 900 }}>{metadata?.pairSign || '+'}</span>
                    <span style={{ color: '#34d399' }}>{metadata?.pair2 ? (metadata.pair2.startsWith('+') ? metadata.pair2.slice(1).trim() : metadata.pair2) : '(4x − 6)'}</span>
                  </div>
                </div>

                {/* Guida semplice */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: partialStep === 1 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.15)',
                  border: partialStep === 1 ? '1.5px solid rgba(56, 189, 248, 0.4)' : '1.5px solid #10b981',
                  color: partialStep === 1 ? '#38bdf8' : '#34d399',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>
                    {partialStep === 1
                      ? 'Passo 1 di 2: Raccogli il fattore comune in ciascuna delle due coppie'
                      : 'Passo 2 di 2: Il binomio tra parentesi è comune! Raccoglilo per concludere'}
                  </span>
                </div>

                {partialStep === 1 ? (
                  /* FASE 1: Raccoglimento a due a due */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '2.2rem', fontFamily: 'var(--font-math)', flexWrap: 'nowrap', justifyContent: 'center', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                      {/* Coppia 1 */}
                      {renderMathSlot('partial-mcd1', partialInputs.mcd1, 'MCD 1', '#fbbf24', '120px', 'MCD 1')}
                      <span style={{ color: '#94a3b8' }}>(</span>
                      {renderMathSlot('partial-quot1', partialInputs.quot1, 'Quoziente 1', '#fbbf24', '140px', 'Quoz. 1')}
                      <span style={{ color: '#94a3b8' }}>)</span>

                      <span style={{ color: metadata?.pairSign === '−' ? '#f87171' : '#38bdf8', padding: '0 0.5rem', fontWeight: 900 }}>
                        {metadata?.pairSign || '+'}
                      </span>

                      {/* Coppia 2 */}
                      {renderMathSlot('partial-mcd2', partialInputs.mcd2, 'MCD 2', '#34d399', '120px', 'MCD 2')}
                      <span style={{ color: '#94a3b8' }}>(</span>
                      {renderMathSlot('partial-quot2', partialInputs.quot2, 'Quoziente 2', '#34d399', '140px', 'Quoz. 2')}
                      <span style={{ color: '#94a3b8' }}>)</span>
                    </div>

                    {/* Palette Tessere & Simboli Algebrici */}
                    {renderMathTokenPalette()}

                    {/* Feedback Immediato Passo 1 */}
                    {feedback && (
                      <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '14px',
                        background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                        border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                        color: isError ? '#fecaca' : '#a7f3d0',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}>
                        {feedback}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyPartialPhase1}
                      style={{
                        padding: '0.85rem 2.4rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                      }}
                    >
                      ✓ Verifica 1° Passaggio
                    </button>
                  </div>
                ) : (
                  /* FASE 2: Raccoglimento del binomio comune */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    <div style={{ fontSize: '2.4rem', fontFamily: 'var(--font-math)', display: 'flex', alignItems: 'center', gap: '0.5rem', justifyContent: 'center' }}>
                      <span style={{ color: '#38bdf8' }}>{metadata?.mcd1 || 'x²'}</span>
                      <span style={{ color: '#fbbf24', borderBottom: '3px solid #fbbf24', paddingBottom: '2px' }}>({metadata?.quot1 || '2x − 3'})</span>
                      <span style={{ color: '#38bdf8' }}>+ {metadata?.mcd2 || '2'}</span>
                      <span style={{ color: '#fbbf24', borderBottom: '3px solid #fbbf24', paddingBottom: '2px' }}>({metadata?.quot2 || '2x − 3'})</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '2.4rem', fontFamily: 'var(--font-math)', justifyContent: 'center' }}>
                      <span style={{ color: '#94a3b8' }}>(</span>
                      {renderMathSlot('partial-finalCommon', partialInputs.finalCommon, 'Binomio comune', '#fbbf24', '180px', 'Binomio Comune')}
                      <span style={{ color: '#94a3b8' }}>) (</span>
                      {renderMathSlot('partial-finalOther', partialInputs.finalOther, 'Fattori esterni', '#00f0ff', '180px', 'Fattori Esterni')}
                      <span style={{ color: '#94a3b8' }}>)</span>
                    </div>

                    {/* Palette Tessere & Simboli Algebrici */}
                    {renderMathTokenPalette()}

                    {/* Feedback Immediato Passo 2 */}
                    {feedback && (
                      <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '14px',
                        background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                        border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                        color: isError ? '#fecaca' : '#a7f3d0',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}>
                        {feedback}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyPartialPhase2}
                      style={{
                        padding: '0.85rem 2.4rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(245, 158, 11, 0.45)',
                      }}
                    >
                      🏆 Verifica Scomposizione Finale
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- 5. SCOMPOSIZIONE MISTA: MCD + DIFF. QUADRATI (−2x² + 8) ---------------- */}
            {(subType === 'mixed_mcd_squares' || initialTitle.includes('−2x² + 8')) && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    Polinomio da Scomporre
                  </div>
                  <div style={{ fontSize: '3rem', fontFamily: 'var(--font-math)', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                    {cleanExpr || '−2x² + 8'}
                  </div>
                </div>

                {/* Guida semplice */}
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: mixedStep === 1 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.15)',
                  border: mixedStep === 1 ? '1.5px solid rgba(56, 189, 248, 0.4)' : '1.5px solid #10b981',
                  color: mixedStep === 1 ? '#38bdf8' : '#34d399',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>
                    {mixedStep === 1
                      ? 'Passo 1 di 2: Raccogli il divisore comune negativo per lasciare x² positivo'
                      : 'Passo 2 di 2: Mantieni il fattore comune e scomponi la differenza di quadrati'}
                  </span>
                </div>

                {mixedStep === 1 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.4rem', fontFamily: 'var(--font-math)', justifyContent: 'center' }}>
                      {renderMathSlot('mixed-mcd', mixedInputs.mcd, 'Fattore', '#f87171', '120px', 'Fattore Comune')}
                      <span style={{ color: '#94a3b8' }}>(</span>
                      {renderMathSlot('mixed-quot', mixedInputs.quot, 'Quoziente', '#00f0ff', '160px', 'Binomio Quoziente')}
                      <span style={{ color: '#94a3b8' }}>)</span>
                    </div>

                    {/* Palette Tessere & Simboli Algebrici */}
                    {renderMathTokenPalette()}

                    {/* Feedback Immediato Passo 1 */}
                    {feedback && (
                      <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '14px',
                        background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                        border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                        color: isError ? '#fecaca' : '#a7f3d0',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}>
                        {feedback}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyMixedStep1}
                      style={{
                        padding: '0.85rem 2.4rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(14, 165, 233, 0.45)',
                      }}
                    >
                      ✓ Verifica 1° Passaggio
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '2.4rem', fontFamily: 'var(--font-math)', justifyContent: 'center' }}>
                      <span style={{ color: '#f87171', fontWeight: 900 }}>{mixedInputs.mcd || metadata?.mixedMcd || '−2'}</span>
                      <span style={{ color: '#94a3b8' }}>(</span>
                      {renderMathSlot('mixed-f1', mixedInputs.f1, 'Fattore 1', '#fbbf24', '130px', '1° Fattore')}
                      <span style={{ color: '#94a3b8' }}>) (</span>
                      {renderMathSlot('mixed-f2', mixedInputs.f2, 'Fattore 2', '#34d399', '130px', '2° Fattore')}
                      <span style={{ color: '#94a3b8' }}>)</span>
                    </div>

                    {/* Palette Tessere & Simboli Algebrici */}
                    {renderMathTokenPalette()}

                    {/* Feedback Immediato Passo 2 */}
                    {feedback && (
                      <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '14px',
                        background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                        border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                        color: isError ? '#fecaca' : '#a7f3d0',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}>
                        {feedback}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyMixedStep2}
                      style={{
                        padding: '0.85rem 2.4rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                      }}
                    >
                      🏆 Verifica Scomposizione Finale
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- 6. SCOMPOSIZIONE: QUADRATO DI BINOMIO (x² + 6x + 9) ---------------- */}
            {(subType === 'square_binomial' || initialTitle.includes('x² + 6x + 9')) && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    Trinomio Quadrato Perfetto
                  </div>
                  <div style={{ fontSize: '3rem', fontFamily: 'var(--font-math)', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                    {cleanExpr || 'x² + 6x + 9'}
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>Riconosci le due radici e imposta il segno del doppio prodotto</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '2.4rem', fontFamily: 'var(--font-math)', justifyContent: 'center' }}>
                  <span style={{ color: '#94a3b8' }}>(</span>
                  {renderMathSlot('sqb-baseA', squareBinomInputs.baseA, 'Base 1', '#00f0ff', '130px', '1ª Base')}
                  <button
                    type="button"
                    onClick={() => setSquareBinomInputs(prev => ({ ...prev, sign: prev.sign === '+' ? '−' : '+' }))}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '12px',
                      background: '#0c1222',
                      border: '2px solid #34d399',
                      color: '#34d399',
                      fontFamily: 'var(--font-math)',
                      fontSize: '1.9rem',
                      fontWeight: 900,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                    title="Clicca per invertire il segno (+ / −)"
                  >
                    {squareBinomInputs.sign}
                  </button>
                  {renderMathSlot('sqb-baseB', squareBinomInputs.baseB, 'Base 2', '#fbbf24', '130px', '2ª Base')}
                  <span style={{ color: '#94a3b8' }}>)²</span>
                </div>

                {/* Palette Tessere & Simboli Algebrici */}
                {renderMathTokenPalette()}

                {/* Feedback Immediato Quadrato di Binomio */}
                {feedback && (
                  <div style={{
                    width: '100%',
                    maxWidth: '650px',
                    padding: '0.9rem 1.4rem',
                    borderRadius: '14px',
                    background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                    border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                    color: isError ? '#fecaca' : '#a7f3d0',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                  }}>
                    {feedback}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifySquareBinom}
                  style={{
                    padding: '0.85rem 2.4rem',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'var(--font-math)',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                  }}
                >
                  ✓ Verifica Quadrato di Binomio
                </button>
              </div>
            )}

            {/* ---------------- 7. SCOMPOSIZIONE: TRINOMIO NOTEVOLE (SOMMA E PRODOTTO) ---------------- */}
            {(subType === 'trinomial' || initialTitle.includes('x² + 5x + 6') || initialTitle.includes('x² − 7x + 12')) && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    Trinomio da Scomporre
                  </div>
                  <div style={{ fontSize: '3rem', fontFamily: 'var(--font-math)', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                    {cleanExpr || initialTitle}
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>Trova due numeri la cui somma dia il termine in x e il cui prodotto dia il termine noto</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '2.5rem', fontFamily: 'var(--font-math)', color: '#94a3b8' }}>
                  <span>( x</span>
                  {renderMathSlot('trinom-d1', trinomSlots.d1 || '', 'es. +2', '#00f0ff', '120px', '1° Numero')}
                  <span>) ( x</span>
                  {renderMathSlot('trinom-d2', trinomSlots.d2 || '', 'es. +3', '#fbbf24', '120px', '2° Numero')}
                  <span>)</span>
                </div>

                {/* Palette Tessere & Simboli Algebrici */}
                {renderMathTokenPalette()}

                {/* Feedback Immediato Trinomio */}
                {feedback && (
                  <div style={{
                    width: '100%',
                    maxWidth: '650px',
                    padding: '0.9rem 1.4rem',
                    borderRadius: '14px',
                    background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                    border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                    color: isError ? '#fecaca' : '#a7f3d0',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                  }}>
                    {feedback}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyTrinomial}
                  style={{
                    padding: '0.85rem 2.4rem',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'var(--font-math)',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                  }}
                >
                  ✓ Verifica Trinomio Notevole
                </button>
              </div>
            )}

            {/* ---------------- 8. SCOMPOSIZIONE: SOMMA O DIFFERENZA DI CUBI (2 TERMINI) ---------------- */}
            {(subType === 'sum_cubes' || subType === 'diff_cubes') && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    {subType === 'sum_cubes' ? 'Somma di Due Cubi' : 'Differenza di Due Cubi'}
                  </div>
                  <div style={{ fontSize: '3rem', fontFamily: 'var(--font-math)', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                    {cleanExpr || initialTitle}
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>Calcola le radici cubiche e applica: {subType === 'sum_cubes' ? '(A + B)(A² − AB + B²)' : '(A − B)(A² + AB + B²)'}</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '1.3rem', color: '#cbd5e1' }}>
                    <span>Radici Cubiche:</span>
                    {renderMathSlot('cubes-baseA', cubesInputs.baseA, 'es. x', '#00f0ff', '110px', 'Base A')}
                    {renderMathSlot('cubes-baseB', cubesInputs.baseB, 'es. 2', '#fbbf24', '110px', 'Base B')}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '2rem', fontFamily: 'var(--font-math)', color: '#94a3b8' }}>
                    <span>(</span>
                    {renderMathSlot('cubes-binom', cubesInputs.binom, 'Binomio (A±B)', '#34d399', '180px', 'Binomio')}
                    <span>) (</span>
                    {renderMathSlot('cubes-trinom', cubesInputs.trinom, 'Falso Quadrato', '#38bdf8', '240px', 'Falso Quadrato')}
                    <span>)</span>
                  </div>
                </div>

                {/* Palette Tessere & Simboli Algebrici */}
                {renderMathTokenPalette()}

                {/* Feedback Immediato Cubi */}
                {feedback && (
                  <div style={{
                    width: '100%',
                    maxWidth: '650px',
                    padding: '0.9rem 1.4rem',
                    borderRadius: '14px',
                    background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                    border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                    color: isError ? '#fecaca' : '#a7f3d0',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                  }}>
                    {feedback}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyCubes}
                  style={{
                    padding: '0.85rem 2.4rem',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'var(--font-math)',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                  }}
                >
                  ✓ Verifica Scomposizione in Cubi
                </button>
              </div>
            )}

            {/* ---------------- 9. SCOMPOSIZIONE: MISTO MCD + TRINOMIO (3 TERMINI) ---------------- */}
            {subType === 'mixed_mcd_trinomial' && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    Polinomio da Scomporre
                  </div>
                  <div style={{ fontSize: '3rem', fontFamily: 'var(--font-math)', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                    {cleanExpr || initialTitle}
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: mixedTrinStep === 1 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.15)',
                  border: mixedTrinStep === 1 ? '1.5px solid rgba(56, 189, 248, 0.4)' : '1.5px solid #10b981',
                  color: mixedTrinStep === 1 ? '#38bdf8' : '#34d399',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>
                    {mixedTrinStep === 1
                      ? 'Passo 1 di 2: Raccogli il fattore numerico comune a tutti i termini'
                      : 'Passo 2 di 2: Trova i due numeri con somma e prodotto corretti per il trinomio interno'}
                  </span>
                </div>

                {mixedTrinStep === 1 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '2.4rem', fontFamily: 'var(--font-math)' }}>
                      {renderMathSlot('mxtrin-mcd', mixedTrinInputs.mcd, 'MCD', '#fbbf24', '110px', 'MCD Num')}
                      <span style={{ color: '#94a3b8' }}>(</span>
                      {renderMathSlot('mxtrin-quot', mixedTrinInputs.quot, 'Trinomio interno', '#00f0ff', '260px', 'Trinomio')}
                      <span style={{ color: '#94a3b8' }}>)</span>
                    </div>

                    {renderMathTokenPalette()}

                    {feedback && (
                      <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '14px',
                        background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                        border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                        color: isError ? '#fecaca' : '#a7f3d0',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}>
                        {feedback}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyMixedTrinStep1}
                      style={{
                        padding: '0.85rem 2.4rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(14, 165, 233, 0.45)',
                      }}
                    >
                      ✓ Verifica 1° Passaggio (MCD)
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '2.4rem', fontFamily: 'var(--font-math)', color: '#94a3b8' }}>
                      <span style={{ color: '#fbbf24', fontWeight: 900 }}>{mixedTrinInputs.mcd || metadata?.mcdNum || '2'}</span>
                      <span>( x + </span>
                      {renderMathSlot('mxtrin-d1', mixedTrinInputs.d1, 'n1', '#34d399', '100px', '1° Numero')}
                      <span>) ( x + </span>
                      {renderMathSlot('mxtrin-d2', mixedTrinInputs.d2, 'n2', '#38bdf8', '100px', '2° Numero')}
                      <span>)</span>
                    </div>

                    {renderMathTokenPalette()}

                    {feedback && (
                      <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '14px',
                        background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                        border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                        color: isError ? '#fecaca' : '#a7f3d0',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}>
                        {feedback}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyMixedTrinStep2}
                      style={{
                        padding: '0.85rem 2.4rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                      }}
                    >
                      🏆 Verifica Scomposizione Finale
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- 10. SCOMPOSIZIONE: TRINOMIO CON A != 1 (SDOPPIAMENTO) (3 TERMINI) ---------------- */}
            {subType === 'trinomial_advanced' && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    Polinomio da Scomporre
                  </div>
                  <div style={{ fontSize: '3rem', fontFamily: 'var(--font-math)', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                    {cleanExpr || initialTitle}
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: trinAdvStep === 1 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.15)',
                  border: trinAdvStep === 1 ? '1.5px solid rgba(56, 189, 248, 0.4)' : '1.5px solid #10b981',
                  color: trinAdvStep === 1 ? '#38bdf8' : '#34d399',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>
                    {trinAdvStep === 1
                      ? 'Passo 1 di 2: Sdoppia il termine centrale con due numeri che sommati danno b e moltiplicati danno a · c'
                      : 'Passo 2 di 2: Esegui il raccoglimento parziale e scrivi il prodotto di binomi finale'}
                  </span>
                </div>

                {trinAdvStep === 1 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.8rem', color: '#cbd5e1' }}>
                      <span>Addendi in x:</span>
                      {renderMathSlot('trinadv-p1', trinAdvInputs.p1, 'es. 6x', '#00f0ff', '140px', '1° Addendo')}
                      <span>+</span>
                      {renderMathSlot('trinadv-p2', trinAdvInputs.p2, 'es. x', '#fbbf24', '140px', '2° Addendo')}
                    </div>

                    {renderMathTokenPalette()}

                    {feedback && (
                      <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '14px',
                        background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                        border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                        color: isError ? '#fecaca' : '#a7f3d0',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}>
                        {feedback}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyTrinAdvStep1}
                      style={{
                        padding: '0.85rem 2.4rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(14, 165, 233, 0.45)',
                      }}
                    >
                      ✓ Verifica Sdoppiamento in 4 Termini
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    {renderMathSlot('trinadv-final', trinAdvInputs.final, '(x+3)(2x+1)', '#34d399', '300px', 'Prodotto Finale')}

                    {renderMathTokenPalette()}

                    {feedback && (
                      <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '14px',
                        background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                        border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                        color: isError ? '#fecaca' : '#a7f3d0',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}>
                        {feedback}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyTrinAdvStep2}
                      style={{
                        padding: '0.85rem 2.4rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                      }}
                    >
                      🏆 Verifica Scomposizione Finale
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- 11. SCOMPOSIZIONE: CUBO DI BINOMIO (4 TERMINI) ---------------- */}
            {subType === 'cube_binomial' && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    Quadrinomio da Scomporre
                  </div>
                  <div style={{ fontSize: '3rem', fontFamily: 'var(--font-math)', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                    {cleanExpr || initialTitle}
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>Riconosci le radici cubiche dei due cubi estremi e imposta il segno appropriato</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '2.4rem', fontFamily: 'var(--font-math)' }}>
                  <span style={{ color: '#94a3b8' }}>(</span>
                  {renderMathSlot('cubebinom-baseA', cubeBinomInputs.baseA, 'Base 1', '#00f0ff', '130px', '1ª Base')}
                  <button
                    type="button"
                    onClick={() => setCubeBinomInputs(prev => ({ ...prev, sign: prev.sign === '+' ? '−' : '+' }))}
                    style={{
                      padding: '0.4rem 0.9rem',
                      borderRadius: '12px',
                      background: '#0c1222',
                      border: '2px solid #34d399',
                      color: '#34d399',
                      fontFamily: 'var(--font-math)',
                      fontSize: '1.9rem',
                      fontWeight: 900,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                    title="Clicca per invertire il segno"
                  >
                    {cubeBinomInputs.sign}
                  </button>
                  {renderMathSlot('cubebinom-baseB', cubeBinomInputs.baseB, 'Base 2', '#fbbf24', '130px', '2ª Base')}
                  <span style={{ color: '#94a3b8' }}>)³</span>
                </div>

                {renderMathTokenPalette()}

                {feedback && (
                  <div style={{
                    width: '100%',
                    maxWidth: '650px',
                    padding: '0.9rem 1.4rem',
                    borderRadius: '14px',
                    background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                    border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                    color: isError ? '#fecaca' : '#a7f3d0',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                  }}>
                    {feedback}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyCubeBinom}
                  style={{
                    padding: '0.85rem 2.4rem',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'var(--font-math)',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                  }}
                >
                  ✓ Verifica Cubo di Binomio
                </button>
              </div>
            )}

            {/* ---------------- 12. SCOMPOSIZIONE: RAGGRUPPAMENTO (3+1) (4 TERMINI) ---------------- */}
            {subType === 'grouping_3_1' && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    Polinomio da Scomporre
                  </div>
                  <div style={{ fontSize: '3rem', fontFamily: 'var(--font-math)', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                    {cleanExpr || initialTitle}
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: group31Step === 1 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.15)',
                  border: group31Step === 1 ? '1.5px solid rgba(56, 189, 248, 0.4)' : '1.5px solid #10b981',
                  color: group31Step === 1 ? '#38bdf8' : '#34d399',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>
                    {group31Step === 1
                      ? 'Passo 1 di 2: I primi 3 termini formano un quadrato di binomio. Riconoscilo:'
                      : 'Passo 2 di 2: Scomponi la differenza di quadrati tra la parentesi elevata al quadrato e il termine rimanente'}
                  </span>
                </div>

                {group31Step === 1 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '2.2rem', fontFamily: 'var(--font-math)' }}>
                      {renderMathSlot('grp31-sqTrinom', group31Inputs.sqTrinom, '(x+3)²', '#00f0ff', '220px', 'Quadrato')}
                      <span style={{ color: '#f87171' }}>−</span>
                      <span style={{ color: '#fbbf24' }}>y²</span>
                    </div>

                    {renderMathTokenPalette()}

                    {feedback && (
                      <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '14px',
                        background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                        border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                        color: isError ? '#fecaca' : '#a7f3d0',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}>
                        {feedback}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyGroup31Step1}
                      style={{
                        padding: '0.85rem 2.4rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(14, 165, 233, 0.45)',
                      }}
                    >
                      ✓ Verifica Quadrato di Binomio
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    {renderMathSlot('grp31-finalRes', group31Inputs.finalRes, '(x+3-y)(x+3+y)', '#34d399', '320px', 'Scomposizione')}

                    {renderMathTokenPalette()}

                    {feedback && (
                      <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '14px',
                        background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                        border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                        color: isError ? '#fecaca' : '#a7f3d0',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}>
                        {feedback}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyGroup31Step2}
                      style={{
                        padding: '0.85rem 2.4rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                      }}
                    >
                      🏆 Verifica Scomposizione Finale
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- 13. SCOMPOSIZIONE: RAGGRUPPAMENTO (3+2) (5 TERMINI) ---------------- */}
            {subType === 'grouping_3_2' && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    Polinomio da Scomporre
                  </div>
                  <div style={{ fontSize: '3rem', fontFamily: 'var(--font-math)', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                    {cleanExpr || initialTitle}
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: group32Step === 1 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.15)',
                  border: group32Step === 1 ? '1.5px solid rgba(56, 189, 248, 0.4)' : '1.5px solid #10b981',
                  color: group32Step === 1 ? '#38bdf8' : '#34d399',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>
                    {group32Step === 1
                      ? 'Passo 1 di 2: Riconosci il quadrato nei primi 3 termini e raccogli a fattor comune negli ultimi 2'
                      : 'Passo 2 di 2: Raccogli la parentesi comune per la scomposizione finale'}
                  </span>
                </div>

                {group32Step === 1 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.8rem', color: '#cbd5e1' }}>
                      {renderMathSlot('grp32-triStep', group32Inputs.triStep, '(x+3)²', '#00f0ff', '180px', 'Quadrato')}
                      <span>+</span>
                      {renderMathSlot('grp32-linStep', group32Inputs.linStep, '4(x+3)', '#fbbf24', '180px', 'Raccoglimento')}
                    </div>

                    {renderMathTokenPalette()}

                    {feedback && (
                      <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '14px',
                        background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                        border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                        color: isError ? '#fecaca' : '#a7f3d0',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}>
                        {feedback}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyGroup32Step1}
                      style={{
                        padding: '0.85rem 2.4rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(14, 165, 233, 0.45)',
                      }}
                    >
                      ✓ Verifica 1° Passaggio (3+2)
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    {renderMathSlot('grp32-finalRes', group32Inputs.finalRes, '(x+3)(x+7)', '#34d399', '280px', 'Scomposizione Finale')}

                    {renderMathTokenPalette()}

                    {feedback && (
                      <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '14px',
                        background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                        border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                        color: isError ? '#fecaca' : '#a7f3d0',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}>
                        {feedback}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyGroup32Step2}
                      style={{
                        padding: '0.85rem 2.4rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                      }}
                    >
                      🏆 Verifica Scomposizione Finale
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- 14. SCOMPOSIZIONE: RUFFINI 4° GRADO A 5 TERMINI ---------------- */}
            {subType === 'ruffini_degree4' && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    Polinomio da Scomporre
                  </div>
                  <div style={{ fontSize: '3rem', fontFamily: 'var(--font-math)', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                    {cleanExpr || initialTitle}
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: ruffiniStep === 1 ? 'rgba(56, 189, 248, 0.12)' : 'rgba(16, 185, 129, 0.15)',
                  border: ruffiniStep === 1 ? '1.5px solid rgba(56, 189, 248, 0.4)' : '1.5px solid #10b981',
                  color: ruffiniStep === 1 ? '#38bdf8' : '#34d399',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>
                    {ruffiniStep === 1
                      ? 'Passo 1 di 2: Trova lo zero del polinomio c (tra i divisori del termine noto) tale che P(c) = 0'
                      : 'Passo 2 di 2: Inserisci il quoziente abbassato di grado calcolato con la regola di Ruffini'}
                  </span>
                </div>

                {ruffiniStep === 1 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', fontSize: '1.8rem', color: '#cbd5e1' }}>
                      <span>Zero c =</span>
                      {renderMathSlot('ruff-root', ruffiniInputs.root, 'es. 1', '#00f0ff', '120px', 'Zero c')}
                    </div>

                    {renderMathTokenPalette()}

                    {feedback && (
                      <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '14px',
                        background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                        border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                        color: isError ? '#fecaca' : '#a7f3d0',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}>
                        {feedback}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyRuffiniStep1}
                      style={{
                        padding: '0.85rem 2.4rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(14, 165, 233, 0.45)',
                      }}
                    >
                      ✓ Verifica Zero del Polinomio
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '2rem', fontFamily: 'var(--font-math)', color: '#94a3b8' }}>
                      <span>({metadata?.divisor || 'x−1'}) (</span>
                      {renderMathSlot('ruff-quot', ruffiniInputs.quot, 'Quoziente Q(x)', '#34d399', '280px', 'Quoziente Q(x)')}
                      <span>)</span>
                    </div>

                    {renderMathTokenPalette()}

                    {feedback && (
                      <div style={{
                        width: '100%',
                        maxWidth: '650px',
                        padding: '0.9rem 1.4rem',
                        borderRadius: '14px',
                        background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                        border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                        color: isError ? '#fecaca' : '#a7f3d0',
                        fontSize: '1.05rem',
                        fontWeight: 800,
                        textAlign: 'center',
                        boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                      }}>
                        {feedback}
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={handleVerifyRuffiniStep2}
                      style={{
                        padding: '0.85rem 2.4rem',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        border: 'none',
                        color: '#fff',
                        fontFamily: 'var(--font-math)',
                        fontSize: '1.25rem',
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                      }}
                    >
                      🏆 Verifica Divisione di Ruffini
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ---------------- 15. SCOMPOSIZIONE: RACCOGLIMENTO TOTALE SU 5 TERMINI ---------------- */}
            {subType === 'mcd_5terms' && (
              <div style={{
                background: 'rgba(12, 18, 34, 0.65)',
                border: '1.5px solid rgba(56, 189, 248, 0.25)',
                borderRadius: '24px',
                padding: '2rem 1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '1.5rem',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '0.35rem' }}>
                    Polinomio da Scomporre
                  </div>
                  <div style={{ fontSize: '3rem', fontFamily: 'var(--font-math)', fontWeight: 900, color: '#fff', whiteSpace: 'nowrap', overflowX: 'auto', maxWidth: '100%' }}>
                    {cleanExpr || initialTitle}
                  </div>
                </div>

                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '0.45rem 1.25rem',
                  borderRadius: '999px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1.5px solid rgba(56, 189, 248, 0.4)',
                  color: '#38bdf8',
                  fontSize: '0.95rem',
                  fontWeight: 800,
                  textAlign: 'center',
                }}>
                  <span>💡</span>
                  <span>Trova il fattore comune numerico presente in tutti e 5 i termini ed esegui la divisione</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '2.4rem', fontFamily: 'var(--font-math)' }}>
                  {renderMathSlot('mcd5-mcd', mcd5Inputs.mcd, 'MCD', '#fbbf24', '120px', 'MCD Num')}
                  <span style={{ color: '#94a3b8' }}>(</span>
                  {renderMathSlot('mcd5-quot', mcd5Inputs.quot, 'Polinomio quoziente a 5 termini', '#00f0ff', '380px', 'Quoziente a 5 Termini')}
                  <span style={{ color: '#94a3b8' }}>)</span>
                </div>

                {/* Palette Tessere & Simboli Algebrici */}
                {renderMathTokenPalette()}

                {feedback && (
                  <div style={{
                    width: '100%',
                    maxWidth: '650px',
                    padding: '0.9rem 1.4rem',
                    borderRadius: '14px',
                    background: isError ? 'rgba(239, 68, 68, 0.22)' : 'rgba(16, 185, 129, 0.22)',
                    border: isError ? '2px solid #ef4444' : '2px solid #10b981',
                    color: isError ? '#fecaca' : '#a7f3d0',
                    fontSize: '1.05rem',
                    fontWeight: 800,
                    textAlign: 'center',
                    boxShadow: isError ? '0 0 25px rgba(239, 68, 68, 0.4)' : '0 0 25px rgba(16, 185, 129, 0.4)',
                  }}>
                    {feedback}
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleVerifyMcd5}
                  style={{
                    padding: '0.85rem 2.4rem',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    border: 'none',
                    color: '#fff',
                    fontFamily: 'var(--font-math)',
                    fontSize: '1.25rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.45)',
                  }}
                >
                  ✓ Verifica Raccoglimento su 5 Termini
                </button>
              </div>
            )}
          </div>
        ) : (
          /* ======================================================== */
          /* RISULTATO FINALE GIGANTE IN PRIMO PIANO                   */
          /* ======================================================== */
          <div
            className="animate-pop glow-win"
            style={{
              padding: '3rem 2rem',
              borderRadius: '24px',
              background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.35), rgba(0, 240, 255, 0.2))',
              border: '2.5px solid #10b981',
              textAlign: 'center',
              boxShadow: '0 0 50px rgba(16, 185, 129, 0.4)',
            }}
          >
            <div style={{ fontSize: '1.1rem', textTransform: 'uppercase', color: '#6ee7b7', fontWeight: 900, letterSpacing: '2px', marginBottom: '0.75rem' }}>
              🏆 RISULTATO FINALE:
            </div>

            <div style={{
              fontFamily: 'var(--font-math)',
              fontSize: '5rem',
              fontWeight: 900,
              color: '#fff',
              textShadow: '0 0 45px rgba(0, 240, 255, 0.95)',
              marginBottom: '0.75rem',
            }}>
              {finalResultStr}
            </div>

            <p style={{ color: '#e2e8f0', fontSize: '1.2rem', fontWeight: 600 }}>
              Passaggi completati con successo manipolando ogni singolo atomo!
            </p>
          </div>
        )}

        {/* FEEDBACK PER EQUAZIONI (SOLO POST-AZIONE O SU ERRORE, MAI PROATTIVO) */}
        {feedback && isEquation && (
          <div style={{
            marginTop: '1.75rem',
            padding: '0.9rem 1.4rem',
            borderRadius: '14px',
            background: isError ? 'rgba(239, 68, 68, 0.18)' : 'rgba(52, 211, 153, 0.18)',
            border: isError ? '1px solid #ef4444' : '1px solid #10b981',
            color: isError ? '#fca5a5' : '#6ee7b7',
            fontSize: '1.05rem',
            fontWeight: 700,
            textAlign: 'center',
          }}>
            {feedback}
          </div>
        )}
      </div>

      {/* =================================================================== */}
      {/* FLOATING GHOST AD ALTA PRECISIONE CON INVERSIONE IN VOLO DEL SEGNO  */}
      {/* =================================================================== */}
      {draggedTokenId && dragPos && (
        <div style={{
          position: 'fixed',
          left: `${dragPos.x}px`,
          top: `${dragPos.y}px`,
          transform: 'translate(-50%, -50%) scale(1.15) rotate(3deg)',
          pointerEvents: 'none',
          zIndex: 99999,
          padding: '0.75rem 1.4rem',
          borderRadius: '16px',
          background: 'rgba(10, 15, 30, 0.96)',
          border: '2.5px solid #00f0ff',
          fontFamily: 'var(--font-math)',
          fontSize: '2.6rem',
          fontWeight: 900,
          color: (draggedTokenId === 'lhs-sign-token' && isCrossedEqual)
            ? (lhsSign === '+' ? '#f87171' : '#34d399')
            : (draggedTokenId === 'rhs-var-token' && !isCrossedEqual)
              ? '#f87171'
              : draggedTokenColor,
          boxShadow: '0 25px 50px rgba(0, 240, 255, 0.65)',
        }}>
          {draggedTokenId === 'lhs-sign-token'
            ? (isCrossedEqual ? (lhsSign === '+' ? '−' : '+') : lhsSign)
            : (draggedTokenId === 'rhs-var-token' && !isCrossedEqual)
              ? `− ${draggedTokenText}`
              : draggedTokenText}
        </div>
      )}
    </div>
  );
};
