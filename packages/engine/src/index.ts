// ============================================================
// GAMBITO — Engine Public API
// ============================================================

export { parse, ParseError } from './parser/parser';
export { tokenize, TokenizerError } from './parser/tokenizer';
export { normalize, NormalizerError, fracToNumber, fracIsZero, fracAdd, fracMul, fracFlip } from './parser/normalizer';
export { detectPatterns } from './classifier/patternDetector';
export { classifyExpression } from './classifier/expressionClassifier';
export { calculatePar } from './solver/parCalculator';
export { generateSimilar } from './solver/generator';
export type { GeneratedExercise } from './solver/generator';
export { makeError } from './validator/errorMessages';
export type { ErrorCode, MoveError } from './validator/errorMessages';
export { makeId, resetIdCounter } from './ast/builders';
export type {
  MathNode, MathAST, NodeId, Variable,
  ExpressionKind, StrategicPattern, DetectedPattern,
  NumberNode, VariableNode, SumNode, ProductNode, PowerNode,
  EquationNode, NegationNode, Fraction, ASTMetadata,
} from './ast/types';
export type { CanonicalMonomial } from './parser/normalizer';
export type { ClassifierResult } from './classifier/expressionClassifier';

import { parse } from './parser/parser';
import { normalize } from './parser/normalizer';
import { detectPatterns } from './classifier/patternDetector';
import { classifyExpression } from './classifier/expressionClassifier';
import { calculatePar } from './solver/parCalculator';
import type { MathAST } from './ast/types';

/** Funzione di ingresso principale: stringa → MathAST completo.
 *
 * Lancia ParseError o NormalizerError in caso di input non valido.
 *
 * @example
 *   const ast = createMathAST('4x^2 + 12x + 9');
 *   ast.kind           // 'polynomial_single_var'
 *   ast.par            // 1
 *   ast.detectedPatterns[0].pattern // 'quadrato_binomio_somma'
 */
export function createMathAST(input: string): MathAST {
  const rawAST = parse(input);
  const normalized = normalize(rawAST);
  const classResult = classifyExpression(normalized);
  const detectedPatterns = detectPatterns(normalized);
  const par = calculatePar(classResult.kind, detectedPatterns);

  return {
    root: normalized,
    kind: classResult.kind,
    detectedPatterns,
    metadata: {
      variables: classResult.variables,
      maxDegree: classResult.maxDegree,
      hasIrrationals: classResult.hasIrrationals,
      isEquation: normalized.kind === 'Equation',
      inputRaw: input,
      termCount: classResult.termCount,
    },
    par,
  };
}
