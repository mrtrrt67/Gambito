// ============================================================
// GAMBITO — Normalizer
//
// Converte il raw AST del parser in una forma canonica:
//   - SumNode di monomiali VariableNode/NumberNode
//   - Nessun NegationNode (il segno è nel coefficient)
//   - Termini ordinati per grado decrescente
//   - Termini con coefficiente zero eliminati
//   - Distribuzione automatica dei prodotti sulle somme
//
// Rappresentazione intermedia: CanonicalMonomial
//   coefficient * ∏(variable^exponent)
// ============================================================

import { makeId } from '../ast/builders';
import type {
  MathNode, NumberNode, VariableNode, SumNode, EquationNode,
  Variable, Fraction, NodeId,
} from '../ast/types';

// ─── Monomial intermedio ─────────────────────────────────────

export interface CanonicalMonomial {
  id: NodeId;
  coefficient: Fraction;
  variables: Array<{ name: Variable; exponent: number }>;
}

export type CanonicalPolynomial = CanonicalMonomial[];

// ─── Aritmetica Fraction (BigInt) ────────────────────────────

function gcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b > 0n) [a, b] = [b, a % b];
  return a === 0n ? 1n : a;
}

export function fracSign(f: Fraction): 1 | -1 { return f.sign; }

export function fracAbs(f: Fraction): Fraction {
  return { n: f.n, d: f.d, sign: 1 };
}

export function fracFlip(f: Fraction): Fraction {
  if (f.n === 0n) return f;
  return { n: f.n, d: f.d, sign: f.sign === 1 ? -1 : 1 };
}

export function fracMul(a: Fraction, b: Fraction): Fraction {
  const n = a.n * b.n;
  const d = a.d * b.d;
  const sign = (a.sign * b.sign) as 1 | -1;
  if (n === 0n) return { n: 0n, d: 1n, sign: 1 };
  const g = gcd(n, d);
  return { n: n / g, d: d / g, sign };
}

export function fracAdd(a: Fraction, b: Fraction): Fraction {
  // a.sign*a.n/a.d + b.sign*b.n/b.d
  const na = BigInt(a.sign) * a.n * b.d;
  const nb = BigInt(b.sign) * b.n * a.d;
  const denom = a.d * b.d;
  const num = na + nb;
  if (num === 0n) return { n: 0n, d: 1n, sign: 1 };
  const sign = num < 0n ? -1 : 1;
  const absNum = num < 0n ? -num : num;
  const g = gcd(absNum, denom);
  return { n: absNum / g, d: denom / g, sign: sign as 1 | -1 };
}

export function fracToNumber(f: Fraction): number {
  return (f.sign === -1 ? -1 : 1) * Number(f.n) / Number(f.d);
}

export function fracIsZero(f: Fraction): boolean {
  return f.n === 0n;
}

export function fracEqual(a: Fraction, b: Fraction): boolean {
  if (fracIsZero(a) && fracIsZero(b)) return true;
  return a.sign === b.sign && a.n === b.n && a.d === b.d;
}

// ─── Estrazione monomiali dal raw AST ────────────────────────

