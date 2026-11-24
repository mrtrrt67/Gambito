// ============================================================
// GAMBITO — Expression Classifier
// Classifica il tipo di esercizio e rileva i casi limite.
// ============================================================

import type {
  MathNode, EquationNode, ExpressionKind, Variable,
} from '../ast/types';
import {
  extractNormalizedMonomials,
  fracIsZero, collectLikeTerms, fracFlip,
} from '../parser/normalizer';
import type { CanonicalMonomial } from '../parser/normalizer';
import { makeId } from '../ast/builders';

function totalDegree(m: CanonicalMonomial): number {
  return m.variables.reduce((s, v) => s + v.exponent, 0);
}

function getVariables(monomials: CanonicalMonomial[]): Variable[] {
  const vars = new Set<Variable>();
  for (const m of monomials) {
    for (const v of m.variables) vars.add(v.name as Variable);
  }
  return [...vars];
}

function getMaxDegree(monomials: CanonicalMonomial[]): number {
  if (monomials.length === 0) return 0;
  return Math.max(...monomials.map(totalDegree));
}

/** Sposta tutto a sinistra: lhs - rhs */
function mergeLhsMinusRhs(
  lhsMonos: CanonicalMonomial[],
  rhsMonos: CanonicalMonomial[],
): CanonicalMonomial[] {
  const negRhs = rhsMonos.map(m => ({
    ...m,
    id: makeId(),
    coefficient: fracFlip(m.coefficient),
  }));
  return collectLikeTerms([...lhsMonos, ...negRhs]);
}

// ─── Classificazione Equazioni ────────────────────────────────

function classifyEquation(node: EquationNode): ExpressionKind {
  const lhsMonos = extractNormalizedMonomials(node.lhs);
  const rhsMonos = extractNormalizedMonomials(node.rhs);
  const merged = mergeLhsMinusRhs(lhsMonos, rhsMonos);

  const varTerms = merged.filter(m => m.variables.length > 0 && !fracIsZero(m.coefficient));
  const constTerms = merged.filter(m => m.variables.length === 0 && !fracIsZero(m.coefficient));

  // Nessuna variabile → 0 = k (impossibile) o 0 = 0 (indeterminata)
  if (varTerms.length === 0) {
    return constTerms.length > 0 ? 'impossible_equation' : 'indeterminate_equation';
  }

  const maxDeg = getMaxDegree(varTerms);

  if (maxDeg === 1) return 'linear_equation';

  if (maxDeg === 2) {
    const hasLinear = varTerms.some(m => totalDegree(m) === 1);
    const hasConst = constTerms.length > 0;

    // Incompleta spuria: 0 costante (es. x² + 3x = 0)
    if (!hasConst) return 'quadratic_incomplete_spurious';
    // Incompleta pura: 0 termine lineare (es. x² = 9)
    if (!hasLinear) return 'quadratic_incomplete_pure';
    return 'quadratic_equation';
  }

  return 'polynomial_single_var'; // grado > 2
}

// ─── Classificazione Polinomi ─────────────────────────────────

function classifyPolynomial(monomials: CanonicalMonomial[]): ExpressionKind {
  const nonZero = monomials.filter(m => !fracIsZero(m.coefficient));

  const vars = getVariables(nonZero);
  if (vars.length === 0) return 'numeric_expression';

  const maxDeg = getMaxDegree(nonZero);

  if (vars.length > 1) return 'polynomial_multi_var';

  // Polinomio a singola variabile: controlla irriducibilità
  if (maxDeg === 2 && nonZero.length === 2) {
    // Somma di quadrati: entrambi i termini positivi e quadrati perfetti (coefficienti)
    const [t1, t2] = nonZero;
    const bothPos = t1.coefficient.sign === 1 && t2.coefficient.sign === 1;
    const isSquare = (m: CanonicalMonomial) => {
      if (m.variables.length === 0) return true; // costante
      if (m.variables.length === 1 && m.variables[0].exponent % 2 === 0) return true;
      return false;
    };
    if (bothPos && isSquare(t1) && isSquare(t2)) {
      return 'irreducible_polynomial'; // somma di quadrati
    }
  }

  return 'polynomial_single_var';
}

// ─── API pubblica ─────────────────────────────────────────────

export interface ClassifierResult {
  kind: ExpressionKind;
  variables: Variable[];
  maxDegree: number;
  hasIrrationals: boolean;
  termCount: number;
}

export function classifyExpression(normalized: MathNode): ClassifierResult {
  if (normalized.kind === 'Equation') {
    const eq = normalized as EquationNode;
    const lhsMonos = extractNormalizedMonomials(eq.lhs);
    const rhsMonos = extractNormalizedMonomials(eq.rhs);
    const allMonos = [...lhsMonos, ...rhsMonos];
    return {
      kind: classifyEquation(eq),
      variables: getVariables(allMonos),
      maxDegree: getMaxDegree(allMonos),
      hasIrrationals: false, // TODO Fase 4
      termCount: lhsMonos.length + rhsMonos.length,
    };
  }

  const monos = extractNormalizedMonomials(normalized);
  return {
    kind: classifyPolynomial(monos),
    variables: getVariables(monos),
    maxDegree: getMaxDegree(monos),
    hasIrrationals: false, // TODO Fase 4
    termCount: monos.length,
  };
}
