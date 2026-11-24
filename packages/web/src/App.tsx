import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CleanHeader } from './components/CleanHeader';
import { TouchAlgebraBoard } from './components/TouchAlgebraBoard';
import { CleanHintModal } from './components/CleanHintModal';
import { CleanStrikeModal } from './components/CleanStrikeModal';
import { CleanLeaderboard, ScoreItem } from './components/CleanLeaderboard';
import { CleanCustomModal } from './components/CleanCustomModal';
import { CleanMissionCompleteModal } from './components/CleanMissionCompleteModal';
import { NotebookLevel } from './types';
import { generateProgressiveLevel, generateTopicLevel } from './data/expressionGenerator';
import { ALGEBRA_TOPICS, AlgebraTopic } from './data/topics';

const INITIAL_NOTEBOOK_LEVELS: NotebookLevel[] = [
  // --- EQUAZIONI DI 1° GRADO ---
  {
    id: 'lvl-1',
    title: 'Equazione: 2x + 6 = 14',
    expression: '2x + 6 = 14',
    category: 'Equazione',
    par: 3,
    baseScore: 2000,
    hint: 'Sposta il termine 6 a destra dell\'uguale, calcola 14 − 6 = 8, inserisci la frazione 8/2 e calcola il risultato finale.',
  },
  {
    id: 'lvl-2',
    title: 'Equazione: 3x − 5 = 10',
    expression: '3x − 5 = 10',
    category: 'Equazione',
    par: 3,
    baseScore: 2000,
    hint: 'Sposta −5 a destra dell\'uguale invertendo il segno (+5), calcola 10 + 5 = 15, inserisci la frazione 15/3 e calcola.',
  },
  {
    id: 'lvl-3',
    title: 'Equazione con due x: 5x − 7 = 2x + 8',
    expression: '5x − 7 = 2x + 8',
    category: 'Equazione',
    par: 4,
    baseScore: 2400,
    hint: 'Trasporta i termini con la x a sinistra (2x diventa −2x) e i numeri a destra (−7 diventa +7). Fondi e risolvi la frazione.',
  },
  {
    id: 'lvl-4',
    title: 'Equazione: 7x + 4 = 3x + 20',
    expression: '7x + 4 = 3x + 20',
    category: 'Equazione',
    par: 4,
    baseScore: 2400,
    hint: 'Sposta 3x a sinistra (diventa −3x) e +4 a destra (diventa −4). Calcola 4x = 16 e dividi.',
  },
  {
    id: 'lvl-5',
    title: 'Equazione con Parentesi: 4(x − 1) = 16',
    expression: '4(x − 1) = 16',
    category: 'Equazione',
    par: 3,
    baseScore: 2500,
    hint: 'Distribuisci il 4 per ottenere 4x − 4 = 16, poi trasporta il 4 a destra e risolvi la frazione.',
  },

  // --- SCOMPOSIZIONE: DIFFERENZE DI QUADRATI (A² - B²) ---
  {
    id: 'lvl-6',
    title: 'Scomposizione: 9 − x²',
    expression: '9 − x²',
    category: 'Scomposizione',
    par: 2,
    baseScore: 2200,
    hint: 'Differenza di quadrati: estrai le radici quadrate √9 = 3 e √(x²) = x, poi componi i fattori coniugati (3 − x)(3 + x).',
  },
  {
    id: 'lvl-7',
    title: 'Scomposizione: 25 − 4x²',
    expression: '25 − 4x²',
    category: 'Scomposizione',
    par: 2,
    baseScore: 2400,
    hint: 'Estrai le radici dei quadrati: √25 = 5 e √(4x²) = 2x. Componi (5 − 2x)(5 + 2x).',
  },
  {
    id: 'lvl-8',
    title: 'Scomposizione: x² − 16',
    expression: 'x² − 16',
    category: 'Scomposizione',
    par: 2,
    baseScore: 2200,
    hint: 'Differenza di quadrati con termine letterale per primo: √x² = x e √16 = 4. Risultato: (x − 4)(x + 4).',
  },

  // --- SCOMPOSIZIONE: RACCOGLIMENTO A FATTORE COMUNE (MCD) ---
  {
    id: 'lvl-9',
    title: 'Scomposizione: 6x² + 9x',
    expression: '6x² + 9x',
    category: 'Scomposizione',
    par: 2,
    baseScore: 2300,
    hint: 'Trova il MCD numerico (3) e letterale (x) per estrarre 3x. Calcola i quozienti: 6x²/3x = 2x e 9x/3x = 3.',
  },
  {
    id: 'lvl-10',
    title: 'Scomposizione: 4x³ − 8x²',
    expression: '4x³ − 8x²',
    category: 'Scomposizione',
    par: 2,
    baseScore: 2500,
    hint: 'Il MCD massimo tra 4x³ e 8x² è 4x². Estrailo per ottenere 4x²(x − 2).',
  },

  // --- SCOMPOSIZIONE: RACCOGLIMENTO TOTALE + DIFFERENZA DI QUADRATI ---
  {
    id: 'lvl-11',
    title: 'Scomposizione Mista: −2x² + 8',
    expression: '−2x² + 8',
    category: 'Scomposizione',
    par: 3,
    baseScore: 2600,
    hint: 'Estrai prima il fattore comune −2 per ottenere −2(x² − 4), poi scomponi la differenza di quadrati interna in (x − 2)(x + 2).',
  },

  // --- SCOMPOSIZIONE: TRINOMIO PARTICOLARE (SOMMA E PRODOTTO) ---
  {
    id: 'lvl-12',
    title: 'Trinomio Notevole: x² + 5x + 6',
    expression: 'x² + 5x + 6',
    category: 'Scomposizione',
    par: 2,
    baseScore: 2600,
    hint: 'Cerca due numeri la cui somma è +5 e il cui prodotto è +6. I due numeri sono +2 e +3: (x + 2)(x + 3).',
  },
  {
    id: 'lvl-13',
    title: 'Trinomio Notevole: x² − 7x + 12',
    expression: 'x² − 7x + 12',
    category: 'Scomposizione',
    par: 2,
    baseScore: 2600,
    hint: 'Cerca due numeri con somma −7 e prodotto +12. I numeri sono −3 e −4: (x − 3)(x − 4).',
  },

  // --- SCOMPOSIZIONE: QUADRATO DI BINOMIO ---
  {
    id: 'lvl-14',
    title: 'Quadrato di Binomio: x² + 6x + 9',
    expression: 'x² + 6x + 9',
    category: 'Scomposizione',
    par: 2,
    baseScore: 2400,
    hint: 'Riconosci il quadrato del primo termine (x²), il quadrato del secondo (9 = 3²) e il doppio prodotto (2 · 3 · x = 6x): (x + 3)²',
  },

  // --- SCOMPOSIZIONE: RACCOGLIMENTO PARZIALE A 4 TERMINI ---
  {
    id: 'lvl-15',
    title: 'Raccoglimento Parziale: 2x³ − 3x² + 4x − 6',
    expression: '2x³ − 3x² + 4x − 6',
    category: 'Scomposizione',
    par: 3,
    baseScore: 2800,
    hint: 'Raccogli a due a due: x²(2x − 3) + 2(2x − 3). Poi raccogli il binomio comune: (2x − 3)(x² + 2).',
  },
];

