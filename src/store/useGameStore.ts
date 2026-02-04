import { create } from 'zustand';
import { type GameSettings, type Team, type Player, type Card, type GameStatus, type RoundResult, type Prenda } from '../types';
import { shuffle } from '../utils/array';
import { INITIAL_CARDS } from '../data/cards';
import { INITIAL_PRENDAS } from '../data/prendas';

interface GameState {
  settings: GameSettings;
  teams: Team[];
  players: Player[];
  status: GameStatus;
  
  // Turn State
  currentTeamIndex: number;
  currentPlayerIndex: number; // Index within the current team
  currentCard: Card | null;
  currentPrenda: Prenda | null;
  roundTimeRemaining: number;
  currentRoundScore: number;
  roundResults: RoundResult[];
  
  // Game Progress
  deck: Card[];
  usedCardIds: string[];
  currentRoundNumber: number;

  // Actions
  setSettings: (settings: GameSettings) => void;
  addTeam: (team: Team) => void;
  addPlayer: (player: Player) => void;
  startGame: () => void;
  startRound: () => void;
  endRound: () => void;
  tickTimer: () => void;
  drawCard: () => void;
  recordRefusal: () => void; // For "Prenda" or "Forbidden Word"
  handlePrendaDone: () => void;
  scoreCard: () => void;
  skipCard: () => void;
  nextTurn: () => void;
  restartGame: () => void;
}

