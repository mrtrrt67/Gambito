// ============================================================
// TEST — Tokenizer
// ============================================================
import { describe, it, expect } from 'vitest';
import { tokenize, TokenizerError } from '../src/parser/tokenizer.js';

describe('Tokenizer — casi base', () => {
  it('tokenizza un numero intero', () => {
    const tokens = tokenize('42');
    expect(tokens[0]).toMatchObject({ type: 'NUMBER', value: '42' });
    expect(tokens[1]).toMatchObject({ type: 'EOF' });
  });

  it('tokenizza variabile con esponente superscript ²', () => {
    const tokens = tokenize('x²');
    expect(tokens.map(t => t.type)).toEqual(['VARIABLE', 'CARET', 'NUMBER', 'EOF']);
    expect(tokens[2]!.value).toBe('2');
  });

  it('tokenizza superscript ³', () => {
    const tokens = tokenize('x³');
    expect(tokens[1]!.type).toBe('CARET');
    expect(tokens[2]!.value).toBe('3');
  });

  it('normalizza × in STAR e ÷ in SLASH', () => {
    const tokens = tokenize('3×4÷2');
    expect(tokens[1]!.type).toBe('STAR');
    expect(tokens[3]!.type).toBe('SLASH');
  });

  it('normalizza − Unicode in MINUS', () => {
    const tokens = tokenize('x\u22122');  // x − 2
    expect(tokens[1]!.type).toBe('MINUS');
  });

  it('lancia TokenizerError su carattere non riconosciuto', () => {
    expect(() => tokenize('x @ 2')).toThrow(TokenizerError);
  });

  it('tokenizza espressione completa: 2x^2 - 18', () => {
    const tokens = tokenize('2x^2 - 18');
    const types = tokens.map(t => t.type);
    expect(types).toEqual(['NUMBER','VARIABLE','CARET','NUMBER','MINUS','NUMBER','EOF']);
  });

  it('tokenizza equazione: 2(x+3) - x = 5', () => {
    const types = tokenize('2(x+3) - x = 5').map(t => t.type);
    expect(types).toEqual([
      'NUMBER','LPAREN','VARIABLE','PLUS','NUMBER','RPAREN',
      'MINUS','VARIABLE','EQUALS','NUMBER','EOF',
    ]);
  });
});
