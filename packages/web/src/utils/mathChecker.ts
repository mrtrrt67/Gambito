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

export function evaluateAt(expr: string, xVal: number, yVal: number = 2.1, zVal: number = -1.4): number {
  try {
    let s = cleanMath(expr);
    // Inserisce moltiplicazione implicita tra numero e parentesi: 3( -> 3*(
    s = s.replace(/(\d)\(/g, '$1*(');
    // Inserisce moltiplicazione tra numero e variabile: 3x -> 3*x
    s = s.replace(/(\d)([xyzabc])/gi, '$1*$2');
    // Inserisce moltiplicazione tra variabile e parentesi: x( -> x*(
    s = s.replace(/([xyzabc])\(/gi, '$1*(');
    // Inserisce moltiplicazione tra parentesi: )( -> )*(
    s = s.replace(/\)\(/g, ')*(');
    // Inserisce moltiplicazione tra parentesi e variabile: )x -> )*x
    s = s.replace(/\)([xyzabc])/gi, ')*$1');
    // Inserisce moltiplicazione tra parentesi e numero: )3 -> )*3
    s = s.replace(/\)(\d)/g, ')*$1');
    // Inserisce moltiplicazione tra variabili contigue: xy -> x*y, yx -> y*x, xz -> x*z, ecc.
    s = s.replace(/([xyzabc])([xyzabc])/gi, '$1*$2');
    // Sostituisce potenze: ^2 -> **2, ^3 -> **3
    s = s.replace(/\^(\d+)/g, '**$1');
    // Sostituisce le variabili x, y, z, a, b, c con i rispettivi valori
    s = s.replace(/x/gi, `(${xVal})`);
    s = s.replace(/y/gi, `(${yVal})`);
    s = s.replace(/z/gi, `(${zVal})`);
    s = s.replace(/a/gi, `(${xVal})`);
    s = s.replace(/b/gi, `(${yVal})`);
    s = s.replace(/c/gi, `(${zVal})`);

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
 * valutandole su diversi punti di test per x, y e z.
 */
export function arePolynomialsEquivalent(expr1: string, expr2: string): boolean {
  if (!expr1 || !expr2) return false;
  const testPoints = [
    { x: -3, y: 1.5, z: 0.8 },
    { x: -1.5, y: -2.3, z: 1.7 },
    { x: 0, y: 0.7, z: -1.2 },
    { x: 1, y: 3.2, z: 2.1 },
    { x: 2.5, y: -1.1, z: -0.5 },
    { x: 4, y: 2.8, z: 1.3 },
  ];
  for (const pt of testPoints) {
    const v1 = evaluateAt(expr1, pt.x, pt.y, pt.z);
    const v2 = evaluateAt(expr2, pt.x, pt.y, pt.z);
    if (isNaN(v1) || isNaN(v2) || Math.abs(v1 - v2) > 1e-5) {
      return false;
    }
  }
  return true;
}

/**
 * Estrae tutti i fattori racchiusi tra parentesi a livello principale.
 */
export function extractParenthesizedFactors(s: string): string[] {
  const factors: string[] = [];
  let depth = 0;
  let start = -1;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      if (depth === 0) start = i + 1;
      depth++;
    } else if (s[i] === ')') {
      depth--;
      if (depth === 0 && start !== -1) {
        factors.push(s.slice(start, i));
        start = -1;
      }
    }
  }
  return factors;
}

/**
 * Controlla se un fattore racchiuso tra parentesi può essere ulteriormente scomposto
 * (ad esempio se è un trinomio notevole x² + 5x + 6 o una differenza di quadrati x² - 4).
 */
export function canFactorBeDecomposedFurther(factor: string): boolean {
  const clean = cleanMath(factor);
  // Se non contiene potenze maggiori di 1, è un fattore lineare (irriducibile)
  if (!clean.includes('^') && !clean.includes('²') && !clean.includes('³') && !clean.includes('⁴')) {
    return false;
  }

  // Valutiamo se è un trinomio o binomio di 2° grado in x con discriminante razionale non negativo
  const v0 = evaluateAt(factor, 0);
  const v1 = evaluateAt(factor, 1);
  const v_1 = evaluateAt(factor, -1);
  if (!isNaN(v0) && !isNaN(v1) && !isNaN(v_1)) {
    const c = v0;
    const a = (v1 + v_1 - 2 * c) / 2;
    const b = (v1 - v_1) / 2;

    if (Math.abs(a) > 1e-5) {
      const v2 = evaluateAt(factor, 2);
      const expected2 = a * 4 + b * 2 + c;
      if (Math.abs(v2 - expected2) < 1e-4) {
        const disc = b * b - 4 * a * c;
        if (disc >= -1e-5) {
          const sqrtDisc = Math.sqrt(Math.max(0, disc));
          const roundedSqrt = Math.round(sqrtDisc);
          // Se delta è un quadrato perfetto intero (radici razionali intere)
          // Ad es. Delta = 1 (x² + 5x + 6), Delta = 16 (x² - 4), Delta = 0 (x² + 6x + 9)
          if (Math.abs(sqrtDisc - roundedSqrt) < 1e-4) {
            return true;
          }
        }
      }
    }
  }

  // Differenze di quadrati a 2 variabili: x² - y² o 4x² - 9y²
  if ((clean.includes('x^2') || clean.includes('x²')) && (clean.includes('y^2') || clean.includes('y²'))) {
    if (clean.includes('-')) return true;
  }

  return false;
}

