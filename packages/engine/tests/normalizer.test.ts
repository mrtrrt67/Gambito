// ============================================================
// TEST — Normalizer
// ============================================================
import { describe, it, expect } from 'vitest';
import { parse } from '../src/parser/parser.js';
import { normalize, fracToNumber } from '../src/parser/normalizer.js';
import { resetIdCounter } from '../src/ast/builders.js';

beforeEach(() => resetIdCounter());

/** Helper: normalizza e restituisce i termini di una Somma */
function terms(input: string) {
  const ast = normalize(parse(input));
  if (ast.kind === 'Sum') return ast.terms;
  return [ast]; // singolo termine
}

/** Helper: dato un VariableNode, restituisce il coefficiente come numero */
function coeff(node: ReturnType<typeof terms>[number]): number {
  if (node.kind === 'Variable') return fracToNumber(node.coefficient);
  if (node.kind === 'Number')   return fracToNumber(node.value);
  return NaN;
}

describe('Normalizer — forma canonica', () => {
  it('un numero resta un numero', () => {
    const ast = normalize(parse('7'));
    expect(ast.kind).toBe('Number');
    if (ast.kind === 'Number') expect(fracToNumber(ast.value)).toBe(7);
  });

  it('2x normalizza in VariableNode con coeff=2', () => {
    const ast = normalize(parse('2x'));
    expect(ast.kind).toBe('Variable');
    if (ast.kind === 'Variable') {
      expect(fracToNumber(ast.coefficient)).toBe(2);
      expect(ast.name).toBe('x');
      expect(ast.exponent).toBe(1);
    }
  });

  it('4x^2 → VariableNode(x, exp=2, coeff=4)', () => {
    const ast = normalize(parse('4x^2'));
    expect(ast.kind).toBe('Variable');
    if (ast.kind === 'Variable') {
      expect(ast.exponent).toBe(2);
      expect(fracToNumber(ast.coefficient)).toBe(4);
    }
  });

  it('-2x^2 → VariableNode(x, exp=2, coeff=-2)', () => {
    const ast = normalize(parse('-2x^2'));
    expect(ast.kind).toBe('Variable');
    if (ast.kind === 'Variable') {
      expect(ast.exponent).toBe(2);
      expect(fracToNumber(ast.coefficient)).toBe(-2);
    }
  });

  it('9 - x^2 → Sum ordinata per grado: [-x^2, 9]', () => {
    const t = terms('9 - x^2');
    expect(t).toHaveLength(2);
    // Primo termine: -x^2 (grado 2)
    expect(t[0]!.kind).toBe('Variable');
    expect(coeff(t[0]!)).toBe(-1);
    // Secondo termine: 9 (grado 0)
    expect(t[1]!.kind).toBe('Number');
    expect(coeff(t[1]!)).toBe(9);
  });

  it('-2x^2 + 8 → Sum: [-2x^2, 8]', () => {
    const t = terms('-2x^2 + 8');
    expect(t).toHaveLength(2);
    expect(coeff(t[0]!)).toBe(-2);
    expect(coeff(t[1]!)).toBe(8);
  });

  it('x^2 + 4 → Sum: [x^2, 4]', () => {
    const t = terms('x^2 + 4');
    expect(t).toHaveLength(2);
    expect(coeff(t[0]!)).toBe(1);
    if (t[0]!.kind === 'Variable') expect(t[0]!.exponent).toBe(2);
    expect(coeff(t[1]!)).toBe(4);
  });

  it('4x^2 + 12x + 9 → Sum ordinata: [4x^2, 12x, 9]', () => {
    const t = terms('4x^2 + 12x + 9');
    expect(t).toHaveLength(3);
    expect(coeff(t[0]!)).toBe(4);
    expect(coeff(t[1]!)).toBe(12);
    expect(coeff(t[2]!)).toBe(9);
  });

  it('2(x+3) - x normalizza in x + 6 (raccoglie termini simili)', () => {
    const ast = normalize(parse('2(x+3) - x'));
    const t = ast.kind === 'Sum' ? ast.terms : [ast];
    expect(t).toHaveLength(2);
    // Deve avere un termine x (coeff=1) e un termine 6
    const xTerm = t.find(n => n.kind === 'Variable');
    const cTerm = t.find(n => n.kind === 'Number');
    expect(xTerm).toBeTruthy();
    expect(cTerm).toBeTruthy();
    if (xTerm) expect(coeff(xTerm)).toBe(1);
    if (cTerm) expect(coeff(cTerm)).toBe(6);
  });

  it('equazione 2(x+3) - x = 5 → Equation(x+6, 5)', () => {
    const ast = normalize(parse('2(x+3) - x = 5'));
    expect(ast.kind).toBe('Equation');
    if (ast.kind === 'Equation') {
      expect(ast.rhs.kind).toBe('Number');
      if (ast.rhs.kind === 'Number') expect(fracToNumber(ast.rhs.value)).toBe(5);
    }
  });

  it('raccoglie termini simili: 3x + x → 4x', () => {
    const ast = normalize(parse('3x + x'));
    expect(ast.kind).toBe('Variable');
    if (ast.kind === 'Variable') expect(fracToNumber(ast.coefficient)).toBe(4);
  });

  it('annulla termini opposti: x - x → 0', () => {
    const ast = normalize(parse('x - x'));
    expect(ast.kind).toBe('Number');
    if (ast.kind === 'Number') expect(fracToNumber(ast.value)).toBe(0);
  });

  it('mantiene le frazioni esatte: x/2 + x/3 → 5x/6', () => {
    const ast = normalize(parse('x/2 + x/3'));
    expect(ast.kind).toBe('Variable');
    if (ast.kind === 'Variable') {
      expect(ast.coefficient.n).toBe(5n);
      expect(ast.coefficient.d).toBe(6n);
    }
  });
});
