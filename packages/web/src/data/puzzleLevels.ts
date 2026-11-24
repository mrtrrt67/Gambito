import { PuzzleLevel, MathToken } from '../types';

function tokensToString(tokens: MathToken[]): string {
  return tokens.map(t => t.text).join(' ').replace(/\s+/g, ' ').trim();
}

export const PUZZLE_LEVELS: PuzzleLevel[] = [
  {
    id: 'pz-1',
    title: 'Livello 1: Risolvi 2x + 6 = 14',
    category: 'Equazione',
    initialTokens: [
      { text: '2', type: 'number' },
      { text: 'x', type: 'variable' },
      { text: '+', type: 'sign' },
      { text: '6', type: 'number' },
      { text: '=', type: 'equals' },
      { text: '14', type: 'number' },
    ],
    targetDisplay: 'x = 4',
    par: 3,
    baseScore: 2000,
    hint: 'Sposta il [+ 6] a destra e inverti in [- 6], poi calcola 14 - 6 e dividi per 2.',
    solutionCheck: (tokens) => {
      const s = tokensToString(tokens).replace(/\s+/g, '');
      return s === 'x=4' || s === '4=x';
    },
  },
  {
    id: 'pz-2',
    title: 'Livello 2: Risolvi 3x − 5 = 10',
    category: 'Equazione',
    initialTokens: [
      { text: '3', type: 'number' },
      { text: 'x', type: 'variable' },
      { text: '−', type: 'sign' },
      { text: '5', type: 'number' },
      { text: '=', type: 'equals' },
      { text: '10', type: 'number' },
    ],
    targetDisplay: 'x = 5',
    par: 3,
    baseScore: 2000,
    hint: 'Sposta il [− 5] a destra facendolo diventare [+ 5], calcola 10 + 5 = 15, poi dividi per 3.',
    solutionCheck: (tokens) => {
      const s = tokensToString(tokens).replace(/\s+/g, '');
      return s === 'x=5' || s === '5=x';
    },
  },
  {
    id: 'pz-3',
    title: 'Livello 3: Scomponi 9 − x²',
    category: 'Scomposizione',
    initialTokens: [
      { text: '9', type: 'number' },
      { text: '−', type: 'sign' },
      { text: 'x²', type: 'variable' },
    ],
    targetDisplay: '(3 − x)(3 + x)',
    par: 1,
    baseScore: 2200,
    hint: 'Differenza di quadrati: apri le parentesi e inserisci 3 e x con segni alternati (3 − x)(3 + x).',
    solutionCheck: (tokens) => {
      const s = tokensToString(tokens).replace(/\s+/g, '').replace(/-/g, '−');
      return s === '(3−x)(3+x)' || s === '(3+x)(3−x)' || s === '(x+3)(3−x)';
    },
  },
  {
    id: 'pz-4',
    title: 'Livello 4: Scomponi x² − 16',
    category: 'Scomposizione',
    initialTokens: [
      { text: 'x²', type: 'variable' },
      { text: '−', type: 'sign' },
      { text: '16', type: 'number' },
    ],
    targetDisplay: '(x − 4)(x + 4)',
    par: 1,
    baseScore: 2200,
    hint: 'La radice di 16 è 4. Componi (x − 4)(x + 4).',
    solutionCheck: (tokens) => {
      const s = tokensToString(tokens).replace(/\s+/g, '').replace(/-/g, '−');
      return s === '(x−4)(x+4)' || s === '(x+4)(x−4)';
    },
  },
  {
    id: 'pz-5',
    title: 'Livello 5: Scomponi 4x² + 12x + 9',
    category: 'Scomposizione',
    initialTokens: [
      { text: '4x²', type: 'variable' },
      { text: '+', type: 'sign' },
      { text: '12x', type: 'variable' },
      { text: '+', type: 'sign' },
      { text: '9', type: 'number' },
    ],
    targetDisplay: '(2x + 3)²',
    par: 1,
    baseScore: 2500,
    hint: 'È il quadrato di binomio (2x + 3)². Riconosci le due radici quadrate 2x e 3.',
    solutionCheck: (tokens) => {
      const s = tokensToString(tokens).replace(/\s+/g, '');
      return s === '(2x+3)²' || s === '(2x+3)^2' || s === '(2x+3)(2x+3)';
    },
  },
];