function extractMonomials(node: MathNode): CanonicalMonomial[] {
  switch (node.kind) {

    case 'Number':
      return [{ id: node.id, coefficient: node.value, variables: [] }];

    case 'Variable':
      return [{
        id: node.id,
        coefficient: node.coefficient,
        variables: [{ name: node.name, exponent: node.exponent }],
      }];

    case 'Irrational':
      // Per ora trattiamo π come costante numerica (trig = Fase 4)
      return [{ id: node.id, coefficient: node.coefficient, variables: [] }];

    case 'Sum':
      return node.terms.flatMap(extractMonomials);

    case 'Negation': {
      const inner = extractMonomials(node.operand);
      return inner.map(m => ({ ...m, id: makeId(), coefficient: fracFlip(m.coefficient) }));
    }

    case 'Product':
      return multiplyMonomialLists(node.factors.map(extractMonomials));

    case 'Power': {
      // Caso semplice: base è una variabile senza prodotto
      if (node.base.kind === 'Variable') {
        const base = node.base;
        return [{
          id: node.id,
          coefficient: base.coefficient,
          variables: [{ name: base.name, exponent: base.exponent * node.exponent }],
        }];
      }
      // Caso semplice: base è un numero (es. 3^2 = 9)
      if (node.base.kind === 'Number' && node.exponent <= 6) {
        let result: Fraction = { n: 1n, d: 1n, sign: 1 };
        for (let k = 0; k < node.exponent; k++) result = fracMul(result, node.base.value);
        return [{ id: node.id, coefficient: result, variables: [] }];
      }
      // Caso: base è un Product o Negation (es. (-2x)^2)
      if (node.base.kind === 'Negation' || node.base.kind === 'Product') {
        // Espandiamo: (base)^n = base * base * ... (n volte)
        const baseMonos = extractMonomials(node.base);
        let acc = baseMonos;
        for (let k = 1; k < node.exponent; k++) {
          acc = multiplyMonomialLists([acc, baseMonos]);
        }
        return acc;
      }
      // Caso: base è una SumNode: espansione NON eseguita qui
      // (l'utente deve farlo manualmente tramite le mosse di gioco)
      throw new NormalizerError(
        `Espressione nella base della potenza non ancora supportata: ${node.base.kind}^${node.exponent}`,
      );
    }

    case 'Fraction': {
      // Tratta num/den come un fattore a coefficiente frazionario
      const numMonos = extractMonomials(node.numerator);
      const denMonos = extractMonomials(node.denominator);
      // Supporta solo denominatore costante per ora
      if (denMonos.length !== 1 || denMonos[0].variables.length !== 0) {
        throw new NormalizerError('Denominatore non costante non supportato');
      }
      const denFrac = denMonos[0].coefficient;
      // Moltiplica il numeratore per 1/den
      const invDen: Fraction = { n: denFrac.n, d: denFrac.d, sign: denFrac.sign };
      return numMonos.map(m => ({
        ...m,
        id: makeId(),
        coefficient: { n: m.coefficient.n * invDen.d, d: m.coefficient.d * invDen.n, sign: (m.coefficient.sign * invDen.sign) as 1 | -1 },
      }));
    }

    case 'Equation':
      throw new NormalizerError('Usa normalize() per le equazioni, non extractMonomials()');

    case 'Sqrt':
      // Lasciamo i nodi Sqrt intatti per ora (gestiti da Fase 4 — trig)
      return [{ id: node.id, coefficient: node.coefficient, variables: [] }];

    default: {
      const _: never = node;
      throw new NormalizerError(`Tipo di nodo sconosciuto: ${(node as MathNode).kind}`);
    }
  }
}

// ─── Moltiplicazione tra liste di monomiali ──────────────────

function multiplyMonomialLists(lists: CanonicalMonomial[][]): CanonicalMonomial[] {
  if (lists.length === 0) return [{ id: makeId(), coefficient: { n: 1n, d: 1n, sign: 1 }, variables: [] }];
  let result = lists[0];
  for (let k = 1; k < lists.length; k++) {
    const next = lists[k];
    const products: CanonicalMonomial[] = [];
    for (const a of result) {
      for (const b of next) {
        products.push(mulTwoMonomials(a, b));
      }
    }
    result = collectLikeTerms(products);
  }
  return result;
}

function mulTwoMonomials(a: CanonicalMonomial, b: CanonicalMonomial): CanonicalMonomial {
  const coeff = fracMul(a.coefficient, b.coefficient);
  const varMap = new Map<Variable, number>(a.variables.map(v => [v.name, v.exponent]));
  for (const { name, exponent } of b.variables) {
    varMap.set(name, (varMap.get(name) ?? 0) + exponent);
  }
  const variables = [...varMap.entries()]
    .filter(([, exp]) => exp > 0)
    .map(([name, exponent]) => ({ name, exponent }));
  return { id: makeId(), coefficient: coeff, variables };
}

// ─── Raccolta di termini simili ───────────────────────────────

