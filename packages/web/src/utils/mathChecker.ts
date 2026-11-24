/**
 * Utility per la verifica algebrica delle espressioni matematiche sul Quaderno
 */

export function cleanMath(expr: string): string {
  return expr
    .replace(/−/g, '-')
    .replace(/⁰/g, '^0')
    .replace(/¹/g, '^1')
    .replace(/²/g, '^2')
    .replace(/³/g, '^3')
    .replace(/⁴/g, '^4')
    .replace(/⁵/g, '^5')
    .replace(/⁶/g, '^6')
    .replace(/⁷/g, '^7')
    .replace(/⁸/g, '^8')
    .replace(/⁹/g, '^9')
    .replace(/\s+/g, '');
}

export function evaluateAt(expr: string, xVal: number, yVal: number = 2.1): number {
  try {
    let s = cleanMath(expr);
    // Inserisce moltiplicazione implicita tra numero e parentesi: 3( -> 3*(
    s = s.replace(/(\d)\(/g, '$1*(');
    // Inserisce moltiplicazione tra numero e variabile: 3x -> 3*x
    s = s.replace(/(\d)([xyab])/gi, '$1*$2');
    // Inserisce moltiplicazione tra variabile e parentesi: x( -> x*(
    s = s.replace(/([xyab])\(/gi, '$1*(');
    // Inserisce moltiplicazione tra parentesi: )( -> )*(
    s = s.replace(/\)\(/g, ')*(');
    // Inserisce moltiplicazione tra parentesi e variabile: )x -> )*x
    s = s.replace(/\)([xyab])/gi, ')*$1');
    // Inserisce moltiplicazione tra parentesi e numero: )3 -> )*3
    s = s.replace(/\)(\d)/g, ')*$1');
    // Inserisce moltiplicazione tra variabili contigue: xy -> x*y, yx -> y*x
    s = s.replace(/([xyab])([xyab])/gi, '$1*$2');
    // Sostituisce potenze: ^2 -> **2, ^3 -> **3
    s = s.replace(/\^(\d+)/g, '**$1');
    // Sostituisce le variabili x, y, a, b con i rispettivi valori
    s = s.replace(/x/gi, `(${xVal})`);
    s = s.replace(/y/gi, `(${yVal})`);
    s = s.replace(/a/gi, `(${xVal})`);
    s = s.replace(/b/gi, `(${yVal})`);

    // Valutazione sicura tramite Function
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    const fn = new Function(`"use strict"; return (${s});`);
    const val = fn();
    return typeof val === 'number' && !isNaN(val) ? val : NaN;
  } catch {
    return NaN;
  }
}

/**
 * Controlla se due espressioni polinomiali sono algebricamente identiche
 * valutandole su diversi punti di test per x e y.
 */
export function arePolynomialsEquivalent(expr1: string, expr2: string): boolean {
  if (!expr1 || !expr2) return false;
  const testPoints = [
    { x: -3, y: 1.5 },
    { x: -1.5, y: -2.3 },
    { x: 0, y: 0.7 },
    { x: 1, y: 3.2 },
    { x: 2.5, y: -1.1 },
    { x: 4, y: 2.8 },
  ];
  for (const pt of testPoints) {
    const v1 = evaluateAt(expr1, pt.x, pt.y);
    const v2 = evaluateAt(expr2, pt.x, pt.y);
    if (isNaN(v1) || isNaN(v2) || Math.abs(v1 - v2) > 1e-5) {
      return false;
    }
  }
  return true;
}

/**
 * Determina se un'espressione polinomiale è completamente fattorizzata
 * (prodotto di fattori senza addizioni/sottrazioni all'esterno delle parentesi).
 */
export function isFullyFactored(expr: string): boolean {
  const s = cleanMath(expr);
  if (!s) return false;
  let depth = 0;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === '(') depth++;
    else if (c === ')') depth--;
    else if (depth === 0 && (c === '+' || c === '-')) {
      // Se c'è un operatore + o - a livello 0 dopo il primo carattere, non è un prodotto puro
      if (i > 0) return false;
    }
  }
  // Deve contenere almeno un fattore in parentesi o essere un monomio
  return s.includes('(') || (!s.includes('+') && !s.includes('-'));
}

/**
 * Risolve un'equazione lineare ax + b = cx + d estraendo la radice numerica.
 */
export function solveLinearEquation(eqStr: string): number | null {
  const parts = eqStr.replace(/−/g, '-').replace(/\s+/g, '').split('=');
  if (parts.length !== 2) return null;
  const left0 = evaluateAt(parts[0]!, 0);
  const left1 = evaluateAt(parts[0]!, 1);
  const right0 = evaluateAt(parts[1]!, 0);
  const right1 = evaluateAt(parts[1]!, 1);
  if (isNaN(left0) || isNaN(left1) || isNaN(right0) || isNaN(right1)) return null;

  const leftA = left1 - left0;
  const leftB = left0;
  const rightA = right1 - right0;
  const rightB = right0;

  const a = leftA - rightA;
  const b = rightB - leftB;
  if (Math.abs(a) < 1e-9) return null;
  return b / a;
}

/**
 * Verifica se l'equazione scritta dallo studente mantiene la stessa radice
 * e controlla se ha già isolato la soluzione finale (es. x = 4 o x = 8/2).
 */
export function verifyEquationStep(userEq: string, originalEq: string): {
  isEquivalent: boolean;
  isSolved: boolean;
} {
  const origRoot = solveLinearEquation(originalEq);
  const userRoot = solveLinearEquation(userEq);

  if (origRoot === null || userRoot === null) {
    return { isEquivalent: false, isSolved: false };
  }

  const isEquivalent = Math.abs(origRoot - userRoot) < 1e-5;
  if (!isEquivalent) {
    return { isEquivalent: false, isSolved: false };
  }

  // Controlla se lo studente ha isolato x: formato 'x = numero'
  const clean = cleanMath(userEq);
  const isSolved = /^x=-?\d+(\.\d+)?$/.test(clean) || /^x=-?\d+\/\d+$/.test(clean);

  return { isEquivalent: true, isSolved };
}
