export type TokenType = 'number' | 'variable' | 'sign' | 'operator' | 'paren' | 'equals';

export interface MathToken {
  id: string;
  text: string;
  type: TokenType;
  color: string;
}

export interface ScoreItem {
  id: string;
  name: string;
  expression: string;
  score: number;
  moves: number;
  par: number;
  date: string;
}

export interface PuzzleLevel {
  id: string;
  title: string;
  category: 'Equazione' | 'Scomposizione';
  initialTokens: { text: string; type: TokenType }[];
  targetDisplay: string;
  par: number;
  baseScore: number;
  hint: string;
  solutionCheck: (tokens: MathToken[]) => boolean;
}

// Backward compatibility types for presets & game hooks
export type GameStatus = 'playing' | 'solved' | 'game_over';

export interface DraggedElement {
  id: string;
  type: 'term' | 'factor' | 'operator';
  text: string;
  originalSide?: 'lhs' | 'rhs';
  sign: '+' | '-';
  numericValue?: number;
}

export interface TelemetryEvent {
  id: string;
  timestamp: string;
  action: string;
  description: string;
  details: string;
  color: string;
}

export interface LeaderboardEntry {
  id: string;
  playerName: string;
  expression: string;
  score: number;
  moves: number;
  par: number;
  errors: number;
  timestamp: string;
  badge: string;
}

export interface ChallengePreset {
  id: string;
  title: string;
  category: string;
  expression: string;
  badge?: string;
  difficulty: string;
  description: string;
  baseScore: number;
}

export interface MoveHistoryItem {
  id: string;
  stepNumber: number;
  expression: string;
  moveName: string;
  description: string;
}

export type SubType =
  // Equazioni 1° Grado
  | 'linear_simple'
  | 'linear_twosided'
  | 'linear_parens'
  // Scomposizioni: 2 Termini (Binomi)
  | 'diff_squares'
  | 'common_mcd'
  | 'mixed_mcd_squares'
  | 'sum_cubes'
  | 'diff_cubes'
  // Scomposizioni: 3 Termini (Trinomi)
  | 'square_binomial'
  | 'trinomial'
  | 'mixed_mcd_trinomial'
  | 'trinomial_advanced'
  // Scomposizioni: 4 Termini (Quadrinomi)
  | 'partial_grouping'
  | 'cube_binomial'
  | 'grouping_3_1'
  // Scomposizioni: 5 Termini (Polinomi a 5 Termini)
  | 'grouping_3_2'
  | 'ruffini_degree4'
  | 'mcd_5terms'
  // Scomposizioni: Quadrato e Cubo di Trinomio
  | 'square_trinomial'
  | 'cube_trinomial';

export interface NotebookLevel {
  id: string;
  title: string;
  expression: string;
  category: 'Equazione' | 'Scomposizione';
  par: number;
  baseScore: number;
  hint: string;
  subType?: SubType;
  metadata?: any;
}

