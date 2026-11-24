// ============================================================
// GAMBITO — Pattern Detector
//
// Rileva i pattern strategici disponibili su un AST normalizzato.
// Opera su CanonicalMonomial[], quindi richiede l'output del normalizzatore.
//
// Regola fondamentale: nessuna funzione rivela la soluzione —
// restituisce solo hint generici che aiutano lo studente a trovare
// il passo successivo da solo.
// ============================================================

import { makeId } from '../ast/builders';
import type {
  MathNode, EquationNode, NodeId, DetectedPattern, StrategicPattern,
} from '../ast/types';
import {
  extractNormalizedMonomials,
  fracIsZero, fracToNumber,
} from '../parser/normalizer';
import type { CanonicalMonomial } from '../parser/normalizer';

// ─── Helper: radice quadrata intera esatta ───────────────────

function perfectSqrt(n: bigint): bigint | null {
  if (n < 0n) return null;
  if (n === 0n) return 0n;
  if (n === 1n) return 1n;
  // Newton's method su bigint
  let x = BigInt(Math.ceil(Math.sqrt(Number(n))));
  while (true) {
    const x1 = (x + n / x) / 2n;
    if (x1 >= x) break;
    x = x1;
  }
  if (x * x === n) return x;
  // Controlla vicini (per errori di arrotondamento)
  for (const c of [x - 1n, x, x + 1n]) {
    if (c >= 0n && c * c === n) return c;
  }
  return null;
}

/** Radice cubica intera esatta */
function perfectCbrt(n: bigint): bigint | null {
  if (n === 0n) return 0n;
  const neg = n < 0n;
  const absN = neg ? -n : n;
  let x = BigInt(Math.ceil(Math.cbrt(Number(absN))));
  for (const c of [x - 1n, x, x + 1n]) {
    if (c >= 0n && c * c * c === absN) return neg ? -c : c;
  }
  return null;
}

// ─── Info estratta per un termine "quadrato" ─────────────────

interface SquareInfo {
  sqrtCoeffN: bigint;   // sqrt(|coeff.n|)
  sqrtCoeffD: bigint;   // sqrt(|coeff.d|)
  halfVars: Array<{ name: string; exponent: number }>;
  sign: 1 | -1;
  nodeId: NodeId;
  label: string;        // es. "2x", "3", "x²"
}

function tryExtractSquare(m: CanonicalMonomial): SquareInfo | null {
  const sqN = perfectSqrt(m.coefficient.n);
  const sqD = perfectSqrt(m.coefficient.d);
  if (sqN === null || sqD === null) return null;

  // Tutti gli esponenti devono essere pari
  for (const v of m.variables) {
    if (v.exponent % 2 !== 0) return null;
  }

  const halfVars = m.variables.map(v => ({ name: v.name, exponent: v.exponent / 2 }));
  const parts = [
    sqN === 1n ? '' : sqN.toString(),
    ...halfVars.map(v => v.exponent === 1 ? v.name : `${v.name}^${v.exponent}`),
  ].filter(Boolean);
  const label = parts.join('') || '1';

  return { sqrtCoeffN: sqN, sqrtCoeffD: sqD, halfVars, sign: m.coefficient.sign, nodeId: m.id, label };
}

// ─── Info estratta per un termine "cubo" ─────────────────────

interface CubeInfo {
  cbrtCoeffN: bigint;
  halfVars: Array<{ name: string; exponent: number }>;
  sign: 1 | -1;
  label: string;
}

function tryExtractCube(m: CanonicalMonomial): CubeInfo | null {
  const cbN = perfectCbrt(m.coefficient.n);
  if (cbN === null) return null;
  for (const v of m.variables) {
    if (v.exponent % 3 !== 0) return null;
  }
  const thirdVars = m.variables.map(v => ({ name: v.name, exponent: v.exponent / 3 }));
  const parts = [
    cbN === 1n ? '' : cbN.toString(),
    ...thirdVars.map(v => v.exponent === 1 ? v.name : `${v.name}^${v.exponent}`),
  ].filter(Boolean);
  return { cbrtCoeffN: cbN, halfVars: thirdVars, sign: m.coefficient.sign, label: parts.join('') || '1' };
}

// ─── GCD tra coefficienti ────────────────────────────────────

function bigGcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b > 0n) [a, b] = [b, a % b];
  return a === 0n ? 1n : a;
}

function gcdOfCoeffs(monomials: CanonicalMonomial[]): bigint {
  if (monomials.length === 0) return 1n;
  return monomials.reduce((g, m) => bigGcd(g, m.coefficient.n), monomials[0].coefficient.n);
}

// ─── Verifica se due descrizioni di monomiali coincidono ─────

