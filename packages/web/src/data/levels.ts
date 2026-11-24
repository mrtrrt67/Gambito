export interface LevelStep {
  id: string;
  title: string;
  category: 'Equazione' | 'Scomposizione';
  initialDisplay: string;
  hint: string;
  targetPar: number;
}

export const LEVELS: LevelStep[] = [
  {
    id: 'lvl-1',
    title: 'Livello 1: La Regola del Trasporto',
    category: 'Equazione',
    initialDisplay: '2x + 6 = 14',
    hint: 'Trascina il blocco [+6] a destra dell\'uguale: cambierà segno in [-6]!',
    targetPar: 3,
  },
  {
    id: 'lvl-2',
    title: 'Livello 2: Isola l\'Incognita',
    category: 'Equazione',
    initialDisplay: '3x + 5 = 20',
    hint: 'Trascina [+5] a destra, fondilo con il 20, poi trascina il 3 sotto per dividere.',
    targetPar: 3,
  },
  {
    id: 'lvl-3',
    title: 'Livello 3: Caso Bastardo #1 (9 - x²)',
    category: 'Scomposizione',
    initialDisplay: '9 - x^2',
    hint: 'Due quadrati perfetti (3² e x²)! Trascinali per aprirli in (3 - x)(3 + x).',
    targetPar: 1,
  },
  {
    id: 'lvl-4',
    title: 'Livello 4: Caso Bastardo #2 (-2x² + 8)',
    category: 'Scomposizione',
    initialDisplay: '-2x^2 + 8',
    hint: 'Estrai il fattore comune -2 trascinandolo fuori, poi scomponi (x² - 4).',
    targetPar: 2,
  },
  {
    id: 'lvl-5',
    title: 'Livello 5: Caso Bastardo #4 (4x² + 12x + 9)',
    category: 'Scomposizione',
    initialDisplay: '4x^2 + 12x + 9',
    hint: 'È un quadrato di binomio! Le basi sono 2x e 3: (2x + 3)²',
    targetPar: 1,
  },
  {
    id: 'lvl-6',
    title: 'Livello 6: Caso Bastardo #3 (x² + 4)',
    category: 'Scomposizione',
    initialDisplay: 'x^2 + 4',
    hint: 'Attento al tranello: è una somma di quadrati positiva, è irriducibile!',
    targetPar: 1,
  },
];
