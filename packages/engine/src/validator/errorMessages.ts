// ============================================================
// GAMBITO — Error Messages
//
// Ogni errore ha:
//   - message: 1 riga chiara in italiano, rivolta allo studente
//   - counterExample: (opzionale) verifica numerica immediata
//   - ruleReference: la regola algebrica violata
//
// Regola UX: mai usare "Sbagliato" o "Errore" come unica risposta.
// ============================================================

export type ErrorCode =
  | 'ERR_UNLIKE_TERMS'
  | 'ERR_MISSING_DOUBLE_PRODUCT'
  | 'ERR_WRONG_SQRT'
  | 'ERR_WRONG_CBRT'
  | 'ERR_WRONG_SIGN_CUBE'
  | 'ERR_WRONG_SIGN_SQUARE'
  | 'ERR_DIVIDE_BY_ZERO'
  | 'ERR_WRONG_BOTH_SIDES'
  | 'ERR_WRONG_MCD'
  | 'ERR_WRONG_SUM_PRODUCT'
  | 'ERR_CANNOT_FACTOR'
  | 'ERR_RUFFINI_WRONG_STEP'
  | 'ERR_WRONG_DISCRIMINANT'
  | 'ERR_INVALID_SYNTAX'
  | 'ERR_NOT_PERFECT_SQUARE'
  | 'ERR_NOT_PERFECT_CUBE'
  | 'ERR_EXPONENT_NOT_POSITIVE_INT'
  | 'ERR_UNSUPPORTED_EXPRESSION';

export interface MoveError {
  code: ErrorCode;
  message: string;
  counterExample?: string;
  ruleReference?: string;
}

type ErrorFactory = (...args: string[]) => MoveError;