function sameVarStructure(
  a: Array<{ name: string; exponent: number }>,
  b: Array<{ name: string; exponent: number }>,
): boolean {
  if (a.length !== b.length) return false;
  const sortKey = (v: { name: string; exponent: number }) => `${v.name}^${v.exponent}`;
  const sa = [...a].sort((x, y) => x.name.localeCompare(y.name)).map(sortKey).join(',');
  const sb = [...b].sort((x, y) => x.name.localeCompare(y.name)).map(sortKey).join(',');
  return sa === sb;
}

// ─── Verifica double product: 2*sqrt(m1)*sqrt(m2) ═ mid ──────

function matchDoubleProduct(
  sq1: SquareInfo,
  sq2: SquareInfo,
  mid: CanonicalMonomial,
): boolean {
  // coefficiente atteso: 2 * sq1.coeffN/sq1.coeffD * sq2.coeffN/sq2.coeffD
  const expN = 2n * sq1.sqrtCoeffN * sq2.sqrtCoeffN;
  const expD = sq1.sqrtCoeffD * sq2.sqrtCoeffD;
  if (expN !== mid.coefficient.n) return false;
  if (expD !== mid.coefficient.d) return false;

  // struttura variabile attesa: unione di halfVars di sq1 e sq2
  const combined = new Map<string, number>();
  for (const v of sq1.halfVars) combined.set(v.name, (combined.get(v.name) ?? 0) + v.exponent);
  for (const v of sq2.halfVars) combined.set(v.name, (combined.get(v.name) ?? 0) + v.exponent);
  const combinedArr = [...combined.entries()].map(([name, exponent]) => ({ name, exponent }));
  return sameVarStructure(combinedArr, mid.variables as Array<{ name: string; exponent: number }>);
}

// ─── Raccoglimento totale ─────────────────────────────────────

function checkRaccoglimentoTotale(
  monomials: CanonicalMonomial[],
  nodeIds: NodeId[],
): DetectedPattern | null {
  if (monomials.length < 2) return null;

  const gcdCoeff = gcdOfCoeffs(monomials);

  // Variabile presente in tutti i termini
  const allVarNames = new Set(monomials.flatMap(m => m.variables.map(v => v.name)));
  const sharedVars: Array<{ name: string; minExp: number }> = [];
  for (const name of allVarNames) {
    const exps = monomials.map(m => {
      const v = m.variables.find(v => v.name === name);
      return v ? v.exponent : 0;
    });
    const minExp = Math.min(...exps);
    if (minExp > 0) sharedVars.push({ name, minExp });
  }

  const hasNum = gcdCoeff > 1n;
  const hasVar = sharedVars.length > 0;
  if (!hasNum && !hasVar) return null;

  const leadingSign = monomials[0].coefficient.sign;
  const factorParts: string[] = [];
  if (hasNum) factorParts.push(`${leadingSign === -1 ? '−' : ''}${gcdCoeff}`);
  for (const { name, minExp } of sharedVars) {
    factorParts.push(minExp === 1 ? name : `${name}^${minExp}`);
  }
  const factorStr = factorParts.join('');

  // Calcola sub-pattern dopo il raccoglimento
  const subMonomials: CanonicalMonomial[] = monomials.map(m => {
    const newCoeffN = m.coefficient.n / gcdCoeff;
    const newCoeffSign = (m.coefficient.sign * leadingSign) as 1 | -1;
    const newVars = m.variables.map(v => {
      const sv = sharedVars.find(s => s.name === v.name);
      return { name: v.name, exponent: v.exponent - (sv?.minExp ?? 0) };
    }).filter(v => v.exponent > 0);
    return { id: makeId(), coefficient: { n: newCoeffN, d: m.coefficient.d, sign: newCoeffSign }, variables: newVars };
  });

  const sub = detectPatternsFromMonomials(subMonomials, nodeIds);

  return {
    pattern: 'raccoglimento_totale',
    confidence: 'certain',
    nodeIds,
    estimatedMoves: 1,
    hint: `Puoi raccogliere il fattore comune ${factorStr} da tutti i termini.`,
    subPatterns: sub,
  };
}

// ─── Differenza di quadrati ───────────────────────────────────

function checkDifferenzaQuadrati(
  monomials: CanonicalMonomial[],
  nodeIds: NodeId[],
): DetectedPattern | null {
  if (monomials.length !== 2) return null;

  const sq0 = tryExtractSquare(monomials[0]);
  const sq1 = tryExtractSquare(monomials[1]);
  if (!sq0 || !sq1) return null;
  if (sq0.sign === sq1.sign) return null; // entrambi stesso segno → NON differenza quadrati

  const posInfo = sq0.sign === 1 ? sq0 : sq1;
  const negInfo = sq0.sign === 1 ? sq1 : sq0;

  return {
    pattern: 'differenza_quadrati',
    confidence: 'certain',
    nodeIds,
    estimatedMoves: 1,
    hint: `Riconosci la forma a²−b² con a=${posInfo.label} e b=${negInfo.label}. Ricorda: (a−b)(a+b).`,
  };
}