const STORAGE_KEY = 'gambito_notebook_scores_v3';

const INITIAL_SCORES: ScoreItem[] = [
  { id: '1', name: 'Euler', expression: '2x + 6 = 14', score: 2350, moves: 3, date: '22/11/2026' },
  { id: '2', name: 'Gauss', expression: '9 − x²', score: 2200, moves: 1, date: '22/11/2026' },
  { id: '3', name: 'Hypatia', expression: '3x − 5 = 10', score: 2100, moves: 3, date: '21/11/2026' },
];

export const App: React.FC = () => {
  const [activeTopic, setActiveTopic] = useState<AlgebraTopic>(ALGEBRA_TOPICS[0]!);
  const [currentLevel, setCurrentLevel] = useState<NotebookLevel>(ALGEBRA_TOPICS[0]!.baseExample);
  const [topicDifficulties, setTopicDifficulties] = useState<Record<string, number>>({});
  const currentTopicDifficulty = topicDifficulties[activeTopic.id] || 1;

  const [score, setScore] = useState(currentLevel.baseScore);
  const [moves, setMoves] = useState(0);
  const [lives, setLives] = useState(3);
  const [wonResult, setWonResult] = useState<string | null>(null);
  const [restartCount, setRestartCount] = useState(0);

  // Modals
  const [isHintOpen, setIsHintOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [isStrikeOutOpen, setIsStrikeOutOpen] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [isMissionCompleteOpen, setIsMissionCompleteOpen] = useState(false);

  // Classifica salvata
  const [scores, setScores] = useState<ScoreItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : INITIAL_SCORES;
    } catch {
      return INITIAL_SCORES;
    }
  });

  const resetCurrentLevel = () => {
    setScore(currentLevel.baseScore);
    setMoves(0);
    setLives(3);
    setWonResult(null);
    setIsStrikeOutOpen(false);
    setIsMissionCompleteOpen(false);
    setRestartCount(c => c + 1);
  };

  // Seleziona un argomento dal menù curricolare
  const handleSelectTopic = (topic: AlgebraTopic) => {
    setActiveTopic(topic);
    const diff = topicDifficulties[topic.id] || 1;
    const lvl = diff === 1 ? topic.baseExample : generateTopicLevel(topic.subType, diff);
    setCurrentLevel(lvl);
    setScore(lvl.baseScore);
    setMoves(0);
    setLives(3);
    setWonResult(null);
    setIsStrikeOutOpen(false);
    setIsMissionCompleteOpen(false);
    setRestartCount(c => c + 1);
  };

  // Genera un esercizio procedurale mirato sullo specifico argomento selezionato con difficoltà +1
  const handlePracticeTopic = () => {
    const nextDiff = (topicDifficulties[activeTopic.id] || 1) + 1;
    setTopicDifficulties(prev => ({ ...prev, [activeTopic.id]: nextDiff }));
    const nextLvl = generateTopicLevel(activeTopic.subType, nextDiff);
    setCurrentLevel(nextLvl);
    setScore(nextLvl.baseScore);
    setMoves(0);
    setLives(3);
    setWonResult(null);
    setIsStrikeOutOpen(false);
    setIsMissionCompleteOpen(false);
    setRestartCount(c => c + 1);
  };

  // Passa al prossimo argomento della lista
  const handleNextTopic = () => {
    const currIdx = ALGEBRA_TOPICS.findIndex(t => t.id === activeTopic.id);
    const nextIdx = (currIdx + 1) % ALGEBRA_TOPICS.length;
    handleSelectTopic(ALGEBRA_TOPICS[nextIdx]!);
  };

  const handleAddCustomLevel = (newLvl: NotebookLevel) => {
    setCurrentLevel(newLvl);
    setScore(newLvl.baseScore);
    setMoves(0);
    setLives(3);
    setWonResult(null);
    setIsStrikeOutOpen(false);
    setIsMissionCompleteOpen(false);
    setRestartCount(c => c + 1);
  };

  // Quando viene eseguita una mossa manuale
  const handleMoveAction = () => {
    setMoves(m => {
      const nextM = m + 1;
      if (nextM > currentLevel.par) {
        setScore(s => Math.max(100, s - 60));
      }
      return nextM;
    });
  };

  // Errore commesso (segno dimenticato, calcolo errato)
  const handleMistake = (msg: string) => {
    setLives(prev => {
      const next = prev - 1;
      setScore(s => Math.max(100, s - 200));
      if (next <= 0) {
        setIsStrikeOutOpen(true);
      }
      return Math.max(0, next);
    });
  };

  // Vittoria: risultato finale convalidato!
  const handleWin = (finalExpr: string, movesTaken: number) => {
    setWonResult(finalExpr);
    setIsMissionCompleteOpen(true);

    const parBonus = moves <= currentLevel.par ? 600 : 250;
    setScore(s => s + parBonus);

    try {
      confetti({ particleCount: 110, spread: 80, origin: { y: 0.6 } });
    } catch {}
  };

  const handleSaveScore = (name: string) => {
    const newItem: ScoreItem = {
      id: `sc-${Date.now()}`,
      name,
      expression: currentLevel.expression,
      score,
      moves,
      date: new Date().toLocaleDateString('it-IT'),
    };
    setScores(prev => {
      const updated = [newItem, ...prev].sort((a, b) => b.score - a.score);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
    setIsLeaderboardOpen(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header Pulito con Selezione Argomenti Curricolari ed Esercitazione Mirata */}
      <CleanHeader
        currentLevel={currentLevel as any}
        topics={ALGEBRA_TOPICS}
        activeTopic={activeTopic}
        onSelectTopic={handleSelectTopic}
        topicDifficulty={currentTopicDifficulty}
        onPracticeTopic={handlePracticeTopic}
        lives={lives}
        score={score}
        moves={moves}
        onOpenHint={() => setIsHintOpen(true)}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onOpenCustomModal={() => setIsCustomModalOpen(true)}
      />

      {/* Main: Il Quaderno Digitale di Calcolo */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem 1rem' }}>
        <TouchAlgebraBoard
          key={`${currentLevel.id}-${restartCount}`}
          initialTitle={currentLevel.expression}
          category={currentLevel.category}
          par={currentLevel.par}
          subType={currentLevel.subType}
          metadata={currentLevel.metadata}
          onWin={handleWin}
          onMistake={handleMistake}
          onMoveAction={handleMoveAction}
        />

        {/* Pulsanti Azione quando il Risultato Finale è Raggiunto */}
        {wonResult && (
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
            <button
              onClick={() => setIsLeaderboardOpen(true)}
              style={{
                padding: '0.85rem 1.6rem',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--border-paper)',
                color: '#fff',
                fontSize: '1rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              ✍️ Registra Punteggio ({score} pt)
            </button>
            <button
              onClick={handlePracticeTopic}
              style={{
                padding: '0.85rem 1.8rem',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                color: '#fff',
                fontSize: '1.05rem',
                fontWeight: 900,
                boxShadow: '0 4px 20px rgba(16, 185, 129, 0.4)',
                cursor: 'pointer',
              }}
            >
              🎯 Continua Questo Argomento (+Difficoltà Lv. {currentTopicDifficulty + 1}) ➔
            </button>
            <button
              onClick={handleNextTopic}
              style={{
                padding: '0.85rem 1.6rem',
                borderRadius: '12px',
                background: 'rgba(56, 189, 248, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                color: '#38bdf8',
                fontSize: '1rem',
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              📚 Prossimo Argomento ➔
            </button>
          </div>
        )}
      </main>

      {/* Modal Aiuto su richiesta (-50 pt) */}
      <CleanHintModal
        isOpen={isHintOpen}
        onClose={() => setIsHintOpen(false)}
        hint={currentLevel.hint}
        onConfirmHint={() => setScore(s => Math.max(100, s - 50))}
      />

      {/* Modal 3 Errori: SI RIPARTE */}
      <CleanStrikeModal
        isOpen={isStrikeOutOpen}
        onRestart={resetCurrentLevel}
        expression={currentLevel.expression}
      />

      {/* Modal Classifica */}
      <CleanLeaderboard
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        scores={scores}
        currentScore={score}
        currentExpression={currentLevel.expression}
        onSaveScore={handleSaveScore}
        canSave={wonResult !== null}
      />

      {/* Modal Creazione Espressione Personalizzata */}
      <CleanCustomModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onAddLevel={handleAddCustomLevel}
      />

      {/* Modal MISSIONE COMPIUTA (Vittoria Esplicita con Risultato e Scelta Esercitazione) */}
      <CleanMissionCompleteModal
        isOpen={isMissionCompleteOpen}
        onClose={() => setIsMissionCompleteOpen(false)}
        onNextLevel={handleNextTopic}
        onNextDifficultySameTopic={handlePracticeTopic}
        topicDifficulty={currentTopicDifficulty}
        onOpenLeaderboard={() => {
          setIsMissionCompleteOpen(false);
          setIsLeaderboardOpen(true);
        }}
        expression={currentLevel.expression}
        finalResult={wonResult || ''}
        score={score}
        moves={moves}
        par={currentLevel.par}
        lives={lives}
      />
    </div>
  );
};