const ERRORS: Record<ErrorCode, ErrorFactory> = {

  ERR_UNLIKE_TERMS: (t1 = 'x²', t2 = '3x') => ({
    code: 'ERR_UNLIKE_TERMS',
    message: `${t1} e ${t2} hanno grado diverso: non puoi sommarli come fossero uguali.`,
    counterExample: `Pensa a "2 mele + 3 mele²": non sono la stessa cosa.`,
    ruleReference: 'Regola: si possono sommare solo termini simili (stesso grado e stessa variabile).',
  }),

  ERR_MISSING_DOUBLE_PRODUCT: (a = 'a', b = 'b', a2 = '?', b2 = '?') => ({
    code: 'ERR_MISSING_DOUBLE_PRODUCT',
    message: `Manca il doppio prodotto 2·${a}·${b}! Non dimenticare il termine centrale.`,
    counterExample: `Con ${a}=${a2} e ${b}=${b2}: (${a}+${b})²=${Number(a2)+Number(b2)}², non ${a2}²+${b2}²=${Number(a2)**2+Number(b2)**2}.`,
    ruleReference: `(a+b)² = a² + 2ab + b², non a²+b².`,
  }),

  ERR_WRONG_SQRT: (n = '16', correct = '4', attempt = '8') => ({
    code: 'ERR_WRONG_SQRT',
    message: `√${n} = ${correct}, non ${attempt}. La radice chiede: "quale numero, elevato al quadrato, dà ${n}?"`,
    counterExample: `${correct}² = ${Number(correct)**2} ✓ — ${attempt}² = ${Number(attempt)**2} ✗`,
    ruleReference: `√n è il numero positivo x tale che x² = n.`,
  }),

  ERR_WRONG_CBRT: (n = '8', correct = '2', attempt = '4') => ({
    code: 'ERR_WRONG_CBRT',
    message: `∛${n} = ${correct}, non ${attempt}. La radice cubica chiede: "quale numero, elevato al cubo, dà ${n}?"`,
    counterExample: `${correct}³ = ${Number(correct)**3} ✓`,
    ruleReference: `∛n è il numero x tale che x³ = n.`,
  }),

  ERR_WRONG_SIGN_CUBE: (a = 'a', b = 'b') => ({
    code: 'ERR_WRONG_SIGN_CUBE',
    message: `Attenzione ai segni nel cubo di binomio: il secondo e il quarto termine hanno segno opposto a b.`,
    counterExample: undefined,
    ruleReference: `(a−b)³ = a³ − 3a²b + 3ab² − b³. I termini pari sono negativi quando b è positivo.`,
  }),

  ERR_WRONG_SIGN_SQUARE: (a = 'a', b = 'b') => ({
    code: 'ERR_WRONG_SIGN_SQUARE',
    message: `Hai sbagliato il segno del doppio prodotto. In (${a}−${b})² il termine centrale è −2·${a}·${b}.`,
    counterExample: undefined,
    ruleReference: `(a−b)² = a² − 2ab + b².`,
  }),

  ERR_DIVIDE_BY_ZERO: () => ({
    code: 'ERR_DIVIDE_BY_ZERO',
    message: `Non puoi dividere per zero: qualunque numero×0 dà 0, non una costante diversa da zero.`,
    counterExample: undefined,
    ruleReference: `La divisione per zero è un'operazione indefinita in matematica.`,
  }),

  ERR_WRONG_BOTH_SIDES: (op = '+5') => ({
    code: 'ERR_WRONG_BOTH_SIDES',
    message: `Un'equazione è una bilancia: se applichi "${op}" a sinistra devi farlo anche a destra.`,
    counterExample: undefined,
    ruleReference: `Principio di equivalenza: operazioni uguali su entrambi i membri non cambiano la soluzione.`,
  }),

  ERR_WRONG_MCD: (terms = '6x² e 9x', correct = '3x', attempt = '3') => ({
    code: 'ERR_WRONG_MCD',
    message: `Il MCD di ${terms} è ${correct}, non ${attempt}: anche la variabile è comune a entrambi.`,
    counterExample: undefined,
    ruleReference: `Il MCD considera sia i coefficienti numerici che le parti letterali.`,
  }),

  ERR_WRONG_SUM_PRODUCT: (s = '−5', p = '6') => ({
    code: 'ERR_WRONG_SUM_PRODUCT',
    message: `Stai cercando due numeri con somma ${s} e prodotto ${p}. I numeri che hai scelto non soddisfano entrambe le condizioni.`,
    counterExample: undefined,
    ruleReference: `Nel trinomio x²+sx+p si cercano due numeri la cui somma è s e il cui prodotto è p.`,
  }),

  ERR_CANNOT_FACTOR: (expr = 'x²+9') => ({
    code: 'ERR_CANNOT_FACTOR',
    message: `${expr} non è scomponibile in fattori reali: è una somma di quadrati, irriducibile su ℝ.`,
    counterExample: undefined,
    ruleReference: `a²+b² non ha radici reali: il discriminante è negativo (Δ < 0).`,
  }),

  ERR_RUFFINI_WRONG_STEP: (expected = '?', got = '?') => ({
    code: 'ERR_RUFFINI_WRONG_STEP',
    message: `Passo di Ruffini errato: il valore atteso era ${expected}, hai scritto ${got}.`,
    counterExample: undefined,
    ruleReference: `Nella divisione di Ruffini: porta giù il primo coefficiente, poi moltiplica per la radice e somma.`,
  }),

  ERR_WRONG_DISCRIMINANT: (expected = '?', got = '?') => ({
    code: 'ERR_WRONG_DISCRIMINANT',
    message: `Discriminante calcolato male: Δ = ${got}, ma il valore corretto è ${expected}.`,
    counterExample: undefined,
    ruleReference: `Δ = b² − 4ac. Sostituisci con attenzione a, b, c dall'equazione.`,
  }),

  ERR_INVALID_SYNTAX: (detail = '') => ({
    code: 'ERR_INVALID_SYNTAX',
    message: `Non riesco a interpretare l'espressione${detail ? ': ' + detail : ''}. Controlla parentesi e operatori.`,
    counterExample: undefined,
    ruleReference: undefined,
  }),

  ERR_NOT_PERFECT_SQUARE: (n = '?') => ({
    code: 'ERR_NOT_PERFECT_SQUARE',
    message: `${n} non è un quadrato perfetto: non ha una radice quadrata intera.`,
    counterExample: `I quadrati perfetti vicini sono ${Math.floor(Math.sqrt(Number(n)))}² = ${Math.floor(Math.sqrt(Number(n)))**2} e ${Math.ceil(Math.sqrt(Number(n)))}² = ${Math.ceil(Math.sqrt(Number(n)))**2}.`,
    ruleReference: undefined,
  }),

  ERR_NOT_PERFECT_CUBE: (n = '?') => ({
    code: 'ERR_NOT_PERFECT_CUBE',
    message: `${n} non è un cubo perfetto: non ha una radice cubica intera.`,
    counterExample: undefined,
    ruleReference: undefined,
  }),

  ERR_EXPONENT_NOT_POSITIVE_INT: (got = '?') => ({
    code: 'ERR_EXPONENT_NOT_POSITIVE_INT',
    message: `L'esponente deve essere un intero positivo, non ${got}.`,
    counterExample: undefined,
    ruleReference: undefined,
  }),

  ERR_UNSUPPORTED_EXPRESSION: (detail = '') => ({
    code: 'ERR_UNSUPPORTED_EXPRESSION',
    message: `Espressione non ancora supportata in questa versione di GAMBITO${detail ? ': ' + detail : ''}.`,
    counterExample: undefined,
    ruleReference: undefined,
  }),
};

export function makeError(code: ErrorCode, ...args: string[]): MoveError {
  const factory = ERRORS[code];
  if (!factory) {
    return { code, message: `Errore sconosciuto (${code})` };
  }
  return factory(...args);
}
