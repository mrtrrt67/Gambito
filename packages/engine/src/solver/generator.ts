// ============================================================
// GAMBITO — Similar Problem Generator ("Genera Simile")
//
// Partendo da un AST analizzato o da un pattern strategico,
// genera variazioni procedurali mantenendo la stessa struttura
// ma variando i numeri (interi puliti adatti alla didattica).
// ============================================================

import type { MathAST, StrategicPattern } from '../ast/types.js';

export interface GeneratedExercise {
  input: string;
  pattern: StrategicPattern;
  explanation: string;
}

function randInt(min: number, max: number, excludeZero = true): number {
  let val = Math.floor(Math.random() * (max - min + 1)) + min;
  if (excludeZero && val === 0) val = 1;
  return val;
}

function pickRandom<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)]!;
}

export function generateSimilar(ast: MathAST): GeneratedExercise {
  const primaryPattern = ast.detectedPatterns[0]?.pattern;
  const variable = ast.metadata.variables[0] ?? 'x';

  switch (primaryPattern) {
    case 'differenza_quadrati': {
      // a²x² - b² oppure b² - a²x²
      const a = pickRandom([1, 2, 3, 5]);
      const b = pickRandom([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
      const a2 = a * a;
      const b2 = b * b;
      const aTerm = a2 === 1 ? `${variable}²` : `${a2}${variable}²`;

      const inverted = Math.random() > 0.5;
      const input = inverted ? `${b2} - ${aTerm}` : `${aTerm} - ${b2}`;
      return {
        input,
        pattern: 'differenza_quadrati',
        explanation: `Differenza di quadrati con basi ${a === 1 ? variable : a + variable} e ${b}.`,
      };
    }

    case 'quadrato_binomio_somma':
    case 'quadrato_binomio_differenza': {
      // (ax ± b)² = a²x² ± 2abx + b²
      const isDiff = primaryPattern === 'quadrato_binomio_differenza' || Math.random() > 0.5;
      const a = pickRandom([1, 2, 3]);
      const b = pickRandom([1, 2, 3, 4, 5]);
      const a2 = a * a;
      const b2 = b * b;
      const mid = 2 * a * b;
      const aTerm = a2 === 1 ? `${variable}²` : `${a2}${variable}²`;
      const sign = isDiff ? '-' : '+';
      const input = `${aTerm} ${sign} ${mid}${variable} + ${b2}`;
      return {
        input,
        pattern: isDiff ? 'quadrato_binomio_differenza' : 'quadrato_binomio_somma',
        explanation: `Quadrato di binomio (${a === 1 ? '' : a}${variable} ${sign} ${b})².`,
      };
    }

    case 'raccoglimento_totale': {
      // k*(ax² ± bx) oppure k*(x² - b²)
      const k = pickRandom([2, 3, 4, 5]);
      const b = pickRandom([2, 3, 4, 6]);
      const sign = Math.random() > 0.5 ? '+' : '-';
      const input = `${k}${variable}² ${sign} ${k * b}${variable}`;
      return {
        input,
        pattern: 'raccoglimento_totale',
        explanation: `Raccoglimento totale del fattore comune ${k}${variable}.`,
      };
    }

    case 'trinomio_speciale': {
      // (x + m)(x + n) = x² + (m+n)x + m*n
      const m = randInt(-6, 6);
      let n = randInt(-6, 6);
      if (n === -m) n = m > 0 ? n - 1 : n + 1; // evita eliminazione termine centrale
      const s = m + n;
      const p = m * n;
      const sTerm = s === 0 ? '' : (s > 0 ? `+ ${s === 1 ? '' : s}${variable}` : `- ${Math.abs(s) === 1 ? '' : Math.abs(s)}${variable}`);
      const pTerm = p > 0 ? `+ ${p}` : `- ${Math.abs(p)}`;
      const input = `${variable}² ${sTerm} ${pTerm}`.replace(/\s+/g, ' ').trim();
      return {
        input,
        pattern: 'trinomio_speciale',
        explanation: `Trinomio speciale con numeri ${m} e ${n} (somma=${s}, prodotto=${p}).`,
      };
    }

    case 'trasporto_termine':
    default: {
      // Equazione lineare ax + b = c oppure ax + b = dx + e
      const a = randInt(2, 5);
      const xSol = randInt(-5, 5);
      const b = randInt(-9, 9);
      const rhs = a * xSol + b;
      const bSign = b >= 0 ? `+ ${b}` : `- ${Math.abs(b)}`;
      const input = `${a}${variable} ${bSign} = ${rhs}`;
      return {
        input,
        pattern: 'trasporto_termine',
        explanation: `Equazione lineare a passaggi con soluzione intera ${variable} = ${xSol}.`,
      };
    }
  }
}
