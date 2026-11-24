// ============================================================
// GAMBITO — Pratt Parser (LL-recursive, precedence climbing)
//
// Grammatica informale:
//   expr   = prefix (infix expr)*
//   prefix = NUMBER | VARIABLE | '(' expr ')' | '-' expr
//           | '√' expr | 'π'
//   infix  = '+' | '-' | '*' | '/' | '^' | '=' | '%'
//           | <implicit-mul: VARIABLE | LPAREN in posizione infix>
//
// Binding powers (lbp):
//   EQUALS        : 1
//   PLUS / MINUS  : 10
//   STAR / SLASH  : 20
//   implicit-mul  : 25  (2x, 2(x+1), (a+b)(a-b))
//   CARET         : 30  (right-assoc → rbp = 29)
//   PERCENT       : 35  (postfix)
//   unary MINUS   : rbp 15 → cattura fino a 14 (non attraversa +/-)
//   SQRT          : rbp 50
// ============================================================

import { tokenize } from './tokenizer';
import type { Token, TokenType } from './tokenizer';
import { makeId } from '../ast/builders';
import type {
  MathNode, NumberNode, VariableNode, SumNode, ProductNode,
  PowerNode, FractionNode, EquationNode, NegationNode,
  SqrtNode, IrrationalNode, Variable, Fraction,
} from '../ast/types';

export class ParseError extends Error {
  constructor(
    message: string,
    public readonly position: number,
  ) {
    super(message);
    this.name = 'ParseError';
  }
}

// ─── Binding powers per operatori INFIX / POSTFIX ───────────
const LBP: Partial<Record<TokenType, number>> = {
  EQUALS:  1,
  PLUS:   10, MINUS: 10,
  STAR:   20, SLASH: 20,
  // VARIABLE e LPAREN in posizione infix → implicit-mul (25)
  CARET:  30,
  PERCENT: 35, // postfix: non consuma argomento destro
  LT: 5, GT: 5, LEQ: 5, GEQ: 5, NEQ: 5,
};

const IMPLICIT_MUL_LBP = 25;

function getLbp(tok: Token): number {
  // Token che in posizione infix indicano moltiplicazione implicita
  if (tok.type === 'VARIABLE' || tok.type === 'LPAREN' || tok.type === 'PI') {
    return IMPLICIT_MUL_LBP;
  }
  return LBP[tok.type] ?? 0;
}

// ─── Aritmetica BigInt ───────────────────────────────────────

function bigGcd(a: bigint, b: bigint): bigint {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b > 0n) [a, b] = [b, a % b];
  return a === 0n ? 1n : a;
}

function floatToFraction(val: number): Fraction {
  if (!isFinite(val)) throw new Error('Valore non finito');
  const neg = val < 0;
  const abs = Math.abs(val);
  const str = abs.toString();
  const dot = str.indexOf('.');
  if (dot === -1) {
    return { n: BigInt(Math.round(abs)), d: 1n, sign: neg ? -1 : 1 };
  }
  const dec = str.length - dot - 1;
  const denom = 10n ** BigInt(dec);
  const numer = BigInt(Math.round(abs * Math.pow(10, dec)));
  const g = bigGcd(numer, denom);
  return { n: numer / g, d: denom / g, sign: neg ? -1 : 1 };
}

// ─── Parser ─────────────────────────────────────────────────

class Parser {
  private pos = 0;

  constructor(private readonly tokens: Token[]) {}

  peek(): Token {
    return this.tokens[this.pos] ?? { type: 'EOF', value: '', position: -1 };
  }

  private consume(): Token {
    return this.tokens[this.pos++] ?? { type: 'EOF', value: '', position: -1 };
  }

  private expect(type: TokenType): Token {
    const tok = this.consume();
    if (tok.type !== type) {
      throw new ParseError(
        `Atteso '${type}', trovato '${tok.type}' ("${tok.value}")`,
        tok.position,
      );
    }
    return tok;
  }

  /** Punto di ingresso pubblico: parsa un'espressione completa. */
  parseRoot(): MathNode {
    const result = this.parseExpr(0);
    const rem = this.peek();
    if (rem.type !== 'EOF') {
      throw new ParseError(
        `Simbolo inatteso: "${rem.value}" — espressione non completa?`,
        rem.position,
      );
    }
    return result;
  }

  parseExpr(minPow: number): MathNode {
    let left = this.nud();

    while (true) {
      const tok = this.peek();
      const lbp = getLbp(tok);
      if (lbp <= minPow) break;
      left = this.led(left, lbp);
    }

    return left;
  }

  // ── Null denotation (posizione prefissa) ──────────────────
  private nud(): MathNode {
    const tok = this.consume();

    switch (tok.type) {
      // ── Numero letterale ──
      case 'NUMBER': {
        const frac = floatToFraction(parseFloat(tok.value));
        const node: NumberNode = { id: makeId(), kind: 'Number', value: frac };
        return node;
      }

      // ── Variabile (es. x, y) ──
      case 'VARIABLE': {
        const node: VariableNode = {
          id: makeId(), kind: 'Variable',
          name: tok.value as Variable,
          exponent: 1,
          coefficient: { n: 1n, d: 1n, sign: 1 },
        };
        return node;
      }

      // ── Pi greco ──
      case 'PI': {
        const node: IrrationalNode = {
          id: makeId(), kind: 'Irrational',
          symbol: 'pi',
          coefficient: { n: 1n, d: 1n, sign: 1 },
        };
        return node;
      }

      // ── Meno unario ──
      // rbp = 15: cattura '2x^2' in '-2x^2+8' ma si ferma al '+'.
      // Crea un NegationNode che il normalizzatore dissolverà.
      case 'MINUS': {
        const operand = this.parseExpr(15);
        const node: NegationNode = { id: makeId(), kind: 'Negation', operand };
        return node;
      }

      // ── Più unario (ignorato) ──
      case 'PLUS': {
        return this.parseExpr(15);
      }

      // ── Radice quadrata ──
      case 'SQRT': {
        const operand = this.parseExpr(50);
        const node: SqrtNode = {
          id: makeId(), kind: 'Sqrt',
          operand,
          coefficient: { n: 1n, d: 1n, sign: 1 },
        };
        return node;
      }

      // ── Parentesi ──
      case 'LPAREN': {
        const inner = this.parseExpr(0);
        this.expect('RPAREN');
        return inner;
      }

      case 'EOF':
        throw new ParseError('Input vuoto o espressione incompleta', tok.position);

      default:
        throw new ParseError(
          `Simbolo inatteso in posizione iniziale: "${tok.value}" (${tok.type})`,
          tok.position,
        );
    }
  }