// ─── Somma/Differenza di cubi ─────────────────────────────────

function checkCubi(
  monomials: CanonicalMonomial[],
  nodeIds: NodeId[],
): DetectedPattern | null {
  if (monomials.length !== 2) return null;

  const cb0 = tryExtractCube(monomials[0]);
  const cb1 = tryExtractCube(monomials[1]);
  if (!cb0 || !cb1) return null;

  const pattern: StrategicPattern = cb0.sign === cb1.sign ? 'somma_cubi' : 'differenza_cubi';
  const name = pattern === 'somma_cubi' ? 'somma di cubi' : 'differenza di cubi';

  return {
    pattern,
    confidence: 'certain',
    nodeIds,
    estimatedMoves: 1,
    hint: `Riconosci la ${name} a³${pattern === 'somma_cubi' ? '+' : '−'}b³ con a=${cb0.label} e b=${cb1.label}.`,
  };
}

// ─── Quadrato di binomio (3 termini) ─────────────────────────

function checkQuadratoBinomio(
  monomials: CanonicalMonomial[],
  nodeIds: NodeId[],
): DetectedPattern | null {
  if (monomials.length !== 3) return null;

  // Prova ogni coppia come "quadrati", il terzo come "doppio prodotto"
  for (let i = 0; i < 3; i++) {
    for (let j = i + 1; j < 3; j++) {
      const sq_i = tryExtractSquare(monomials[i]);
      const sq_j = tryExtractSquare(monomials[j]);
      if (!sq_i || !sq_j) continue;
      if (sq_i.sign !== 1 || sq_j.sign !== 1) continue; // i quadrati devono essere positivi

      const midIdx = [0, 1, 2].find(k => k !== i && k !== j)!;
      const mid = monomials[midIdx];

      if (!matchDoubleProduct(sq_i, sq_j, mid)) continue;

      const isSum = mid.coefficient.sign === 1;
      const pattern: StrategicPattern = isSum ? 'quadrato_binomio_somma' : 'quadrato_binomio_differenza';
      return {
        pattern,
        confidence: 'certain',
        nodeIds,
        estimatedMoves: 1,
        hint: `Questo è un quadrato di binomio: (${sq_i.label}${isSum ? '+' : '−'}${sq_j.label})². Il doppio prodotto è ${isSum ? '' : '−'}2·${sq_i.label}·${sq_j.label}.`,
      };
    }
  }
  return null;
}

// ─── Trinomio speciale x² + sx + p ───────────────────────────

function checkTrinomioSpeciale(
  monomials: CanonicalMonomial[],
  nodeIds: NodeId[],
): DetectedPattern | null {
  if (monomials.length !== 3) return null;

  // Deve essere esattamente: ax² + bx + c con a=1
  const deg2 = monomials.find(m => totalDegree(m) === 2 && m.variables.length === 1);
  const deg1 = monomials.find(m => totalDegree(m) === 1 && m.variables.length === 1);
  const deg0 = monomials.find(m => totalDegree(m) === 0);
  if (!deg2 || !deg1 || !deg0) return null;

  // La variabile deve essere la stessa
  if (deg2.variables[0].name !== deg1.variables[0].name) return null;

  // Il coefficiente di x² deve essere 1 (trinomio speciale vero)
  const leadCoeff = fracToNumber(deg2.coefficient);
  if (Math.abs(leadCoeff) !== 1) return null;

  const s = fracToNumber(deg1.coefficient) * Math.sign(leadCoeff);
  const p = fracToNumber(deg0.coefficient) * Math.sign(leadCoeff);
  const varName = deg2.variables[0].name;

  return {
    pattern: 'trinomio_speciale',
    confidence: 'certain',
    nodeIds,
    estimatedMoves: 1,
    hint: `Trinomio speciale ${varName}²+s${varName}+p con s=${s} e p=${p}. Cerca due numeri la cui somma è ${s} e il cui prodotto è ${p}.`,
  };
}

// ─── Raccoglimento parziale (4 termini) ──────────────────────

function checkRaccoglimentoParziale(
  monomials: CanonicalMonomial[],
  nodeIds: NodeId[],
): DetectedPattern | null {
  if (monomials.length !== 4) return null;
  // Verifica euristica: almeno una coppia ha un fattore comune non banale
  const pairs = [[0,1],[0,2],[0,3],[1,2],[1,3],[2,3]];
  for (const [i, j] of pairs) {
    const g = bigGcd(monomials[i].coefficient.n, monomials[j].coefficient.n);
    if (g > 1n) {
      return {
        pattern: 'raccoglimento_parziale',
        confidence: 'likely',
        nodeIds,
        estimatedMoves: 2,
        hint: 'Ragruppa i quattro termini in due coppie e raccoglile separatamente, poi cerca il fattore comune tra i due gruppi.',
      };
    }
  }
  return null;
}

