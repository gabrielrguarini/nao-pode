import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {  GameSettings, Team, Player, Card, GameStatus, RoundResult, Prenda } from '../types';
import { shuffle } from '../utils/array';
import { ContentService } from '../services/ContentService';

interface GameState {
  settings: GameSettings;
  teams: Team[];
  players: Player[];
  status: GameStatus;

  // Content State
  isLoading: boolean;
  allCards: Card[];
  allPrendas: Prenda[];
  
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
  initializeContent: () => Promise<void>;
  setSettings: (settings: GameSettings) => void;
  addTeam: (team: Team) => void;
  removeTeam: (id: string) => void;
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
  failPrenda: () => void;
  restartGame: (resetTeams?: boolean) => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      settings: {
        mode: 'teams',
        rounds: 999,
        scoreToWin: 0,
        timePerRound: 60,
        cardsPerRound: null,
        prendasEnabled: true,
        allowSkips: true,
      },
      teams: [],
      players: [],
      status: 'setup',

      isLoading: true,
      allCards: [],
      allPrendas: [],
      
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

      initializeContent: async () => {
        set({ isLoading: true });
        try {
          const { cards, prendas } = await ContentService.initialize();
          // We can check if we already have data from persistence
          // For now, allow overwriting with fresh data from Service logic (which honors cache)
          set({ 
            allCards: cards, 
            allPrendas: prendas, 
            isLoading: false 
          });
        } catch (error) {
          console.error("Failed to initialize content:", error);
          set({ isLoading: false });
        }
      },

      setSettings: (settings: GameSettings) => set({ settings }),
      addTeam: (team: Team) => set((state: GameState) => ({ teams: [...state.teams, team] })),
      removeTeam: (id: string) => set((state: GameState) => ({ teams: state.teams.filter((t: Team) => t.id !== id) })),
      addPlayer: (player: Player) => set((state: GameState) => ({ players: [...state.players, player] })),
      
      startGame: () => {
        const { settings, allCards, teams } = get();
        // Validate
        if (settings.mode === 'teams' && teams.length < 2) {
          console.error("Need at least 2 teams");
          return;
        }

        if (allCards.length === 0) {
            console.error("No cards loaded!");
            return;
        }

        // Ensure settings are clean
        // If cardsPerRound is 0 or negative, treat as null
        if (settings.cardsPerRound !== null && settings.cardsPerRound <= 0) {
            set((state) => ({ settings: { ...state.settings, cardsPerRound: null } }));
        }

        // Initialize statistics for all teams
        const teamsWithStats = teams.map(team => ({
          ...team,
          statistics: {
            totalCards: 0,
            correct: 0,
            taboos: 0,
            skipped: 0,
            longestStreak: 0
          }
        }));

        set(() => ({
          status: 'turn_ready', // Waiting for first player to start
          currentRoundNumber: 1,
          currentTeamIndex: 0,
          currentPlayerIndex: 0,
          usedCardIds: [],
          teams: teamsWithStats,
          // Shuffle deck from allCards
          deck: shuffle([...allCards]),
        }));
      },