  // ── Left denotation (posizione infix/postfix) ─────────────
  private led(left: MathNode, lbp: number): MathNode {
    const tok = this.peek();

    // ── Moltiplicazione implicita (2x, 2(x+1), (a+b)(a-b)) ──
    if (tok.type === 'VARIABLE' || tok.type === 'LPAREN' || tok.type === 'PI') {
      // NON consumiamo: il nud() del parsing ricorsivo lo farà
      const right = this.parseExpr(IMPLICIT_MUL_LBP);
      return this.buildProduct(left, right);
    }

    this.consume(); // consuma l'operatore

    switch (tok.type) {
      case 'PLUS': {
        const right = this.parseExpr(10);
        return this.buildSum(left, right);
      }

      case 'MINUS': {
        const right = this.parseExpr(10);
        const neg: NegationNode = { id: makeId(), kind: 'Negation', operand: right };
        return this.buildSum(left, neg);
      }

      case 'STAR': {
        const right = this.parseExpr(20);
        return this.buildProduct(left, right);
      }

      case 'SLASH': {
        const right = this.parseExpr(20);
        const node: FractionNode = {
          id: makeId(), kind: 'Fraction',
          numerator: left, denominator: right,
        };
        return node;
      }

      // ── Potenza: right-associativa (rbp = 29 < lbp = 30) ──
      case 'CARET': {
        const right = this.parseExpr(29);
        const exp = this.extractIntExponent(right, tok.position);
        const node: PowerNode = {
          id: makeId(), kind: 'Power',
          base: left, exponent: exp,
        };
        return node;
      }

      case 'EQUALS': {
        const right = this.parseExpr(0);
        const node: EquationNode = {
          id: makeId(), kind: 'Equation',
          lhs: left, rhs: right, relation: '=',
        };
        return node;
      }

      case 'LT': case 'GT': case 'LEQ': case 'GEQ': case 'NEQ': {
        const rel = tok.type === 'LT'  ? '<'
                  : tok.type === 'GT'  ? '>'
                  : tok.type === 'LEQ' ? '≤'
                  : tok.type === 'GEQ' ? '≥' : '≠';
        const right = this.parseExpr(0);
        const node: EquationNode = {
          id: makeId(), kind: 'Equation',
          lhs: left, rhs: right, relation: rel as EquationNode['relation'],
        };
        return node;
      }

      // ── Percentuale postfissa: 35% ──
      case 'PERCENT': {
        // Lasciamo il nodo come Product(left, 1/100); il normalizzatore lo gestisce
        const hundredth: NumberNode = {
          id: makeId(), kind: 'Number',
          value: { n: 1n, d: 100n, sign: 1 },
        };
        return this.buildProduct(left, hundredth);
      }

      default:
        throw new ParseError(`Operatore non atteso: "${tok.value}"`, tok.position);
    }
  }

  // ── Helper: flattening di Sum e Product ──────────────────
  private buildSum(left: MathNode, right: MathNode): SumNode {
    const terms: MathNode[] = [];
    if (left.kind  === 'Sum') terms.push(...left.terms);  else terms.push(left);
    if (right.kind === 'Sum') terms.push(...right.terms); else terms.push(right);
    return { id: makeId(), kind: 'Sum', terms };
  }

  private buildProduct(left: MathNode, right: MathNode): ProductNode {
    const factors: MathNode[] = [];
    if (left.kind  === 'Product') factors.push(...left.factors);  else factors.push(left);
    if (right.kind === 'Product') factors.push(...right.factors); else factors.push(right);
    return { id: makeId(), kind: 'Product', factors };
  }

  private extractIntExponent(node: MathNode, pos: number): number {
    if (node.kind === 'Number') {
      const val = Number(node.value.n) / Number(node.value.d);
      if (node.value.sign === -1 || !Number.isInteger(val) || val < 1) {
        throw new ParseError(
          `L'esponente deve essere un intero ≥ 1, trovato: ${node.value.sign === -1 ? '-' : ''}${val}`,
          pos,
        );
      }
      return val;
    }
    throw new ParseError('Esponente non numerico non supportato', pos);
  }
}

// ─── API pubblica ────────────────────────────────────────────

/** Parsifica una stringa matematica e restituisce il raw AST.
 *  Attenzione: l'AST raw contiene NegationNode e ProductNode non semplificati.
 *  Passa sempre attraverso normalize() prima dell'analisi dei pattern. */
export function parse(input: string): MathNode {
  if (!input.trim()) {
    throw new ParseError('Input vuoto', 0);
  }
  const tokens = tokenize(input);
  const parser = new Parser(tokens);
  return parser.parseRoot();
}