export function collectLikeTerms(monomials: CanonicalMonomial[]): CanonicalMonomial[] {
  const groups = new Map<string, CanonicalMonomial[]>();
  for (const m of monomials) {
    const key = varKey(m.variables);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(m);
  }
  const result: CanonicalMonomial[] = [];
  for (const group of groups.values()) {
    const coeff = group.reduce<Fraction>(
      (acc, m) => fracAdd(acc, m.coefficient),
      { n: 0n, d: 1n, sign: 1 },
    );
    if (!fracIsZero(coeff)) {
      result.push({ id: makeId(), coefficient: coeff, variables: group[0].variables });
    }
  }
  return result;
}

function varKey(vars: Array<{ name: Variable; exponent: number }>): string {
  return [...vars]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(v => `${v.name}^${v.exponent}`)
    .join('·');
}

// ─── Ordinamento per grado decrescente ───────────────────────

function totalDegree(m: CanonicalMonomial): number {
  return m.variables.reduce((s, v) => s + v.exponent, 0);
}

function sortMonomials(monomials: CanonicalMonomial[]): CanonicalMonomial[] {
  return [...monomials].sort((a, b) => {
    const dA = totalDegree(a), dB = totalDegree(b);
    if (dA !== dB) return dB - dA; // grado decrescente
    return varKey(a.variables).localeCompare(varKey(b.variables));
  });
}

// ─── Conversione CanonicalMonomial → MathNode ─────────────────

function monomialToNode(m: CanonicalMonomial): MathNode {
  if (m.variables.length === 0) {
    const node: NumberNode = { id: m.id, kind: 'Number', value: m.coefficient };
    return node;
  }
  if (m.variables.length === 1) {
    const node: VariableNode = {
      id: m.id, kind: 'Variable',
      name: m.variables[0].name,
      exponent: m.variables[0].exponent,
      coefficient: m.coefficient,
    };
    return node;
  }
  // Multi-variabile: per ora restituiamo il primo termine
  // TODO (Fase 4): ProductNode di VariableNode separati
  const node: VariableNode = {
    id: m.id, kind: 'Variable',
    name: m.variables[0].name,
    exponent: m.variables[0].exponent,
    coefficient: m.coefficient,
  };
  return node;
}

function canonToAST(monomials: CanonicalMonomial[]): MathNode {
  if (monomials.length === 0) {
    const node: NumberNode = { id: makeId(), kind: 'Number', value: { n: 0n, d: 1n, sign: 1 } };
    return node;
  }
  if (monomials.length === 1) return monomialToNode(monomials[0]);
  const sumNode: SumNode = {
    id: makeId(), kind: 'Sum',
    terms: monomials.map(monomialToNode),
  };
  return sumNode;
}

// ─── Normalizzazione di un polinomio ─────────────────────────

function normalizePoly(node: MathNode): MathNode {
  const raw = extractMonomials(node);
  const collected = collectLikeTerms(raw);
  const sorted = sortMonomials(collected);
  return canonToAST(sorted);
}

// ─── API pubblica ─────────────────────────────────────────────

export class NormalizerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NormalizerError';
  }
}

/** Normalizza un raw AST restituendo la forma canonica.
 *  Gestisce sia espressioni che equazioni. */
export function normalize(node: MathNode): MathNode {
  if (node.kind === 'Equation') {
    const eq = node as EquationNode;
    const lhsNorm = normalizePoly(eq.lhs);
    const rhsNorm = normalizePoly(eq.rhs);
    const eqNode: EquationNode = {
      id: makeId(), kind: 'Equation',
      lhs: lhsNorm, rhs: rhsNorm, relation: eq.relation,
    };
    return eqNode;
  }
  return normalizePoly(node);
}

/** Estrae la lista di CanonicalMonomial da un AST già normalizzato.
 *  Usato da patternDetector e parCalculator. */
export function extractNormalizedMonomials(node: MathNode): CanonicalMonomial[] {
  if (node.kind === 'Sum') {
    return node.terms.flatMap(t => extractNormalizedMonomials(t));
  }
  if (node.kind === 'Variable') {
    return [{
      id: node.id,
      coefficient: node.coefficient,
      variables: [{ name: node.name, exponent: node.exponent }],
    }];
  }
  if (node.kind === 'Number') {
    return [{ id: node.id, coefficient: node.value, variables: [] }];
  }
  // Nodo non canonico: ri-estrai
  return extractMonomials(node);
}