      startRound: () => {
        const { settings, deck, usedCardIds } = get();
        // Filter available cards
        const availableCards = deck.filter((c: Card) => !usedCardIds.includes(c.id));
        
        if (availableCards.length === 0) {
            // Reshuffle or end game?
            // simple reshuffle of all cards could be done here if needed
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
          const { currentCard, settings, allPrendas, currentTeamIndex } = get();
          if (!currentCard) return;

          // Log result
          const result: RoundResult = {
              cardId: currentCard.id,
              status: settings.prendasEnabled ? 'prenda' : 'smashed',
              timestamp: Date.now()
          };

          // Select random prenda from loaded prendas
          const randomPrenda = (settings.prendasEnabled && allPrendas.length > 0)
              ? allPrendas[Math.floor(Math.random() * allPrendas.length)]
              : null;

          set((state: GameState) => {
              const newTeams = [...state.teams];
              
              // Update statistics
              if (state.settings.mode === 'teams' && newTeams[currentTeamIndex]) {
                  const currentStats = newTeams[currentTeamIndex].statistics || {
                      totalCards: 0,
                      correct: 0,
                      taboos: 0,
                      skipped: 0,
                      longestStreak: 0
                  };
                  
                  newTeams[currentTeamIndex] = {
                      ...newTeams[currentTeamIndex],
                      statistics: {
                          ...currentStats,
                          totalCards: currentStats.totalCards + 1,
                          taboos: currentStats.taboos + 1
                      }
                  };
              }
              
              return {
                  teams: newTeams,
                  roundResults: [...state.roundResults, result],
                  usedCardIds: [...state.usedCardIds, currentCard.id],
                  status: settings.prendasEnabled ? 'prenda_alert' : 'playing',
                  currentPrenda: randomPrenda
              };
          });

          // If playing continues (no prenda stop), draw next
           if (!settings.prendasEnabled) {
               get().drawCard();
           }
      },

      handlePrendaDone: () => {
          // Prenda fulfilled, no penalty beyond the "taboo" (which usually means lost point or just no gain).
          // Logic here: return to game.
          set({ status: 'playing' });
          get().drawCard();
      },

      failPrenda: () => {
          const { currentTeamIndex } = get();
          
          set((state: GameState) => {
              // Deduct 1 point from team score
              const newTeams = [...state.teams];
              if (newTeams[currentTeamIndex]) {
                  newTeams[currentTeamIndex] = {
                      ...newTeams[currentTeamIndex],
                      score: newTeams[currentTeamIndex].score - 1
                  };
              }
              // Also deduct from current round score? Usually round score tracks "correct" cards.
              // The penalty is global.
              
              return {
                  teams: newTeams,
                  status: 'playing'
              };
          });
          
          get().drawCard();
      },

      scoreCard: () => {
          const { currentCard, currentTeamIndex, roundResults } = get();
          if (!currentCard) return;

          const result: RoundResult = {
              cardId: currentCard.id,
              status: 'correct',
              timestamp: Date.now()
          };

          // Add score and update statistics
          set((state: GameState) => {
              const newScore = state.currentRoundScore + 1;
              const newTeams = [...state.teams];
              
              // Calculate current streak
              let currentStreak = 1;
              for (let i = roundResults.length - 1; i >= 0; i--) {
                  if (roundResults[i].status === 'correct') {
                      currentStreak++;
                  } else {
                      break;
                  }
              }
              
              // Update team score if in team mode, or just track general score logic
              if (state.settings.mode === 'teams' && newTeams[currentTeamIndex]) {
                  const currentStats = newTeams[currentTeamIndex].statistics || {
                      totalCards: 0,
                      correct: 0,
                      taboos: 0,
                      skipped: 0,
                      longestStreak: 0
                  };
                  
                  newTeams[currentTeamIndex] = {
                      ...newTeams[currentTeamIndex],
                      score: newTeams[currentTeamIndex].score + 1,
                      statistics: {
                          totalCards: currentStats.totalCards + 1,
                          correct: currentStats.correct + 1,
                          taboos: currentStats.taboos,
                          skipped: currentStats.skipped,
                          longestStreak: Math.max(currentStats.longestStreak, currentStreak)
                      }
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
          const { currentCard, settings, currentTeamIndex } = get();
          if (!settings.allowSkips || !currentCard) return;

          const result: RoundResult = {
              cardId: currentCard.id,
              status: 'skipped',
              timestamp: Date.now()
          };

          set((state: GameState) => {
              const newTeams = [...state.teams];
              
              // Update statistics
              if (state.settings.mode === 'teams' && newTeams[currentTeamIndex]) {
                  const currentStats = newTeams[currentTeamIndex].statistics || {
                      totalCards: 0,
                      correct: 0,
                      taboos: 0,
                      skipped: 0,
                      longestStreak: 0
                  };
                  
                  newTeams[currentTeamIndex] = {
                      ...newTeams[currentTeamIndex],
                      statistics: {
                          ...currentStats,
                          totalCards: currentStats.totalCards + 1,
                          skipped: currentStats.skipped + 1
                      }
                  };
              }
              
              return {
                  teams: newTeams,
                  roundResults: [...state.roundResults, result],
                  usedCardIds: [...state.usedCardIds, currentCard.id]
              };
          });

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
      
      restartGame: (resetTeams: boolean = false) => {
          set((state) => ({ 
              status: 'setup', 
              currentRoundNumber: 0, 
              usedCardIds: [], 
              currentRoundScore: 0,
              roundResults: [],
              teams: resetTeams ? [] : state.teams.map(t => ({ ...t, score: 0 })) 
          }));
      }
    }),
    {
      name: 'nao-pode-storage',
      partialize: (state) => ({
        settings: state.settings,
        teams: state.teams,
        status: state.status,
        currentTeamIndex: state.currentTeamIndex,
        currentPlayerIndex: state.currentPlayerIndex,
        currentCard: state.currentCard,
        currentPrenda: state.currentPrenda,
        roundTimeRemaining: state.roundTimeRemaining,
        currentRoundScore: state.currentRoundScore,
        roundResults: state.roundResults,
        deck: state.deck,
        usedCardIds: state.usedCardIds,
        currentRoundNumber: state.currentRoundNumber,
        allCards: state.allCards,
        allPrendas: state.allPrendas
      })
    }
  )
);
