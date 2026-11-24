import { Fraction } from '@gambito/engine';

/** Format a Fraction into a human-readable string */
export function formatFraction(f: Fraction): string {
  if (f.n === 0n) return '0';
  const signStr = f.sign === -1 ? '-' : '';
  if (f.d === 1n) return `${signStr}${f.n.toString()}`;
  return `${signStr}${f.n.toString()}/${f.d.toString()}`;
}

/** Formatta un esponente in apici Unicode per resa visiva perfetta */
export function toSuperscript(n: number): string {
  const map: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '-': '⁻',
  };
  return n.toString().split('').map(c => map[c] ?? c).join('');
}

/** Descrizione leggibile del tipo di espressione */
export function getKindLabel(kind: string): { label: string; color: string } {
  switch (kind) {
    case 'polynomial_single_var':
      return { label: 'Polinomio', color: '#38bdf8' };
    case 'linear_equation':
      return { label: 'Equazione Lineare', color: '#34d399' };
    case 'quadratic_equation':
      return { label: 'Equazione Quadratica', color: '#fbbf24' };
    case 'quadratic_incomplete_pure':
      return { label: 'Equazione Pura', color: '#fbbf24' };
    case 'quadratic_incomplete_spurious':
      return { label: 'Equazione Spuria', color: '#fbbf24' };
    case 'irreducible_polynomial':
      return { label: 'Polinomio Irriducibile', color: '#c084fc' };
    case 'impossible_equation':
      return { label: 'Equazione Impossibile', color: '#f87171' };
    case 'indeterminate_equation':
      return { label: 'Equazione Indeterminata', color: '#a78bfa' };
    default:
      return { label: 'Espressione Algebrica', color: '#94a3b8' };
  }
}

/** Valutazione stile scacchi/golf in base alle mosse vs Par */
export function getParRating(moves: number, par: number): {
  title: string;
  badgeClass: string;
  description: string;
} {
  const diff = moves - par;
  if (diff < 0) {
    return {
      title: '🦅 Eagle / Genio Tattico!',
      badgeClass: 'badge-eagle',
      description: 'Hai risolto l\'espressione in meno mosse del Par teorico!',
    };
  }
  if (diff === 0) {
    return {
      title: '🎯 In Par / Mossa Perfetta!',
      badgeClass: 'badge-par',
      description: 'Esecuzione pulita ed elegante, esattamente al Par ottimale.',
    };
  }
  if (diff === 1) {
    return {
      title: '⛳ Birdie / Buona Precisione',
      badgeClass: 'badge-birdie',
      description: 'Ottima risoluzione, solo una mossa accessoria rispetto al cammino minimo.',
    };
  }
  return {
    title: '⚠️ Sopra Par',
    badgeClass: 'badge-over',
    description: `${diff} mosse extra oltre il Par. Si può ottimizzare la strategia!`,
  };
}
