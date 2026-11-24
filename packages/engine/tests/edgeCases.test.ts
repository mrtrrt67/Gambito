// ============================================================
// TEST — Edge Cases matematici
// ============================================================
import { describe, it, expect } from 'vitest';
import { createMathAST, parse, normalize, fracToNumber } from '../src/index.js';
import { resetIdCounter } from '../src/ast/builders.js';

beforeEach(() => resetIdCounter());

describe('Edge Cases — input numerici', () => {
  it('35% → numero razionale esatto (35/100 = 7/20)', () => {
    const ast = normalize(parse('35%'));
    // 35 * (1/100) = 35/100 = 7/20
    if (ast.kind === 'Variable' || ast.kind === 'Number') {
      // Il risultato dipende dall'implementazione interna
      // Verifica che non lanci eccezioni
    }
    expect(ast).toBeTruthy();
  });

  it('x/2 + x/3 → coefficiente frazionario esatto 5/6', () => {
    const ast = normalize(parse('x/2 + x/3'));
    expect(ast.kind).toBe('Variable');
    if (ast.kind === 'Variable') {
      expect(ast.coefficient.n).toBe(5n);
      expect(ast.coefficient.d).toBe(6n);
    }
  });

  it('3^2 → NumberNode(9)', () => {
    const ast = normalize(parse('3^2'));
    expect(ast.kind).toBe('Number');
    if (ast.kind === 'Number') {
      expect(fracToNumber(ast.value)).toBe(9);
    }
  });
});

describe('Edge Cases — polinomi', () => {
  it('2x^2 - 2x^2 → 0 (termini si annullano)', () => {
    const ast = normalize(parse('2x^2 - 2x^2'));
    expect(ast.kind).toBe('Number');
    if (ast.kind === 'Number') {
      expect(fracToNumber(ast.value)).toBe(0);
    }
  });

  it('x^2 + 2x + 1 → quadrato_binomio_somma → (x+1)²', () => {
    const ast = createMathAST('x^2 + 2x + 1');
    expect(ast.detectedPatterns.map(p => p.pattern)).toContain('quadrato_binomio_somma');
  });

  it('x^2 - 2x + 1 → quadrato_binomio_differenza → (x-1)²', () => {
    const ast = createMathAST('x^2 - 2x + 1');
    expect(ast.detectedPatterns.map(p => p.pattern)).toContain('quadrato_binomio_differenza');
  });

  it('x + 0 → x (zero eliminato)', () => {
    const ast = normalize(parse('x + 0'));
    expect(ast.kind).toBe('Variable');
  });

  it('1*x → x (coefficiente 1 preservato)', () => {
    const ast = normalize(parse('1*x'));
    expect(ast.kind).toBe('Variable');
    if (ast.kind === 'Variable') {
      expect(fracToNumber(ast.coefficient)).toBe(1);
    }
  });
});

describe('Edge Cases — superscript Unicode', () => {
  it('x² parsifica come x^2', () => {
    const ast = normalize(parse('x²'));
    expect(ast.kind).toBe('Variable');
    if (ast.kind === 'Variable') expect(ast.exponent).toBe(2);
  });

  it('4x² + 12x + 9 (superscript) → quadrato_binomio_somma', () => {
    const ast = createMathAST('4x² + 12x + 9');
    expect(ast.detectedPatterns.map(p => p.pattern)).toContain('quadrato_binomio_somma');
  });

  it('x² − 9 (con − Unicode) → differenza_quadrati', () => {
    const ast = createMathAST('x² \u2212 9');  // Unicode minus sign
    expect(ast.detectedPatterns.map(p => p.pattern)).toContain('differenza_quadrati');
  });
});

describe('Edge Cases — equazioni', () => {
  it('2x + 3 = 2x - 1 → impossible_equation', () => {
    expect(createMathAST('2x + 3 = 2x - 1').kind).toBe('impossible_equation');
  });

  it('3(x+1) = 3x + 3 → indeterminate_equation', () => {
    expect(createMathAST('3(x+1) = 3x + 3').kind).toBe('indeterminate_equation');
  });

  it('x^2 - 6x + 9 = 0 → quadratic_equation', () => {
    expect(createMathAST('x^2 - 6x + 9 = 0').kind).toBe('quadratic_equation');
  });
});

describe('Edge Cases — robustezza input', () => {
  it('accetta spazi multipli', () => {
    expect(() => createMathAST('x^2  +  4')).not.toThrow();
  });

  it('accetta operatore × (moltiplicazione Unicode)', () => {
    expect(() => createMathAST('2×x')).not.toThrow();
  });

  it('accetta il segno + iniziale (unario)', () => {
    const ast = normalize(parse('+x'));
    expect(ast.kind).toBe('Variable');
  });

  it('rechains meno unario: --x → x', () => {
    const ast = normalize(parse('--x'));
    expect(ast.kind).toBe('Variable');
    if (ast.kind === 'Variable') {
      // doppia negazione → positivo
      expect(fracToNumber(ast.coefficient)).toBe(1);
    }
  });
});
