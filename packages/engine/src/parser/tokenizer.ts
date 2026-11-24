// ============================================================
// GAMBITO — Tokenizer
// Converte una stringa matematica in un array di Token.
// Gestisce Unicode (², ×, −, ÷), superscript, e caratteri
// di accesso rapido della MathKeyboard (√, π, °).
// ============================================================

export type TokenType =
  | 'NUMBER'   | 'VARIABLE'
  | 'PLUS'     | 'MINUS'   | 'STAR'   | 'SLASH'
  | 'CARET'    | 'LPAREN'  | 'RPAREN'
  | 'EQUALS'   | 'PERCENT' | 'SQRT'   | 'PI'    | 'DEGREE'
  | 'LT'       | 'GT'      | 'LEQ'    | 'GEQ'   | 'NEQ'
  | 'EOF';

export interface Token {
  type: TokenType;
  value: string;
  position: number;
}

export class TokenizerError extends Error {
  constructor(
    message: string,
    public readonly position: number,
  ) {
    super(message);
    this.name = 'TokenizerError';
  }
}

/** Variabili matematiche riconosciute come tali (non come lettere generiche). */
const VARIABLES = new Set(['x', 'y', 'a', 'b', 'n', 't']);

/** Mappa superscript Unicode → cifra ASCII.
 *  Così ² viene trasformato in CARET + NUMBER('2') prima del parser. */
const SUPERSCRIPT: Record<string, string> = {
  '⁰': '0', '¹': '1', '²': '2', '³': '3',
  '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7',
  '⁸': '8', '⁹': '9',
};

export function tokenize(input: string): Token[] {
  // ── Pre-processing: normalizza operatori Unicode ──────────
  const src = input
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/\u2212/g, '-')   // U+2212 MINUS SIGN (−)
    .replace(/\u2013/g, '-')   // en-dash (–)
    .replace(/\u2014/g, '-')   // em-dash (—)
    .replace(/\u00B7/g, '*')   // middle dot (·)
    .trim();

  const tokens: Token[] = [];
  let i = 0;

  while (i < src.length) {
    // Spazi
    if (/\s/.test(src[i])) { i++; continue; }

    // Superscript Unicode → inietta CARET + NUMBER
    if (src[i] in SUPERSCRIPT) {
      tokens.push({ type: 'CARET',  value: '^',                   position: i });
      tokens.push({ type: 'NUMBER', value: SUPERSCRIPT[src[i]],   position: i });
      i++;
      continue;
    }

    // Numeri (interi e decimali)
    if (/[0-9]/.test(src[i]) || (src[i] === '.' && /[0-9]/.test(src[i + 1] ?? ''))) {
      const start = i;
      let num = '';
      while (i < src.length && /[0-9.]/.test(src[i])) num += src[i++];
      if ((num.match(/\./g) ?? []).length > 1) {
        throw new TokenizerError(`Numero non valido: "${num}"`, start);
      }
      tokens.push({ type: 'NUMBER', value: num, position: start });
      continue;
    }

    // Variabili note
    if (VARIABLES.has(src[i])) {
      tokens.push({ type: 'VARIABLE', value: src[i], position: i++ });
      continue;
    }

    // Operatori e simboli speciali
    const ch = src[i];
    switch (ch) {
      case '+': tokens.push({ type: 'PLUS',    value: ch, position: i++ }); break;
      case '-': tokens.push({ type: 'MINUS',   value: ch, position: i++ }); break;
      case '*': tokens.push({ type: 'STAR',    value: ch, position: i++ }); break;
      case '/': tokens.push({ type: 'SLASH',   value: ch, position: i++ }); break;
      case '^': tokens.push({ type: 'CARET',   value: ch, position: i++ }); break;
      case '(': tokens.push({ type: 'LPAREN',  value: ch, position: i++ }); break;
      case ')': tokens.push({ type: 'RPAREN',  value: ch, position: i++ }); break;
      case '=': tokens.push({ type: 'EQUALS',  value: ch, position: i++ }); break;
      case '%': tokens.push({ type: 'PERCENT', value: ch, position: i++ }); break;
      case '√': tokens.push({ type: 'SQRT',    value: ch, position: i++ }); break;
      case 'π': tokens.push({ type: 'PI',      value: ch, position: i++ }); break;
      case '°': tokens.push({ type: 'DEGREE',  value: ch, position: i++ }); break;
      case '<':
        if (src[i + 1] === '=') { tokens.push({ type: 'LEQ', value: '<=', position: i }); i += 2; }
        else                     { tokens.push({ type: 'LT',  value: '<',  position: i++ }); }
        break;
      case '>':
        if (src[i + 1] === '=') { tokens.push({ type: 'GEQ', value: '>=', position: i }); i += 2; }
        else                     { tokens.push({ type: 'GT',  value: '>',  position: i++ }); }
        break;
      case '!':
        if (src[i + 1] === '=') { tokens.push({ type: 'NEQ', value: '!=', position: i }); i += 2; }
        else throw new TokenizerError(`Carattere inatteso: '${ch}'`, i);
        break;
      // ≤ ≥ ≠ Unicode diretti
      case '≤': tokens.push({ type: 'LEQ', value: '≤', position: i++ }); break;
      case '≥': tokens.push({ type: 'GEQ', value: '≥', position: i++ }); break;
      case '≠': tokens.push({ type: 'NEQ', value: '≠', position: i++ }); break;
      default:
        throw new TokenizerError(
          `Carattere non riconosciuto: '${ch}' (U+${ch.codePointAt(0)!.toString(16).toUpperCase()}) in posizione ${i}`,
          i,
        );
    }
  }

  tokens.push({ type: 'EOF', value: '', position: src.length });
  return tokens;
}