export const useGameStore = create<GameState>((set, get) => ({
  settings: {
    mode: 'teams',
    rounds: 5,
    scoreToWin: 0,
    timePerRound: 60,
    cardsPerRound: null, // Default unlimited
    prendasEnabled: false,
    allowSkips: true,
  },
  teams: [],
  players: [],
  status: 'setup',
  
  currentTeamIndex: 0,
  currentPlayerIndex: 0,
  currentCard: null,
  currentPrenda: null,
  roundTimeRemaining: 60,
  currentRoundScore: 0,
  roundResults: [],
  
  deck: [],
  usedCardIds: [],
  currentRoundNumber: 0,

  setSettings: (settings: GameSettings) => set({ settings }),
  addTeam: (team: Team) => set((state: GameState) => ({ teams: [...state.teams, team] })),
  addPlayer: (player: Player) => set((state: GameState) => ({ players: [...state.players, player] })),
  
  startGame: () => {
    const { settings } = get();
    // Validate
    if (settings.mode === 'teams' && get().teams.length < 2) {
      console.error("Need at least 2 teams");
      return;
    }

    set(() => ({
      status: 'turn_ready', // Waiting for first player to start
      currentRoundNumber: 1,
      currentTeamIndex: 0,
      currentPlayerIndex: 0,
      usedCardIds: [],
      // Shuffle deck
      deck: shuffle(INITIAL_CARDS),
    }));
  },

  startRound: () => {
    const { settings, deck, usedCardIds } = get();
    // Filter available cards
    const availableCards = deck.filter((c: Card) => !usedCardIds.includes(c.id));
    
    if (availableCards.length === 0) {
        // Reshuffle or end game?
        // simple reshuffle of all cards
         set({ usedCardIds: [] });
    }

    set({ 
      status: 'playing',
      roundTimeRemaining: settings.timePerRound, 
      currentRoundScore: 0, 
      roundResults: [] 
    });
    get().drawCard();
  },

  endRound: () => {
     set({ status: 'round_summary' });
  },

  tickTimer: () => {
    const { roundTimeRemaining, status, endRound } = get();
    if (status !== 'playing') return;
    
    if (roundTimeRemaining > 0) {
      set({ roundTimeRemaining: roundTimeRemaining - 1 });
    } else {
      endRound();
    }
  },

  drawCard: () => {
    const { deck, usedCardIds, settings, roundResults, endRound } = get();
    
    // Check card limit per round if set
    if (settings.cardsPerRound !== null && roundResults.length >= settings.cardsPerRound) {
        endRound();
        return;
    }

    const available = deck.filter((c: Card) => !usedCardIds.includes(c.id));
    
    if (available.length === 0) {
        get().endRound(); // Or recycle
        return;
    }

    // Pick random or next? Shuffle happened at start, so next available is fine
    const nextCard = available[0];
    set({ currentCard: nextCard });
  },

  recordRefusal: () => {
      const { currentCard, settings } = get();
      if (!currentCard) return;

      // Log result
      const result: RoundResult = {
          cardId: currentCard.id,
          status: settings.prendasEnabled ? 'prenda' : 'smashed',
          timestamp: Date.now()
      };

      // Select random prenda
      const randomPrenda = settings.prendasEnabled 
          ? INITIAL_PRENDAS[Math.floor(Math.random() * INITIAL_PRENDAS.length)]
          : null;

      set((state: GameState) => ({
          roundResults: [...state.roundResults, result],
          usedCardIds: [...state.usedCardIds, currentCard.id],
          status: settings.prendasEnabled ? 'prenda_alert' : 'playing',
          currentPrenda: randomPrenda
      }));

      // If playing continues (no prenda stop), draw next
       if (!settings.prendasEnabled) {
           get().drawCard();
       }
  },

  handlePrendaDone: () => {
      // Return to game or end turn?
      // Rules: "A carta é imediatamente encerrada". "A prenda é aplicada imediatamente após o erro".
      // "A partida termina..." - wait.
      // After prenda, do we continue the round? 
      // "O dador de dicas fala uma palavra proibida... A carta é imediatamente encerrada".
      // Usually turn continues with next card unless time is out.
      
      set({ status: 'playing' });
      get().drawCard();
  },

  scoreCard: () => {
      const { currentCard, currentTeamIndex } = get();
      if (!currentCard) return;

      const result: RoundResult = {
          cardId: currentCard.id,
          status: 'correct',
          timestamp: Date.now()
      };

      // Add score
      set((state: GameState) => {
          const newScore = state.currentRoundScore + 1;
          const newTeams = [...state.teams];
          // Update team score if in team mode, or just track general score logic
          if (state.settings.mode === 'teams' && newTeams[currentTeamIndex]) {
              newTeams[currentTeamIndex] = {
                  ...newTeams[currentTeamIndex],
                  score: newTeams[currentTeamIndex].score + 1
              };
          }
          
          return {
              currentRoundScore: newScore,
              teams: newTeams,
              roundResults: [...state.roundResults, result],
              usedCardIds: [...state.usedCardIds, currentCard.id]
          };
      });

      get().drawCard();
  },

  skipCard: () => {
      const { currentCard, settings } = get();
      if (!settings.allowSkips || !currentCard) return;

      const result: RoundResult = {
          cardId: currentCard.id,
          status: 'skipped',
          timestamp: Date.now()
      };

       set((state: GameState) => ({
          roundResults: [...state.roundResults, result],
          usedCardIds: [...state.usedCardIds, currentCard.id]
      }));

      get().drawCard();
  },
  
  nextTurn: () => {
      const { teams, currentTeamIndex, currentRoundNumber, settings } = get();
      const nextTeamIndex = (currentTeamIndex + 1) % teams.length;
      
      let nextRoundNumber = currentRoundNumber;
      if (nextTeamIndex === 0) {
          nextRoundNumber++;
      }

      // Check Game Over
      if (settings.rounds > 0 && nextRoundNumber > settings.rounds) {
          set({ status: 'game_over' });
          return;
      }

      // TODO: Check Max Score Win Condition

      set({
          status: 'turn_ready',
          currentTeamIndex: nextTeamIndex,
          currentRoundNumber: nextRoundNumber,
          currentRoundScore: 0,
          currentCard: null,
      });
  },
  
  restartGame: () => {
      set((state) => ({ 
          status: 'setup', 
          currentRoundNumber: 0, 
          usedCardIds: [], 
          currentRoundScore: 0,
          roundResults: [],
          teams: state.teams.map(t => ({ ...t, score: 0 })) 
      }));
  }
}));