function totalDegree(m: CanonicalMonomial): number {
  return m.variables.reduce((s, v) => s + v.exponent, 0);
}

// ─── Pattern per equazioni ────────────────────────────────────

function detectEquationPatterns(
  node: EquationNode,
  nodeIds: NodeId[],
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  const lhsMonos = extractNormalizedMonomials(node.lhs);
  const rhsMonos = extractNormalizedMonomials(node.rhs);

  // Combina LHS − RHS per analisi
  const allMonos = [
    ...lhsMonos,
    ...rhsMonos.map(m => ({ ...m, id: makeId(), coefficient: { ...m.coefficient, sign: (m.coefficient.sign === 1 ? -1 : 1) as 1 | -1 } })),
  ];

  const varTerms = allMonos.filter(m => m.variables.length > 0);
  const maxDeg = varTerms.length > 0 ? Math.max(...varTerms.map(totalDegree)) : 0;

  if (maxDeg === 1) {
    patterns.push({
      pattern: 'trasporto_termine',
      confidence: 'certain',
      nodeIds,
      estimatedMoves: lhsMonos.length + rhsMonos.length > 2 ? 2 : 1,
      hint: 'Porta tutti i termini con la variabile a sinistra e i numeri a destra, poi dividi per il coefficiente.',
    });
  }

  if (maxDeg === 2) {
    // Equazione incompleta spuria: 0 costante
    const hasConst = allMonos.some(m => m.variables.length === 0 && !fracIsZero(m.coefficient));
    if (!hasConst) {
      patterns.push({
        pattern: 'raccoglimento_per_equazione_spuria',
        confidence: 'certain',
        nodeIds,
        estimatedMoves: 2,
        hint: "Raccogli la variabile comune dai termini di sinistra: l'equazione incompleta spuria si risolve con il raccoglimento.",
      });
    } else {
      patterns.push({
        pattern: 'formula_quadratica',
        confidence: 'certain',
        nodeIds,
        estimatedMoves: 3,
        hint: 'Identifica i coefficienti a, b, c e calcola il discriminante Δ=b²−4ac.',
      });
    }
  }

  return patterns;
}

// ─── Funzione principale ──────────────────────────────────────

function detectPatternsFromMonomials(
  monomials: CanonicalMonomial[],
  nodeIds: NodeId[],
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  const p_racc = checkRaccoglimentoTotale(monomials, nodeIds);
  if (p_racc) patterns.push(p_racc);

  if (monomials.length === 2) {
    const p_dq = checkDifferenzaQuadrati(monomials, nodeIds);
    if (p_dq) patterns.push(p_dq);
    const p_cubi = checkCubi(monomials, nodeIds);
    if (p_cubi) patterns.push(p_cubi);
  }

  if (monomials.length === 3) {
    const p_qb = checkQuadratoBinomio(monomials, nodeIds);
    if (p_qb) patterns.push(p_qb);
    const p_ts = checkTrinomioSpeciale(monomials, nodeIds);
    if (p_ts) patterns.push(p_ts);
  }

  if (monomials.length === 4) {
    const p_rp = checkRaccoglimentoParziale(monomials, nodeIds);
    if (p_rp) patterns.push(p_rp);
  }

  return patterns;
}

export function detectPatterns(normalized: MathNode): DetectedPattern[] {
  const allNodeIds: NodeId[] = collectNodeIds(normalized);

  if (normalized.kind === 'Equation') {
    return detectEquationPatterns(normalized, allNodeIds);
  }

  const monomials = extractNormalizedMonomials(normalized);

  // Filtra termini zero (non dovrebbero esserci dopo la normalizzazione)
  const nonZero = monomials.filter(m => !fracIsZero(m.coefficient));

  return detectPatternsFromMonomials(nonZero, allNodeIds);
}

function collectNodeIds(node: MathNode): NodeId[] {
  const ids: NodeId[] = [node.id];
  switch (node.kind) {
    case 'Sum':     ids.push(...node.terms.flatMap(collectNodeIds));  break;
    case 'Product': ids.push(...node.factors.flatMap(collectNodeIds)); break;
    case 'Power':   ids.push(...collectNodeIds(node.base));            break;
    case 'Equation': ids.push(...collectNodeIds(node.lhs), ...collectNodeIds(node.rhs)); break;
    case 'Negation': ids.push(...collectNodeIds(node.operand));        break;
    default: break;
  }
  return ids;
}
