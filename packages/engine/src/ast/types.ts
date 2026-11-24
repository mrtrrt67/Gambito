// ============================================================
// GAMBITO — AST Types
// Ogni nodo ha un NodeId univoco usato dalla UI per le mosse.
// Aritmetica esatta: Fraction usa bigint (nessuna perdita float).
// ============================================================

export type NodeId = string;
export type Variable = 'x' | 'y' | 'a' | 'b' | 'n' | 't';
export type IrrationalSymbol = 'pi' | 'sqrt2' | 'sqrt3' | 'sqrt5' | 'sqrt6';

/** Numero razionale esatto: valore = (sign * n) / d, con d > 0 e n ≥ 0 */
export interface Fraction {
  n: bigint;        // numeratore assoluto
  d: bigint;        // denominatore (sempre > 0)
  sign: 1 | -1;    // segno separato per semplicità aritmetica
}

// ─── NODI FOGLIA ────────────────────────────────────────────

export interface NumberNode {
  id: NodeId;
  kind: 'Number';
  value: Fraction;
}

/** Monomio canonico: coefficient * name^exponent */
export interface VariableNode {
  id: NodeId;
  kind: 'Variable';
  name: Variable;
  exponent: number;       // ≥ 1
  coefficient: Fraction;  // include segno e valore numerico
}

export interface IrrationalNode {
  id: NodeId;
  kind: 'Irrational';
  symbol: IrrationalSymbol;
  coefficient: Fraction;
}

// ─── NODI COMPOSTI ──────────────────────────────────────────

export interface SumNode {
  id: NodeId;
  kind: 'Sum';
  terms: MathNode[];
}

export interface ProductNode {
  id: NodeId;
  kind: 'Product';
  factors: MathNode[];
}

export interface PowerNode {
  id: NodeId;
  kind: 'Power';
  base: MathNode;
  exponent: number;  // intero ≥ 1
}

export interface FractionNode {
  id: NodeId;
  kind: 'Fraction';
  numerator: MathNode;
  denominator: MathNode;
}

export interface EquationNode {
  id: NodeId;
  kind: 'Equation';
  lhs: MathNode;
  rhs: MathNode;
  relation: '=' | '<' | '>' | '≤' | '≥' | '≠';
}

/** Nodo ausiliario creato dal parser per il meno unario.
 *  Il normalizzatore lo dissolve sempre prima di restituire l'AST finale. */
export interface NegationNode {
  id: NodeId;
  kind: 'Negation';
  operand: MathNode;
}

export interface SqrtNode {
  id: NodeId;
  kind: 'Sqrt';
  operand: MathNode;
  coefficient: Fraction;
}

export type MathNode =
  | NumberNode
  | VariableNode
  | IrrationalNode
  | SumNode
  | ProductNode
  | PowerNode
  | FractionNode
  | EquationNode
  | NegationNode
  | SqrtNode;

// ─── CLASSIFICAZIONE ────────────────────────────────────────

export type ExpressionKind =
  | 'polynomial_single_var'
  | 'polynomial_multi_var'
  | 'numeric_expression'
  | 'irrational_expression'
  | 'linear_equation'
  | 'quadratic_equation'
  | 'quadratic_incomplete_pure'      // x² = 9
  | 'quadratic_incomplete_spurious'  // x² + 3x = 0
  | 'impossible_equation'            // 0x = 5
  | 'indeterminate_equation'         // 0x = 0
  | 'irreducible_polynomial'         // x² + 9 (Δ < 0 o somma di quadrati)
  | 'already_in_canonical_form'
  | 'unknown';

export type StrategicPattern =
  // Scomposizione
  | 'raccoglimento_totale'
  | 'raccoglimento_parziale'
  | 'differenza_quadrati'
  | 'quadrato_binomio_somma'
  | 'quadrato_binomio_differenza'
  | 'quadrato_trinomio'
  | 'cubo_binomio_somma'
  | 'cubo_binomio_differenza'
  | 'somma_cubi'
  | 'differenza_cubi'
  | 'trinomio_speciale'
  | 'ruffini'
  // Prodotti notevoli
  | 'espansione_quadrato_binomio'
  | 'espansione_cubo_binomio'
  | 'espansione_somma_per_differenza'
  | 'espansione_generica'
  // Equazioni
  | 'trasporto_termine'
  | 'divisione_per_coefficiente'
  | 'formula_quadratica'
  | 'raccoglimento_per_equazione_spuria'
  | 'completamento_quadrato'
  // Percentuali
  | 'decomposizione_percentuale'
  | 'variazione_composta'
  // Trigonometria
  | 'angolo_notevole'
  | 'simmetria_quadrante';

export interface DetectedPattern {
  pattern: StrategicPattern;
  confidence: 'certain' | 'likely';
  nodeIds: NodeId[];
  estimatedMoves: number;
  hint: string;         // suggerimento generico, MAI la soluzione
  subPatterns?: DetectedPattern[]; // pattern nidificati (es. dopo raccoglimento)
}

// ─── AST ROOT ───────────────────────────────────────────────

export interface ASTMetadata {
  variables: Variable[];
  maxDegree: number;
  hasIrrationals: boolean;
  isEquation: boolean;
  inputRaw: string;
  termCount: number;
}

export interface MathAST {
  root: MathNode;
  kind: ExpressionKind;
  detectedPatterns: DetectedPattern[];
  metadata: ASTMetadata;
  par: number;
}
