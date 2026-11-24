// ============================================================
// GAMBITO — Par Calculator
//
// Calcola il numero minimo di mosse strategiche necessarie
// per portare l'espressione alla forma canonica finale.
//
// Regole di scoring:
//   raccoglimento_totale   → 1 mossa
//   + differenza_quadrati  → 1 mossa aggiuntiva (sub-pattern)
//   differenza_quadrati    → 1 mossa
//   quadrato_binomio_*     → 1 mossa
//   trinomio_speciale      → 1 mossa (banco somma-prodotto)
//   cubo_binomio / cubi    → 1 mossa
//   trasporto_termine      → 1–2 mosse (dipende da n. termini)
//   formula_quadratica     → 3 mosse (Δ, radici, verifica)
//   irreducible_polynomial → 1 mossa (dichiarazione)
//   impossibile/indet.     → 1 mossa (dichiarazione)
// ============================================================

import type { DetectedPattern, ExpressionKind } from '../ast/types';

export function calculatePar(
  kind: ExpressionKind,
  patterns: DetectedPattern[],
): number {
  // Casi speciali
  switch (kind) {
    case 'irreducible_polynomial':  return 1;
    case 'impossible_equation':     return 1;
    case 'indeterminate_equation':  return 1;
    case 'already_in_canonical_form': return 0;
    case 'numeric_expression':      return 1;
    default: break;
  }

  if (patterns.length === 0) return 1; // fallback

  // Prende il percorso più breve tra i pattern disponibili
  const pars = patterns.map(p => computePatternPar(p));
  return Math.min(...pars);
}

function computePatternPar(pattern: DetectedPattern): number {
  const base = pattern.estimatedMoves;

  // Se il pattern ha sub-pattern (es. raccoglimento + differenza quadrati),
  // somma le mosse del sotto-pattern ottimale
  if (pattern.subPatterns && pattern.subPatterns.length > 0) {
    const subPar = Math.min(...pattern.subPatterns.map(computePatternPar));
    return base + subPar;
  }

  return base;
}
