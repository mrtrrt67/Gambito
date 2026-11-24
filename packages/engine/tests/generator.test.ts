// ============================================================
// TEST — Generatore "Genera Simile"
// ============================================================
import { describe, it, expect } from 'vitest';
import { createMathAST, generateSimilar } from '../src/index.js';

describe('Solver — Genera Simile', () => {
  it('genera variante da differenza di quadrati (es. x^2 - 9)', () => {
    const ast = createMathAST('x^2 - 9');
    const sim = generateSimilar(ast);
    expect(sim.pattern).toBe('differenza_quadrati');
    expect(sim.input).toBeTruthy();

    // Il nuovo input deve essere valido e riconosciuto come differenza_quadrati
    const newAst = createMathAST(sim.input);
    expect(newAst.detectedPatterns.map(p => p.pattern)).toContain('differenza_quadrati');
  });

  it('genera variante da quadrato di binomio (es. 4x^2 + 12x + 9)', () => {
    const ast = createMathAST('4x^2 + 12x + 9');
    const sim = generateSimilar(ast);
    expect(['quadrato_binomio_somma', 'quadrato_binomio_differenza']).toContain(sim.pattern);

    const newAst = createMathAST(sim.input);
    const patterns = newAst.detectedPatterns.map(p => p.pattern);
    const hasSquare = patterns.includes('quadrato_binomio_somma') || patterns.includes('quadrato_binomio_differenza');
    expect(hasSquare).toBe(true);
  });

  it('genera variante da trinomio speciale (es. x^2 - 5x + 6)', () => {
    const ast = createMathAST('x^2 - 5x + 6');
    const sim = generateSimilar(ast);
    expect(sim.pattern).toBe('trinomio_speciale');

    const newAst = createMathAST(sim.input);
    expect(newAst.detectedPatterns.map(p => p.pattern)).toContain('trinomio_speciale');
  });

  it('genera variante da equazione lineare (es. 2x + 3 = 11)', () => {
    const ast = createMathAST('2x + 3 = 11');
    const sim = generateSimilar(ast);
    expect(sim.pattern).toBe('trasporto_termine');

    const newAst = createMathAST(sim.input);
    expect(newAst.kind).toBe('linear_equation');
  });
});
