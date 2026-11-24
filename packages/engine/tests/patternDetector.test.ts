// ============================================================
// TEST — I 5 Casi Bastardi + Pattern Detector
//
// Questi sono i casi che mandano in crisi i parser ingenui.
// Tutti devono passare PRIMA di procedere alla Fase 3 (UI).
// ============================================================
import { describe, it, expect } from 'vitest';
import { createMathAST } from '../src/index.js';
import { resetIdCounter } from '../src/ast/builders.js';

beforeEach(() => resetIdCounter());

// ─── Helper ──────────────────────────────────────────────────
function patterns(input: string) {
  return createMathAST(input).detectedPatterns.map(p => p.pattern);
}

function allPatterns(input: string) {
  const ast = createMathAST(input);
  // Includi anche sub-pattern
  const collect = (ps: typeof ast.detectedPatterns): string[] =>
    ps.flatMap(p => [p.pattern, ...(p.subPatterns ? collect(p.subPatterns) : [])]);
  return collect(ast.detectedPatterns);
}

// ════════════════════════════════════════════════════════════
// I 5 CASI BASTARDI
// ════════════════════════════════════════════════════════════

describe('⚔️  Caso Bastardo 1 — 9 - x^2 (ordine invertito)', () => {
  it('parsifica senza errori', () => {
    expect(() => createMathAST('9 - x^2')).not.toThrow();
  });

  it('è classificato come polynomial_single_var', () => {
    expect(createMathAST('9 - x^2').kind).toBe('polynomial_single_var');
  });

  it('rileva differenza_quadrati', () => {
    expect(patterns('9 - x^2')).toContain('differenza_quadrati');
  });

  it('Par = 1 (scomposizione diretta)', () => {
    expect(createMathAST('9 - x^2').par).toBe(1);
  });

  it("l'hint menziona a e b", () => {
    const ast = createMathAST('9 - x^2');
    const dq = ast.detectedPatterns.find(p => p.pattern === 'differenza_quadrati');
    expect(dq?.hint).toBeTruthy();
    expect(dq?.hint).toMatch(/a=|b=/);
  });
});

describe('⚔️  Caso Bastardo 2 — -2x^2 + 8 (raccoglimento del segno meno)', () => {
  it('parsifica senza errori', () => {
    expect(() => createMathAST('-2x^2 + 8')).not.toThrow();
  });

  it('è classificato come polynomial_single_var', () => {
    expect(createMathAST('-2x^2 + 8').kind).toBe('polynomial_single_var');
  });

  it('rileva raccoglimento_totale come pattern principale', () => {
    expect(patterns('-2x^2 + 8')).toContain('raccoglimento_totale');
  });

  it('rileva differenza_quadrati come sub-pattern', () => {
    expect(allPatterns('-2x^2 + 8')).toContain('differenza_quadrati');
  });

  it('Par = 2 (raccoglimento + differenza quadrati)', () => {
    expect(createMathAST('-2x^2 + 8').par).toBe(2);
  });

  it("l'hint del raccoglimento menziona il fattore −2", () => {
    const ast = createMathAST('-2x^2 + 8');
    const racc = ast.detectedPatterns.find(p => p.pattern === 'raccoglimento_totale');
    expect(racc?.hint).toMatch(/−2|fattore/);
  });
});

describe('⚔️  Caso Bastardo 3 — x^2 + 4 (somma di quadrati, irriducibile)', () => {
  it('parsifica senza errori', () => {
    expect(() => createMathAST('x^2 + 4')).not.toThrow();
  });

  it('è classificato come irreducible_polynomial', () => {
    expect(createMathAST('x^2 + 4').kind).toBe('irreducible_polynomial');
  });

  it('NON rileva differenza_quadrati (entrambi positivi)', () => {
    expect(patterns('x^2 + 4')).not.toContain('differenza_quadrati');
  });

  it('NON rileva raccoglimento_totale (GCD=1, nessuna variabile comune)', () => {
    expect(patterns('x^2 + 4')).not.toContain('raccoglimento_totale');
  });

  it('Par = 1 (dichiarazione irriducibile)', () => {
    expect(createMathAST('x^2 + 4').par).toBe(1);
  });
});

describe('⚔️  Caso Bastardo 4 — 4x^2 + 12x + 9 (quadrato di binomio, coeff ≠ 1)', () => {
  it('parsifica senza errori', () => {
    expect(() => createMathAST('4x^2 + 12x + 9')).not.toThrow();
  });

  it('è classificato come polynomial_single_var', () => {
    expect(createMathAST('4x^2 + 12x + 9').kind).toBe('polynomial_single_var');
  });

  it('rileva quadrato_binomio_somma', () => {
    expect(patterns('4x^2 + 12x + 9')).toContain('quadrato_binomio_somma');
  });

  it("NON rileva trinomio_speciale (coeff x² = 4 ≠ 1)", () => {
    expect(patterns('4x^2 + 12x + 9')).not.toContain('trinomio_speciale');
  });

  it('Par = 1 (applicazione diretta della formula)', () => {
    expect(createMathAST('4x^2 + 12x + 9').par).toBe(1);
  });

  it("l'hint identifica i fattori (2x+3)²", () => {
    const ast = createMathAST('4x^2 + 12x + 9');
    const qb = ast.detectedPatterns.find(p => p.pattern === 'quadrato_binomio_somma');
    expect(qb?.hint).toMatch(/2x|3/);
  });
});

