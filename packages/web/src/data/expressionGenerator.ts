import { NotebookLevel, SubType } from '../types';

export interface GeneratedLevelMetadata {
  subType: SubType;
  // Differenza di quadrati
  termA?: string;
  termB?: string;
  baseA?: string;
  baseB?: string;
  // MCD
  term1?: string;
  term2?: string;
  sign?: string;
  mcdNum?: string;
  mcdVar?: string;
  q1?: string;
  q2?: string;
  // Trinomio
  d1?: string;
  d2?: string;
  chips?: string[];
  // Raccoglimento parziale
  pair1?: string;
  pair2?: string;
  mcd1?: string;
  quot1?: string;
  mcd2?: string;
  quot2?: string;
  finalCommon?: string;
  finalOther?: string;
  // Mista
  mixedMcd?: string;
  mixedQuot?: string;
  f1?: string;
  f2?: string;
  // Quadrato binomio
  sqBaseA?: string;
  sqBaseB?: string;
  sqSign?: string;
}

/**
 * Generatore procedurale di livelli algebrici a complessità crescente.
 * Garantisce sempre numeri interi puliti e soluzioni matematiche esatte.
 */
export function generateProgressiveLevel(levelNumber: number): NotebookLevel {
  const tier = Math.floor((levelNumber - 1) / 5) + 1;

  // Rotazione dei tipi a complessità incrementale
  switch (tier) {
    case 1:
      // TIER 1: Equazioni lineari semplici (ax + b = c)
      return generateSimpleLinear(levelNumber, 1);

    case 2:
      // TIER 2: Equazioni con segni negativi e numeri leggermente maggiori
      return generateSimpleLinear(levelNumber, 2);

    case 3:
      // TIER 3: Equazioni con x su entrambi i lati (ax + b = cx + d)
      return generateTwoSidedLinear(levelNumber, 1);

    case 4:
      // TIER 4: Scomposizione: Differenza di quadrati elementari (x² − b² oppure b² − x²)
      return generateDiffSquares(levelNumber, 1);

    case 5:
      // TIER 5: Scomposizione: Differenza di quadrati con coefficiente (b² − a²x²)
      return generateDiffSquares(levelNumber, 2);

    case 6:
      // TIER 6: Raccoglimento a fattore comune MCD
      return generateMcdLevel(levelNumber, 1);

    case 7:
      // TIER 7: Trinomi notevoli (somma e prodotto)
      return generateTrinomialLevel(levelNumber, 1);

    case 8:
      // TIER 8: Scomposizione mista (MCD + Differenza di quadrati)
      return generateMixedLevel(levelNumber);

    case 9:
      // TIER 9: Quadrato di binomio
      return generateSquareBinomialLevel(levelNumber);

    case 10:
      // TIER 10: Raccoglimento parziale a 4 termini
      return generatePartialGroupingLevel(levelNumber, 1);

    default: {
      // TIER 11+: Rotazione procedurale infinita con complessità e numeri crescenti
      const cycle = (levelNumber - 1) % 7;
      const difficultyMultiplier = Math.floor(levelNumber / 10);
      switch (cycle) {
        case 0: return generateTwoSidedLinear(levelNumber, 2 + difficultyMultiplier);
        case 1: return generatePartialGroupingLevel(levelNumber, 2 + difficultyMultiplier);
        case 2: return generateMcdLevel(levelNumber, 2 + difficultyMultiplier);
        case 3: return generateDiffSquares(levelNumber, 2 + difficultyMultiplier);
        case 4: return generateTrinomialLevel(levelNumber, 2 + difficultyMultiplier);
        case 5: return generateMixedLevel(levelNumber);
        case 6: return generateSquareBinomialLevel(levelNumber);
        default: return generateSimpleLinear(levelNumber, 3);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// 1. EQUAZIONI LINEARI SEMPLICI
// ---------------------------------------------------------------------------
function generateSimpleLinear(lvl: number, diff: number): NotebookLevel {
  const coeff = 2 + (lvl % 4) + diff;
  const root = 2 + ((lvl * 3) % 7);
  const isMinus = (lvl % 2 === 1);
  const constant = 2 + ((lvl * 2) % (diff * 4 + 4));

  const rhs = isMinus ? (coeff * root - constant) : (coeff * root + constant);
  const signStr = isMinus ? '−' : '+';
  const expr = `${coeff}x ${signStr} ${constant} = ${rhs}`;

  return {
    id: `gen-lvl-${lvl}`,
    title: `Livello ${lvl} - Equazione: ${expr}`,
    expression: expr,
    category: 'Equazione',
    par: 3,
    baseScore: 2000 + lvl * 50,
    hint: `Trasporta il termine noto a destra cambiando di segno, somma i numeri e infine dividi per il coefficiente della x inserendo la frazione.`,
    subType: 'linear_simple',
  };
}

// ---------------------------------------------------------------------------
// 2. EQUAZIONI CON X SU ENTRAMBI I LATI
// ---------------------------------------------------------------------------
function generateTwoSidedLinear(lvl: number, diff: number): NotebookLevel {
  const root = 3 + (lvl % 6);
  const diffCoeff = 2 + (lvl % 3);
  const rightCoeff = 1 + (lvl % 3) + Math.min(diff, 2);
  const leftCoeff = rightCoeff + diffCoeff;

  const leftConst = 3 + ((lvl * 2) % 9);
  const rightConst = diffCoeff * root - leftConst;

  const expr = `${leftCoeff}x + ${leftConst} = ${rightCoeff}x + ${rightConst}`;

  return {
    id: `gen-lvl-${lvl}`,
    title: `Livello ${lvl} - Equazione: ${expr}`,
    expression: expr,
    category: 'Equazione',
    par: 4,
    baseScore: 2400 + lvl * 60,
    hint: `Trasporta tutti i termini con la x al primo membro e i termini noti al secondo membro, ricordando di cambiare segno al trasporto.`,
    subType: 'linear_twosided',
  };
}

// ---------------------------------------------------------------------------
// 3. DIFFERENZA DI QUADRATI
// ---------------------------------------------------------------------------
function generateDiffSquares(lvl: number, diff: number): NotebookLevel {
  const squares = [4, 9, 16, 25, 36, 49, 64, 81];
  const bVal = 2 + (lvl % 7);
  const bSq = bVal * bVal;

  if (diff === 1) {
    const isTermFirst = lvl % 2 === 0;
    const expr = isTermFirst ? `x² − ${bSq}` : `${bSq} − x²`;
    const termA = isTermFirst ? 'x²' : `${bSq}`;
    const termB = isTermFirst ? `${bSq}` : 'x²';
    const baseA = isTermFirst ? 'x' : `${bVal}`;
    const baseB = isTermFirst ? `${bVal}` : 'x';

    return {
      id: `gen-lvl-${lvl}`,
      title: `Livello ${lvl} - Scomposizione: ${expr}`,
      expression: expr,
      category: 'Scomposizione',
      par: 2,
      baseScore: 2200 + lvl * 50,
      hint: `Calcola le radici quadrate di ciascuno dei due termini e componi la differenza di quadrati: (A − B)(A + B).`,
      subType: 'diff_squares',
      metadata: { termA, termB, baseA, baseB },
    };
  } else {
    const aVal = 2 + (lvl % 3);
    const aSq = aVal * aVal;
    const expr = `${bSq} − ${aSq}x²`;

    return {
      id: `gen-lvl-${lvl}`,
      title: `Livello ${lvl} - Scomposizione: ${expr}`,
      expression: expr,
      category: 'Scomposizione',
      par: 2,
      baseScore: 2400 + lvl * 50,
      hint: `Estrai la radice quadrata del termine numerico e del termine con x², poi scrivi il prodotto di fattori coniugati (A − B)(A + B).`,
      subType: 'diff_squares',
      metadata: { termA: `${bSq}`, termB: `${aSq}x²`, baseA: `${bVal}`, baseB: `${aVal}x` },
    };
  }
}

// ---------------------------------------------------------------------------
// 4. RACCOGLIMENTO A FATTORE COMUNE (MCD)
// ---------------------------------------------------------------------------
function generateMcdLevel(lvl: number, diff: number): NotebookLevel {
  const mcdN = 2 + (lvl % 4) + Math.min(diff, 2);
  const q1N = 2 + (lvl % 3);
  const q2N = 3 + ((lvl * 2) % 4);

  const t1Coeff = mcdN * q1N;
  const t2Coeff = mcdN * q2N;

  const isCubic = diff >= 2 && lvl % 2 === 1;
  const isMinus = lvl % 2 === 1;
  const sign = isMinus ? '−' : '+';

  const t1Str = isCubic ? `${t1Coeff}x³` : `${t1Coeff}x²`;
  const t2Str = isCubic ? `${t2Coeff}x²` : `${t2Coeff}x`;
  const mcdV = isCubic ? 'x²' : 'x';
  const q1Str = isCubic ? `${q1N}x` : `${q1N}x`;
  const q2Str = `${q2N}`;

  const expr = `${t1Str} ${sign} ${t2Str}`;

  return {
    id: `gen-lvl-${lvl}`,
    title: `Livello ${lvl} - Scomposizione MCD: ${expr}`,
    expression: expr,
    category: 'Scomposizione',
    par: 2,
    baseScore: 2300 + lvl * 50,
    hint: `Calcola il Massimo Comune Divisore sia per i coefficienti sia per la parte letterale, poi dividi ciascun termine per comporre il prodotto a fattor comune.`,
    subType: 'common_mcd',
    metadata: {
      term1: t1Str,
      term2: t2Str,
      sign,
      mcdNum: `${mcdN}`,
      mcdVar: mcdV,
      q1: q1Str,
      q2: q2Str,
    },
  };
}

// ---------------------------------------------------------------------------
// 5. TRINOMI NOTEVOLI (SOMMA E PRODOTTO)
// ---------------------------------------------------------------------------
function generateTrinomialLevel(lvl: number, diff: number): NotebookLevel {
  const p = 1 + (lvl % 4);
  const q = 2 + ((lvl * 2) % 4);
  const isNeg = lvl % 2 === 1;

  const d1 = isNeg ? `−${p}` : `+${p}`;
  const d2 = isNeg ? `−${q}` : `+${q}`;
  const sum = isNeg ? -(p + q) : (p + q);
  const prod = p * q;

  const sumSign = sum > 0 ? `+ ${sum}x` : `− ${Math.abs(sum)}x`;
  const expr = `x² ${sumSign} + ${prod}`;

  const chips = [
    d1,
    d2,
    isNeg ? `+${p}` : `−${p}`,
    isNeg ? `+${q + 1}` : `+${q + 2}`,
  ];

  return {
    id: `gen-lvl-${lvl}`,
    title: `Livello ${lvl} - Trinomio Notevole: ${expr}`,
    expression: expr,
    category: 'Scomposizione',
    par: 2,
    baseScore: 2500 + lvl * 50,
    hint: `Cerca due numeri la cui somma algebrica dia il coefficiente centrale e il cui prodotto dia il termine noto.`,
    subType: 'trinomial',
    metadata: {
      d1,
      d2,
      chips,
    },
  };
}

// ---------------------------------------------------------------------------
// 6. SCOMPOSIZIONE MISTA (MCD + DIFF. QUADRATI)
// ---------------------------------------------------------------------------
function generateMixedLevel(lvl: number): NotebookLevel {
  const k = (lvl % 2 === 0) ? -2 : 3;
  const a = 2 + (lvl % 3);
  const aSq = a * a;

  const t1 = `${k}x²`;
  const t2 = k < 0 ? `+ ${Math.abs(k) * aSq}` : `− ${k * aSq}`;
  const expr = `${t1} ${t2}`;

  return {
    id: `gen-lvl-${lvl}`,
    title: `Livello ${lvl} - Scomposizione Mista: ${expr}`,
    expression: expr,
    category: 'Scomposizione',
    par: 3,
    baseScore: 2600 + lvl * 60,
    hint: `Passo 1: Raccogli il divisore comune numerico per isolare la differenza di quadrati. Passo 2: Scomponi la parentesi interna nel prodotto (A − B)(A + B).`,
    subType: 'mixed_mcd_squares',
    metadata: {
      mixedMcd: `${k}`,
      mixedQuot: `x²-${aSq}`,
      f1: `x-${a}`,
      f2: `x+${a}`,
    },
  };
}

// ---------------------------------------------------------------------------
// 7. QUADRATO DI BINOMIO
// ---------------------------------------------------------------------------
function generateSquareBinomialLevel(lvl: number): NotebookLevel {
  const b = 2 + (lvl % 5);
  const isMinus = lvl % 2 === 1;
  const sign = isMinus ? '−' : '+';
  const mid = 2 * b;
  const bSq = b * b;

  const expr = `x² ${sign} ${mid}x + ${bSq}`;

  return {
    id: `gen-lvl-${lvl}`,
    title: `Livello ${lvl} - Quadrato di Binomio: ${expr}`,
    expression: expr,
    category: 'Scomposizione',
    par: 2,
    baseScore: 2400 + lvl * 50,
    hint: `Riconosci i due quadrati alle estremità e controlla che il termine centrale corrisponda al doppio prodotto delle due basi.`,
    subType: 'square_binomial',
    metadata: {
      sqBaseA: 'x',
      sqBaseB: `${b}`,
      sqSign: sign === '−' ? '−' : '+',
    },
  };
}

// ---------------------------------------------------------------------------
// 8. RACCOGLIMENTO PARZIALE A 4 TERMINI
// (ax + b)(x² ± c) = ax³ + bx² ± (ac)x ± (bc)
// ---------------------------------------------------------------------------
function generatePartialGroupingLevel(lvl: number, diff: number): NotebookLevel {
  const a = 1 + (lvl % 3);
  const bVal = 2 + (lvl % 3);
  const isBMinus = (lvl % 2 === 1);
  const b = isBMinus ? -bVal : bVal;

  // Richiesta esplicita: molti più esercizi con il segno - al terzo termine (75% dei casi)
  const isThirdMinus = (lvl % 4 !== 0);
  const cVal = 2 + ((lvl * 2) % 3);
  const c = isThirdMinus ? -cVal : cVal;

  const t1 = a === 1 ? 'x³' : `${a}x³`;
  const t2Sign = b < 0 ? '−' : '+';
  const t2Val = Math.abs(b);
  const t2 = `${t2Sign} ${t2Val === 1 ? '' : t2Val}x²`;

  const ac = a * c;
  const bc = b * c;
  const t3 = ac < 0 ? `− ${Math.abs(ac)}x` : `+ ${ac}x`;
  const t4 = bc < 0 ? `− ${Math.abs(bc)}` : `+ ${bc}`;

  const expr = `${t1} ${t2} ${t3} ${t4}`;

  // Se il terzo termine è negativo: raccoglimento con segno meno davanti alla seconda coppia
  const pairSign = isThirdMinus ? '−' : '+';
  const pair1 = a === 1 ? `(x³ ${t2Sign} ${t2Val}x²)` : `(${a}x³ ${t2Sign} ${t2Val}x²)`;

  // Quando estraiamo il segno meno davanti alla seconda coppia:
  // − ac·x + bc  =>  − (ac·x − bc)
  const innerSign = isThirdMinus ? (bc > 0 ? '−' : '+') : (bc < 0 ? '−' : '+');
  const innerConst = Math.abs(bc);
  const pair2 = isThirdMinus
    ? `(${Math.abs(ac)}x ${innerSign} ${innerConst})`
    : `(${ac}x ${t4})`;

  const mcd1 = 'x²';
  const quot1 = a === 1 ? `x ${t2Sign} ${t2Val}` : `${a}x ${t2Sign} ${t2Val}`;
  const mcd2 = `${cVal}`;
  const quot2 = quot1;
  const finalCommon = quot1;
  const finalOther = isThirdMinus ? `x² − ${cVal}` : `x² + ${cVal}`;

  return {
    id: `gen-lvl-${lvl}`,
    title: `Livello ${lvl} - Raccoglimento Parziale: ${expr}`,
    expression: expr,
    category: 'Scomposizione',
    par: 3,
    baseScore: 2800 + lvl * 70,
    hint: `Passo 1: Raccogli il fattore comune in ciascuna coppia (attenzione al segno se il terzo termine è negativo!). Passo 2: Raccogli la parentesi comune.`,
    subType: 'partial_grouping',
    metadata: {
      pair1,
      pairSign,
      pair2,
      mcd1,
      quot1,
      mcd2,
      quot2,
      finalCommon,
      finalOther,
    },
  };
}

// ---------------------------------------------------------------------------
// 9. EQUAZIONI CON PARENTESI
// ---------------------------------------------------------------------------
function generateParensLinear(lvl: number, diff: number): NotebookLevel {
  const factor = 2 + (lvl % 3) + Math.min(diff, 2);
  const root = 2 + ((lvl * 2) % 6);
  const isMinus = (lvl % 2 === 1);
  const innerConst = 1 + (lvl % 4);
  const innerDiff = isMinus ? (root - innerConst) : (root + innerConst);
  const rhs = factor * innerDiff;

  const signStr = isMinus ? '−' : '+';
  const expr = `${factor}(x ${signStr} ${innerConst}) = ${rhs}`;

  return {
    id: `topic-parens-lvl-${lvl}`,
    title: `Livello ${diff} - Equazione con Parentesi: ${expr}`,
    expression: expr,
    category: 'Equazione',
    par: 3,
    baseScore: 2400 + diff * 60,
    hint: `Distribuisci il ${factor} moltiplicando ciascun termine dentro la parentesi, poi trasporta i termini e risolvi.`,
    subType: 'linear_parens',
  };
}

// ---------------------------------------------------------------------------
// 10. SOMMA DI CUBI (2 Termini)
// ---------------------------------------------------------------------------
function generateSumCubes(seed: number, diff: number): NotebookLevel {
  const baseBOptions = [2, 3, 4, 5];
  const b = baseBOptions[(seed + diff) % baseBOptions.length];
  const bCubed = b * b * b;
  const bSq = b * b;
  const expr = `x³ + ${bCubed}`;
  const binom = `x+${b}`;
  const trinom = `x²-${b}x+${bSq}`;

  return {
    id: `gen-sumcubes-${seed}`,
    title: `Somma di Cubi (Lv. ${diff}): ${expr}`,
    expression: expr,
    category: 'Scomposizione',
    par: 2,
    baseScore: 2700 + diff * 60,
    hint: `Calcola la radice cubica di entrambi i termini ed applica la formula della somma di cubi: A³ + B³ = (A + B)(A² − AB + B²).`,
    subType: 'sum_cubes',
    metadata: {
      baseA: 'x',
      baseB: String(b),
      binom,
      trinom,
      finalResult: `(${binom})(${trinom})`,
    },
  };
}

// ---------------------------------------------------------------------------
// 11. DIFFERENZA DI CUBI (2 Termini)
// ---------------------------------------------------------------------------
function generateDiffCubes(seed: number, diff: number): NotebookLevel {
  const baseBOptions = [2, 3, 4, 5];
  const b = baseBOptions[(seed + diff) % baseBOptions.length];
  const bCubed = b * b * b;
  const bSq = b * b;
  const expr = `x³ − ${bCubed}`;
  const binom = `x-${b}`;
  const trinom = `x²+${b}x+${bSq}`;

  return {
    id: `gen-diffcubes-${seed}`,
    title: `Diff. di Cubi (Lv. ${diff}): ${expr}`,
    expression: expr,
    category: 'Scomposizione',
    par: 2,
    baseScore: 2700 + diff * 60,
    hint: `Calcola la radice cubica di entrambi i termini ed applica la formula della differenza di cubi: A³ − B³ = (A − B)(A² + AB + B²).`,
    subType: 'diff_cubes',
    metadata: {
      baseA: 'x',
      baseB: String(b),
      binom,
      trinom,
      finalResult: `(${binom})(${trinom})`,
    },
  };
}

// ---------------------------------------------------------------------------
// 12. MISTO MCD + TRINOMIO (3 Termini)
// ---------------------------------------------------------------------------
function generateMixedMcdTrinomial(seed: number, diff: number): NotebookLevel {
  const kList = [2, 3, 5];
  const k = kList[(seed + diff) % kList.length];
  const d1 = 1 + ((seed + 1) % 4);
  const d2 = 2 + ((seed + diff) % 5);
  const s = d1 + d2;
  const p = d1 * d2;

  const cX2 = k;
  const cX = k * s;
  const cConst = k * p;
  const expr = `${cX2}x² + ${cX}x + ${cConst}`;

  return {
    id: `gen-mixed-trinom-${seed}`,
    title: `Misto MCD + Trinomio (Lv. ${diff}): ${expr}`,
    expression: expr,
    category: 'Scomposizione',
    par: 3,
    baseScore: 2800 + diff * 70,
    hint: `Passo 1: Raccogli il fattore comune numerico per isolare il trinomio. Passo 2: Trova due numeri con somma e prodotto per completare la scomposizione.`,
    subType: 'mixed_mcd_trinomial',
    metadata: {
      mcdNum: String(k),
      innerTrinom: `x²+${s}x+${p}`,
      d1: String(d1),
      d2: String(d2),
      finalFactors: `${k}(x+${d1})(x+${d2})`,
    },
  };
}

// ---------------------------------------------------------------------------
// 13. TRINOMIO CON A != 1 CON SDOPPIAMENTO (3 Termini)
// ---------------------------------------------------------------------------
function generateTrinomialAdvanced(seed: number, diff: number): NotebookLevel {
  const pairs = [
    { a: 2, b: 7, c: 3, p1: '6x', p2: 'x', res: '(x+3)(2x+1)' },
    { a: 3, b: 7, c: 2, p1: '6x', p2: 'x', res: '(x+2)(3x+1)' },
    { a: 2, b: 5, c: 2, p1: '4x', p2: 'x', res: '(x+2)(2x+1)' },
    { a: 2, b: 11, c: 5, p1: '10x', p2: 'x', res: '(x+5)(2x+1)' },
  ];
  const item = pairs[(seed + diff) % pairs.length];
  const expr = `${item.a}x² + ${item.b}x + ${item.c}`;

  return {
    id: `gen-trinom-adv-${seed}`,
    title: `Trinomio con a ≠ 1 (Lv. ${diff}): ${expr}`,
    expression: expr,
    category: 'Scomposizione',
    par: 3,
    baseScore: 2900 + diff * 80,
    hint: `Trova due numeri la cui somma sia b e il cui prodotto sia a · c per sdoppiare il termine centrale, poi applica il raccoglimento parziale.`,
    subType: 'trinomial_advanced',
    metadata: {
      split1: item.p1,
      split2: item.p2,
      fourTerms: `${item.a}x²+${item.p1}+${item.p2}+${item.c}`,
      finalResult: item.res,
    },
  };
}

// ---------------------------------------------------------------------------
// 14. CUBO DI BINOMIO (4 Termini)
// ---------------------------------------------------------------------------
function generateCubeBinomial(seed: number, diff: number): NotebookLevel {
  const bList = [1, 2, 3];
  const b = bList[(seed + diff) % bList.length];
  const isMinus = (seed % 2 === 1);
  const sign = isMinus ? '−' : '+';
  const c1 = 3 * b;
  const c2 = 3 * b * b;
  const c3 = b * b * b;
  const expr = isMinus
    ? `x³ − ${c1}x² + ${c2}x − ${c3}`
    : `x³ + ${c1}x² + ${c2}x + ${c3}`;

  return {
    id: `gen-cubebinom-${seed}`,
    title: `Cubo di Binomio (Lv. ${diff}): ${expr}`,
    expression: expr,
    category: 'Scomposizione',
    par: 2,
    baseScore: 2800 + diff * 60,
    hint: `Individua le radici cubiche dei due cubi estremi e verifica la corrispondenza dei due tripli prodotti per comporre (A ± B)³.`,
    subType: 'cube_binomial',
    metadata: {
      baseA: 'x',
      baseB: String(b),
      sign: isMinus ? '-' : '+',
      finalResult: `(x${isMinus ? '-' : '+'}${b})³`,
    },
  };
}

// ---------------------------------------------------------------------------
// 15. RAGGRUPPAMENTO 3+1 (4 Termini)
// ---------------------------------------------------------------------------
function generateGrouping31(seed: number, diff: number): NotebookLevel {
  const bList = [2, 3, 4, 5];
  const b = bList[(seed + diff) % bList.length];
  const expr = `x² + ${2 * b}x + ${b * b} − y²`;

  return {
    id: `gen-group31-${seed}`,
    title: `Raggruppamento (3+1) (Lv. ${diff}): ${expr}`,
    expression: expr,
    category: 'Scomposizione',
    par: 2,
    baseScore: 2900 + diff * 70,
    hint: `Riconosci il quadrato di binomio nei primi 3 termini, poi scomponi la differenza tra i due quadrati in prodotto di somma per differenza.`,
    subType: 'grouping_3_1',
    metadata: {
      sqTrinom: `(x+${b})²`,
      subSq: 'y²',
      finalResult: `(x+${b}-y)(x+${b}+y)`,
    },
  };
}

// ---------------------------------------------------------------------------
// 16. RAGGRUPPAMENTO 3+2 (5 Termini)
// ---------------------------------------------------------------------------
function generateGrouping32(seed: number, diff: number): NotebookLevel {
  const bList = [2, 3, 4];
  const kList = [3, 4, 5];
  const b = bList[(seed + diff) % bList.length];
  const k = kList[(seed + diff * 2) % kList.length];
  const expr = `x² + ${2 * b}x + ${b * b} + ${k}x + ${k * b}`;

  return {
    id: `gen-group32-${seed}`,
    title: `Raggruppamento (3+2) (Lv. ${diff}): ${expr}`,
    expression: expr,
    category: 'Scomposizione',
    par: 3,
    baseScore: 3000 + diff * 80,
    hint: `Passo 1: Riconosci il quadrato di binomio nella terna e raccogli a fattore comune nella coppia. Passo 2: Raccogli la parentesi comune.`,
    subType: 'grouping_3_2',
    metadata: {
      triStep: `(x+${b})²`,
      linStep: `${k}(x+${b})`,
      finalFactor1: `x+${b}`,
      finalFactor2: `x+${b + k}`,
      finalResult: `(x+${b})(x+${b + k})`,
    },
  };
}

// ---------------------------------------------------------------------------
// 17. RUFFINI 4° GRADO A 5 TERMINI (5 Termini)
// ---------------------------------------------------------------------------
function generateRuffiniDegree4(seed: number, diff: number): NotebookLevel {
  const cases = [
    { expr: 'x⁴ + x³ − 7x² − x + 6', root: '1', divisor: 'x-1', quot: 'x³+2x²-5x-6', res: '(x-1)(x³+2x²-5x-6)' },
    { expr: 'x⁴ − 2x³ − 3x² + 4x + 4', root: '-1', divisor: 'x+1', quot: 'x³-3x²+4', res: '(x+1)(x³-3x²+4)' },
    { expr: 'x⁴ + 2x³ − x² − 2x + 1', root: '1', divisor: 'x-1', quot: 'x³+3x²+2x-1', res: '(x-1)(x³+3x²+2x-1)' },
  ];
  const item = cases[(seed + diff) % cases.length];

  return {
    id: `gen-ruffini-${seed}`,
    title: `Ruffini a 5 Termini (Lv. ${diff}): ${item.expr}`,
    expression: item.expr,
    category: 'Scomposizione',
    par: 3,
    baseScore: 3200 + diff * 100,
    hint: `Trova uno zero c tra i divisori del termine noto tale che P(c) = 0, poi esegui la divisione con la regola di Ruffini.`,
    subType: 'ruffini_degree4',
    metadata: {
      root: item.root,
      divisor: item.divisor,
      quotient: item.quot,
      finalResult: item.res,
    },
  };
}

// ---------------------------------------------------------------------------
// 18. RACCOGLIMENTO TOTALE SU 5 TERMINI (5 Termini)
// ---------------------------------------------------------------------------
function generateMcd5Terms(seed: number, diff: number): NotebookLevel {
  const kList = [2, 3, 5];
  const k = kList[(seed + diff) % kList.length];
  const expr = `${k}x⁴ − ${2 * k}x³ + ${3 * k}x² − ${4 * k}x + ${5 * k}`;
  const quot = `x⁴-2x³+3x²-4x+5`;

  return {
    id: `gen-mcd5-${seed}`,
    title: `MCD su 5 Termini (Lv. ${diff}): ${expr}`,
    expression: expr,
    category: 'Scomposizione',
    par: 2,
    baseScore: 2900 + diff * 70,
    hint: `Individua il divisore comune a tutti e 5 i termini ed estrailo dividendo ciascun monomio per comporre il prodotto.`,
    subType: 'mcd_5terms',
    metadata: {
      mcd: String(k),
      quot,
      finalResult: `${k}(${quot})`,
    },
  };
}

/**
 * Genera un esercizio procedurale mirato su uno SPECIFICO argomento
 * a livello di difficoltà crescente.
 */
export function generateTopicLevel(subType: SubType, difficultyLevel: number): NotebookLevel {
  const seed = (Date.now() % 1000) + difficultyLevel * 17;
  switch (subType) {
    case 'linear_simple': {
      const lvl = generateSimpleLinear(seed, difficultyLevel);
      lvl.title = `Equazioni Base (Lv. ${difficultyLevel}): ${lvl.expression}`;
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    case 'linear_twosided': {
      const lvl = generateTwoSidedLinear(seed, difficultyLevel);
      lvl.title = `Incognita su 2 Lati (Lv. ${difficultyLevel}): ${lvl.expression}`;
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    case 'linear_parens': {
      const lvl = generateParensLinear(seed, difficultyLevel);
      lvl.title = `Con Parentesi (Lv. ${difficultyLevel}): ${lvl.expression}`;
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    // 2 TERMINI (BINOMI)
    case 'diff_squares': {
      const lvl = generateDiffSquares(seed, difficultyLevel);
      lvl.title = `Diff. di Quadrati (Lv. ${difficultyLevel}): ${lvl.expression}`;
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    case 'common_mcd': {
      const lvl = generateMcdLevel(seed, difficultyLevel);
      lvl.title = `Fattore Comune MCD (Lv. ${difficultyLevel}): ${lvl.expression}`;
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    case 'mixed_mcd_squares': {
      const lvl = generateMixedLevel(seed);
      lvl.title = `Misto MCD + Quadrati (Lv. ${difficultyLevel}): ${lvl.expression}`;
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    case 'sum_cubes': {
      const lvl = generateSumCubes(seed, difficultyLevel);
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    case 'diff_cubes': {
      const lvl = generateDiffCubes(seed, difficultyLevel);
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    // 3 TERMINI (TRINOMI)
    case 'square_binomial': {
      const lvl = generateSquareBinomialLevel(seed);
      lvl.title = `Quadrato di Binomio (Lv. ${difficultyLevel}): ${lvl.expression}`;
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    case 'trinomial': {
      const lvl = generateTrinomialLevel(seed, difficultyLevel);
      lvl.title = `Trinomio Speciale (Lv. ${difficultyLevel}): ${lvl.expression}`;
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    case 'mixed_mcd_trinomial': {
      const lvl = generateMixedMcdTrinomial(seed, difficultyLevel);
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    case 'trinomial_advanced': {
      const lvl = generateTrinomialAdvanced(seed, difficultyLevel);
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    // 4 TERMINI (QUADRINOMI)
    case 'partial_grouping': {
      const lvl = generatePartialGroupingLevel(seed, difficultyLevel);
      lvl.title = `Raccoglimento Parziale (Lv. ${difficultyLevel}): ${lvl.expression}`;
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    case 'cube_binomial': {
      const lvl = generateCubeBinomial(seed, difficultyLevel);
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    case 'grouping_3_1': {
      const lvl = generateGrouping31(seed, difficultyLevel);
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    // 5 TERMINI (POLINOMI A 5 TERMINI)
    case 'grouping_3_2': {
      const lvl = generateGrouping32(seed, difficultyLevel);
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    case 'ruffini_degree4': {
      const lvl = generateRuffiniDegree4(seed, difficultyLevel);
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    case 'mcd_5terms': {
      const lvl = generateMcd5Terms(seed, difficultyLevel);
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
    default: {
      const lvl = generateSimpleLinear(seed, difficultyLevel);
      lvl.id = `topic-${subType}-${difficultyLevel}-${seed}`;
      return lvl;
    }
  }
}