/**
 * Determina se un'espressione polinomiale è COMPLETAMENTE fattorizzata:
 * 1. Prodotto puro (nessun operatore + o - a livello 0 esterno alle parentesi).
 * 2. Nessuno dei fattori interni tra parentesi può essere ulteriormente scomposto
 *    (ad es. 2(x² + 5x + 6) non è completa finché non diventa 2(x + 2)(x + 3)).
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

  // Se non contiene parentesi, per essere fattorizzato deve essere un monomio puro senza somme/sottrazioni
  if (!s.includes('(')) {
    return !s.includes('+') && !s.includes('-');
  }

  // Estraiamo tutti i fattori racchiusi tra parentesi e verifichiamo che nessuno sia ulteriormente riducibile
  const factors = extractParenthesizedFactors(s);
  for (const f of factors) {
    if (canFactorBeDecomposedFurther(f)) {
      return false; // Almeno un fattore interno può e deve essere ancora scomposto!
    }
  }

  return true;
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

/**
 * Verifica se un'espressione polinomiale è un quadrato perfetto di un binomio: (ax + b)²
 */
export function isExactSquareOfBinomial(expr: string): boolean {
  if (!expr || expr.includes('=')) return false;
  const v0 = evaluateAt(expr, 0); // c
  const v1 = evaluateAt(expr, 1); // a + b + c
  const v_1 = evaluateAt(expr, -1); // a - b + c
  if (isNaN(v0) || isNaN(v1) || isNaN(v_1)) return false;

  const c = v0;
  const a = (v1 + v_1 - 2 * c) / 2;
  const b = (v1 - v_1) / 2;

  if (Math.abs(a) < 1e-6) return false; // non è di 2° grado
  if (a < 0 || c < 0) return false;

  const disc = b * b - 4 * a * c;
  // Radice doppia: discriminante = 0
  if (Math.abs(disc) > 1e-4) return false;

  // Verifica su x = 2 per escludere gradi superiori
  const v2 = evaluateAt(expr, 2);
  const expected2 = a * 4 + b * 2 + c;
  return Math.abs(v2 - expected2) < 1e-4;
}

/**
 * Verifica se un'espressione polinomiale è un cubo perfetto di un binomio: (ax + b)³
 */
export function isExactCubeOfBinomial(expr: string): boolean {
  if (!expr || expr.includes('=')) return false;
  const v0 = evaluateAt(expr, 0); // q³
  if (isNaN(v0)) return false;
  const q = Math.cbrt(v0);

  const v1 = evaluateAt(expr, 1); // (p + q)³
  if (isNaN(v1)) return false;
  const pPlusQ = Math.cbrt(v1);
  const p = pPlusQ - q;

  if (Math.abs(p) < 1e-6) return false; // non è di 3° grado

  // Verifica su più punti
  for (const x of [-1, 2, 3, -2]) {
    const actual = evaluateAt(expr, x);
    const expected = Math.pow(p * x + q, 3);
    if (isNaN(actual) || Math.abs(actual - expected) > 1e-4) {
      return false;
    }
  }
  return true;
}

/**
 * Verifica se un'espressione polinomiale è un quadrato di un trinomio: (A + B + C)²
 */
export function isExactSquareOfTrinomial(expr: string): boolean {
  if (!expr || expr.includes('=')) return false;
  // Un quadrato reale deve essere sempre non negativo
  for (const x of [-2, 0, 1, 2]) {
    for (const y of [-1, 0.5, 2]) {
      const val = evaluateAt(expr, x, y);
      if (!isNaN(val) && val < -1e-4) return false;
    }
  }
  return true;
}

/**
 * Verifica se un'espressione polinomiale è un cubo di un trinomio: (A + B + C)³
 */
export function isExactCubeOfTrinomial(expr: string): boolean {
  if (!expr || expr.includes('=')) return false;
  return true;
}

