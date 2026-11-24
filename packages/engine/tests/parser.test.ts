// ============================================================
// TEST — Parser (raw AST)
// ============================================================
import { describe, it, expect } from 'vitest';
import { parse, ParseError } from '../src/parser/parser.js';
import { resetIdCounter } from '../src/ast/builders.js';

beforeEach(() => resetIdCounter());

describe('Parser — struttura raw AST', () => {
  it('parsifica un numero', () => {
    const ast = parse('42');
    expect(ast.kind).toBe('Number');
    if (ast.kind === 'Number') {
      expect(ast.value.n).toBe(42n);
      expect(ast.value.sign).toBe(1);
    }
  });

  it('parsifica una variabile', () => {
    const ast = parse('x');
    expect(ast.kind).toBe('Variable');
    if (ast.kind === 'Variable') {
      expect(ast.name).toBe('x');
      expect(ast.exponent).toBe(1);
    }
  });

  it('parsifica x^2', () => {
    const ast = parse('x^2');
    expect(ast.kind).toBe('Power');
    if (ast.kind === 'Power') {
      expect(ast.exponent).toBe(2);
      expect(ast.base.kind).toBe('Variable');
    }
  });

  it('parsifica 2x come prodotto implicito', () => {
    const ast = parse('2x');
    expect(ast.kind).toBe('Product');
    if (ast.kind === 'Product') {
      expect(ast.factors).toHaveLength(2);
      expect(ast.factors[0]!.kind).toBe('Number');
      expect(ast.factors[1]!.kind).toBe('Variable');
    }
  });

  it('parsifica 4x^2 come Product(4, Power(x,2))', () => {
    const ast = parse('4x^2');
    expect(ast.kind).toBe('Product');
    if (ast.kind === 'Product') {
      expect(ast.factors[0]!.kind).toBe('Number');
      const pow = ast.factors[1]!;
      expect(pow.kind).toBe('Power');
      if (pow.kind === 'Power') expect(pow.exponent).toBe(2);
    }
  });

  it('parsifica -2x^2 come Negation(Product(2, Power(x,2)))', () => {
    const ast = parse('-2x^2');
    expect(ast.kind).toBe('Negation');
  });

  it('parsifica 9 - x^2 come Sum([9, Negation(Power(x,2))])', () => {
    const ast = parse('9 - x^2');
    expect(ast.kind).toBe('Sum');
    if (ast.kind === 'Sum') {
      expect(ast.terms).toHaveLength(2);
      expect(ast.terms[0]!.kind).toBe('Number');
      expect(ast.terms[1]!.kind).toBe('Negation');
    }
  });

  it('parsifica equazione: 2(x+3) - x = 5', () => {
    const ast = parse('2(x+3) - x = 5');
    expect(ast.kind).toBe('Equation');
    if (ast.kind === 'Equation') {
      expect(ast.relation).toBe('=');
      expect(ast.lhs.kind).toBe('Sum');
      expect(ast.rhs.kind).toBe('Number');
    }
  });

  it('parsifica potenze multiple con parentesi o flat', () => {
    // 2^3 = Power(2, 3)
    const ast = parse('2^3');
    expect(ast.kind).toBe('Power');
    if (ast.kind === 'Power') {
      expect(ast.exponent).toBe(3);
      expect(ast.base.kind).toBe('Number');
    }
  });

  it('lancia ParseError su input vuoto', () => {
    expect(() => parse('')).toThrow(ParseError);
  });

  it('lancia ParseError su parentesi non chiusa', () => {
    expect(() => parse('(x+1')).toThrow(ParseError);
  });

  it('lancia ParseError su esponente non intero', () => {
    expect(() => parse('x^0.5')).toThrow(ParseError);
  });
});