describe('⚔️  Caso Bastardo 5 — 2(x+3) - x = 5 (equazione con parentesi)', () => {
  it('parsifica senza errori', () => {
    expect(() => createMathAST('2(x+3) - x = 5')).not.toThrow();
  });

  it('è classificato come linear_equation', () => {
    expect(createMathAST('2(x+3) - x = 5').kind).toBe('linear_equation');
  });

  it('è una equazione (isEquation = true)', () => {
    expect(createMathAST('2(x+3) - x = 5').metadata.isEquation).toBe(true);
  });

  it('maxDegree = 1', () => {
    expect(createMathAST('2(x+3) - x = 5').metadata.maxDegree).toBe(1);
  });

  it('rileva trasporto_termine', () => {
    expect(patterns('2(x+3) - x = 5')).toContain('trasporto_termine');
  });
});

// ════════════════════════════════════════════════════════════
// PATTERN DETECTOR — altri casi
// ════════════════════════════════════════════════════════════

describe('Pattern Detector — altri polinomi', () => {
  it('x^2 - 9 → differenza_quadrati', () => {
    expect(patterns('x^2 - 9')).toContain('differenza_quadrati');
  });

  it('4x^2 - 9 → differenza_quadrati (coefficienti diversi da 1)', () => {
    expect(patterns('4x^2 - 9')).toContain('differenza_quadrati');
  });

  it('x^2 - 6x + 9 → quadrato_binomio_differenza', () => {
    expect(patterns('x^2 - 6x + 9')).toContain('quadrato_binomio_differenza');
  });

  it('x^2 - 5x + 6 → trinomio_speciale', () => {
    expect(patterns('x^2 - 5x + 6')).toContain('trinomio_speciale');
  });

  it("trinomio_speciale hint indica s=-5 e p=6", () => {
    const ast = createMathAST('x^2 - 5x + 6');
    const ts = ast.detectedPatterns.find(p => p.pattern === 'trinomio_speciale');
    expect(ts?.hint).toMatch(/−5|s=-5/);
    expect(ts?.hint).toMatch(/6|p=6/);
  });

  it('6x^2 + 9x → raccoglimento_totale (MCD = 3x)', () => {
    expect(patterns('6x^2 + 9x')).toContain('raccoglimento_totale');
  });

  it('raccoglimento: hint menziona 3x', () => {
    const ast = createMathAST('6x^2 + 9x');
    const r = ast.detectedPatterns.find(p => p.pattern === 'raccoglimento_totale');
    expect(r?.hint).toMatch(/3x/);
  });

  it('x^3 + 8 → somma_cubi', () => {
    expect(patterns('x^3 + 8')).toContain('somma_cubi');
  });

  it('x^3 - 27 → differenza_cubi', () => {
    expect(patterns('x^3 - 27')).toContain('differenza_cubi');
  });
});

describe('Pattern Detector — equazioni', () => {
  it('3x + 5 = 14 → linear_equation + trasporto_termine', () => {
    const ast = createMathAST('3x + 5 = 14');
    expect(ast.kind).toBe('linear_equation');
    expect(patterns('3x + 5 = 14')).toContain('trasporto_termine');
  });

  it('x^2 - 5x + 6 = 0 → quadratic_equation + formula_quadratica', () => {
    const ast = createMathAST('x^2 - 5x + 6 = 0');
    expect(ast.kind).toBe('quadratic_equation');
    expect(patterns('x^2 - 5x + 6 = 0')).toContain('formula_quadratica');
  });

  it('x^2 + 3x = 0 → quadratic_incomplete_spurious', () => {
    expect(createMathAST('x^2 + 3x = 0').kind).toBe('quadratic_incomplete_spurious');
  });

  it('x^2 = 9 → quadratic_incomplete_pure', () => {
    expect(createMathAST('x^2 = 9').kind).toBe('quadratic_incomplete_pure');
  });
});

describe('Pattern Detector — casi limite matematici', () => {
  it('x^2 + 9 → irreducible_polynomial (somma di quadrati)', () => {
    expect(createMathAST('x^2 + 9').kind).toBe('irreducible_polynomial');
  });

  it('x^2 + x + 1 → polynomial_single_var (non quadrato binomio, non trinomio speciale)', () => {
    // Δ = 1 - 4 = -3 < 0, ma la classificazione richiede analisi discriminante
    // Per ora lo classificano come polynomial_single_var (il Modulo 3 lo gestirà come irreducible)
    const ast = createMathAST('x^2 + x + 1');
    expect(['polynomial_single_var', 'irreducible_polynomial']).toContain(ast.kind);
  });
});
