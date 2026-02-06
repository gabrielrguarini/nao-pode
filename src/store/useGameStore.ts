import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  GameSettings,
  Team,
  Player,
  Card,
  GameStatus,
  RoundResult,
  Prenda,
  PlayerScore,
} from "../types";
import { shuffle } from "../utils/array";
import { ContentService } from "../services/ContentService";

interface GameState {
  settings: GameSettings;
  teams: Team[];
  players: Player[];
  playerScores: PlayerScore[]; // For individual mode
  status: GameStatus;

  // Content State
  isLoading: boolean;
  allCards: Card[];
  allPrendas: Prenda[];

  // Turn State
  currentTeamIndex: number;
  currentPlayerIndex: number; // Index within the current team (team mode) or current reader (individual)
  currentReaderIndex: number; // For individual mode: index of current reader
  selectedWinnerId: string | null; // For individual mode: who guessed correctly
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
  removePlayer: (id: string) => void;
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
  // Individual mode specific
  declareWinner: (playerId: string) => void;
  declareTaboo: () => void;
  skipRound: () => void;
}

export const useGameStore = create<GameState>()(
  persist(
    (set, get) => ({
      settings: {
        mode: "teams",
        rounds: 999,
        scoreToWin: 0,
        timePerRound: 60,
        cardsPerRound: null,
        prendasEnabled: true,
        allowSkips: true,
      },
      teams: [],
      players: [],
      playerScores: [],
      status: "setup",

      isLoading: true,
      allCards: [],
      allPrendas: [],

      currentTeamIndex: 0,
      currentPlayerIndex: 0,
      currentReaderIndex: 0,
      selectedWinnerId: null,
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
          set({
            allCards: cards,
            allPrendas: prendas,
            isLoading: false,
          });
        } catch (error) {
          console.error("Failed to initialize content:", error);
          set({ isLoading: false });
        }
      },

      setSettings: (settings: GameSettings) => set({ settings }),
      addTeam: (team: Team) =>
        set((state: GameState) => ({ teams: [...state.teams, team] })),
      removeTeam: (id: string) =>
        set((state: GameState) => ({
          teams: state.teams.filter((t: Team) => t.id !== id),
        })),
      addPlayer: (player: Player) =>
        set((state: GameState) => ({ players: [...state.players, player] })),
      removePlayer: (id: string) =>
        set((state: GameState) => ({
          players: state.players.filter((p: Player) => p.id !== id),
        })),

      startGame: () => {
        const { settings, allCards, teams, players } = get();

        if (settings.mode === "teams") {
          // Validate teams mode
          if (teams.length < 2) {
            console.error("Need at least 2 teams");
            return;
          }

          if (allCards.length === 0) {
            console.error("No cards loaded!");
            return;
          }

          if (settings.cardsPerRound !== null && settings.cardsPerRound <= 0) {
            set((state) => ({
              settings: { ...state.settings, cardsPerRound: null },
            }));
          }

          // Initialize statistics for all teams
          const teamsWithStats = teams.map((team) => ({
            ...team,
            statistics: {
              totalCards: 0,
              correct: 0,
              taboos: 0,
              skipped: 0,
              longestStreak: 0,
            },
          }));

          set(() => ({
            status: "turn_ready",
            currentRoundNumber: 1,
            currentTeamIndex: 0,
            currentPlayerIndex: 0,
            usedCardIds: [],
            teams: teamsWithStats,
            deck: shuffle([...allCards]),
          }));
        } else if (settings.mode === "individual") {
          // Validate individual mode
          if (players.length < 2) {
            console.error("Need at least 2 players");
            return;
          }

          if (allCards.length === 0) {
            console.error("No cards loaded!");
            return;
          }

          if (settings.scoreToWin <= 0) {
            console.error("Must set a valid score to win");
            return;
          }

          if (settings.cardsPerRound !== null && settings.cardsPerRound <= 0) {
            set((state) => ({
              settings: { ...state.settings, cardsPerRound: null },
            }));
          }

          // Initialize player scores
          const initialPlayerScores: PlayerScore[] = players.map((player) => ({
            playerId: player.id,
            playerName: player.name,
            score: 0,
            statistics: {
              totalCards: 0,
              correct: 0,
              taboos: 0,
              skipped: 0,
              longestStreak: 0,
            },
          }));

          set(() => ({
            status: "turn_ready",
            currentRoundNumber: 1,
            currentReaderIndex: 0,
            currentPlayerIndex: 0,
            selectedWinnerId: null,
            usedCardIds: [],
            playerScores: initialPlayerScores,
            deck: shuffle([...allCards]),
          }));
        }
      },

      startRound: () => {
        const { settings, deck, usedCardIds } = get();
        const availableCards = deck.filter(
          (c: Card) => !usedCardIds.includes(c.id),
        );

        if (availableCards.length === 0) {
          set({ usedCardIds: [] });
        }

        set({
          status: "playing",
          roundTimeRemaining: settings.timePerRound,
          currentRoundScore: 0,
          roundResults: [],
          selectedWinnerId: null,
        });
        get().drawCard();
      },

      endRound: () => {
        set({ status: "round_summary" });
      },

      tickTimer: () => {
        const { roundTimeRemaining, status, endRound } = get();
        if (status !== "playing") return;

        if (roundTimeRemaining > 0) {
          set({ roundTimeRemaining: roundTimeRemaining - 1 });
        } else {
          endRound();
        }
      },

      drawCard: () => {
        const { deck, usedCardIds, settings, roundResults, endRound } = get();

        if (
          settings.cardsPerRound !== null &&
          roundResults.length >= settings.cardsPerRound
        ) {
          endRound();
          return;
        }

        const available = deck.filter((c: Card) => !usedCardIds.includes(c.id));

        if (available.length === 0) {
          get().endRound();
          return;
        }

        const nextCard = available[0];
        set({ currentCard: nextCard });
      },

      recordRefusal: () => {
        const {
          currentCard,
          settings,
          allPrendas,
          currentTeamIndex,
          currentReaderIndex,
          playerScores,
        } = get();
        if (!currentCard) return;

        const result: RoundResult = {
          cardId: currentCard.id,
          status: settings.prendasEnabled ? "prenda" : "smashed",
          timestamp: Date.now(),
        };

        const randomPrenda =
          settings.prendasEnabled && allPrendas.length > 0
            ? allPrendas[Math.floor(Math.random() * allPrendas.length)]
            : null;

        set((state: GameState) => {
          if (state.settings.mode === "teams") {
            const newTeams = [...state.teams];

            if (newTeams[currentTeamIndex]) {
              const currentStats = newTeams[currentTeamIndex].statistics || {
                totalCards: 0,
                correct: 0,
                taboos: 0,
                skipped: 0,
                longestStreak: 0,
              };

              newTeams[currentTeamIndex] = {
                ...newTeams[currentTeamIndex],
                statistics: {
                  ...currentStats,
                  totalCards: currentStats.totalCards + 1,
                  taboos: currentStats.taboos + 1,
                },
              };
            }

            return {
              teams: newTeams,
              roundResults: [...state.roundResults, result],
              usedCardIds: [...state.usedCardIds, currentCard.id],
              status: settings.prendasEnabled ? "prenda_alert" : "playing",
              currentPrenda: randomPrenda,
            };
          } else {
            // Individual mode
            const newScores = [...playerScores];
            const readerIdx = newScores.findIndex(
              (p) => p.playerId === state.players[currentReaderIndex]?.id,
            );

            if (readerIdx >= 0) {
              const currentStats = newScores[readerIdx].statistics;
              newScores[readerIdx] = {
                ...newScores[readerIdx],
                statistics: {
                  ...currentStats,
                  totalCards: currentStats.totalCards + 1,
                  taboos: currentStats.taboos + 1,
                },
              };
            }

            return {
              playerScores: newScores,
              roundResults: [...state.roundResults, result],
              usedCardIds: [...state.usedCardIds, currentCard.id],
              status: settings.prendasEnabled ? "prenda_alert" : "playing",
              currentPrenda: randomPrenda,
            };
          }
        });

        if (!settings.prendasEnabled) {
          get().drawCard();
        }
      },

      handlePrendaDone: () => {
        set({ status: "playing" });
        get().drawCard();
      },

      failPrenda: () => {
        const { currentTeamIndex, currentReaderIndex, playerScores } = get();

        set((state: GameState) => {
          if (state.settings.mode === "teams") {
            const newTeams = [...state.teams];
            if (newTeams[currentTeamIndex]) {
              newTeams[currentTeamIndex] = {
                ...newTeams[currentTeamIndex],
                score: newTeams[currentTeamIndex].score - 1,
              };
            }
            return {
              teams: newTeams,
              status: "playing",
            };
          } else {
            // Individual mode - deduct 1 point from reader
            const newScores = [...playerScores];
            const readerIdx = newScores.findIndex(
              (p) => p.playerId === state.players[currentReaderIndex]?.id,
            );

            if (readerIdx >= 0) {
              newScores[readerIdx] = {
                ...newScores[readerIdx],
                score: Math.max(0, newScores[readerIdx].score - 1),
              };
            }

            return {
              playerScores: newScores,
              status: "playing",
            };
          }
        });

        get().drawCard();
      },

      scoreCard: () => {
        const {
          currentCard,
          currentTeamIndex,
          roundResults,
          currentReaderIndex,
          playerScores,
        } = get();
        if (!currentCard) return;

        const result: RoundResult = {
          cardId: currentCard.id,
          status: "correct",
          timestamp: Date.now(),
        };

        set((state: GameState) => {
          const newScore = state.currentRoundScore + 1;

          if (state.settings.mode === "teams") {
            const newTeams = [...state.teams];

            let currentStreak = 1;
            for (let i = roundResults.length - 1; i >= 0; i--) {
              if (roundResults[i].status === "correct") {
                currentStreak++;
              } else {
                break;
              }
            }

            if (newTeams[currentTeamIndex]) {
              const currentStats = newTeams[currentTeamIndex].statistics || {
                totalCards: 0,
                correct: 0,
                taboos: 0,
                skipped: 0,
                longestStreak: 0,
              };

              newTeams[currentTeamIndex] = {
                ...newTeams[currentTeamIndex],
                score: newTeams[currentTeamIndex].score + 1,
                statistics: {
                  totalCards: currentStats.totalCards + 1,
                  correct: currentStats.correct + 1,
                  taboos: currentStats.taboos,
                  skipped: currentStats.skipped,
                  longestStreak: Math.max(
                    currentStats.longestStreak,
                    currentStreak,
                  ),
                },
              };
            }

            return {
              currentRoundScore: newScore,
              teams: newTeams,
              roundResults: [...state.roundResults, result],
              usedCardIds: [...state.usedCardIds, currentCard.id],
            };
          } else {
            // Individual mode
            const newScores = [...playerScores];

            let currentStreak = 1;
            for (let i = roundResults.length - 1; i >= 0; i--) {
              if (roundResults[i].status === "correct") {
                currentStreak++;
              } else {
                break;
              }
            }

            const readerIdx = newScores.findIndex(
              (p) => p.playerId === state.players[currentReaderIndex]?.id,
            );
            if (readerIdx >= 0) {
              const currentStats = newScores[readerIdx].statistics;
              newScores[readerIdx] = {
                ...newScores[readerIdx],
                score: newScores[readerIdx].score + 1,
                statistics: {
                  totalCards: currentStats.totalCards + 1,
                  correct: currentStats.correct + 1,
                  taboos: currentStats.taboos,
                  skipped: currentStats.skipped,
                  longestStreak: Math.max(
                    currentStats.longestStreak,
                    currentStreak,
                  ),
                },
              };
            }

            return {
              currentRoundScore: newScore,
              playerScores: newScores,
              roundResults: [...state.roundResults, result],
              usedCardIds: [...state.usedCardIds, currentCard.id],
            };
          }
        });

        get().drawCard();
      },

      skipCard: () => {
        const {
          currentCard,
          settings,
          currentTeamIndex,
          currentReaderIndex,
          playerScores,
        } = get();
        if (!settings.allowSkips || !currentCard) return;

        const result: RoundResult = {
          cardId: currentCard.id,
          status: "skipped",
          timestamp: Date.now(),
        };

        set((state: GameState) => {
          if (state.settings.mode === "teams") {
            const newTeams = [...state.teams];

            if (newTeams[currentTeamIndex]) {
              const currentStats = newTeams[currentTeamIndex].statistics || {
                totalCards: 0,
                correct: 0,
                taboos: 0,
                skipped: 0,
                longestStreak: 0,
              };

              newTeams[currentTeamIndex] = {
                ...newTeams[currentTeamIndex],
                statistics: {
                  ...currentStats,
                  totalCards: currentStats.totalCards + 1,
                  skipped: currentStats.skipped + 1,
                },
              };
            }

            return {
              teams: newTeams,
              roundResults: [...state.roundResults, result],
              usedCardIds: [...state.usedCardIds, currentCard.id],
            };
          } else {
            // Individual mode
            const newScores = [...playerScores];
            const readerIdx = newScores.findIndex(
              (p) => p.playerId === state.players[currentReaderIndex]?.id,
            );

            if (readerIdx >= 0) {
              const currentStats = newScores[readerIdx].statistics;
              newScores[readerIdx] = {
                ...newScores[readerIdx],
                statistics: {
                  ...currentStats,
                  totalCards: currentStats.totalCards + 1,
                  skipped: currentStats.skipped + 1,
                },
              };
            }

            return {
              playerScores: newScores,
              roundResults: [...state.roundResults, result],
              usedCardIds: [...state.usedCardIds, currentCard.id],
            };
          }
        });

        get().drawCard();
      },

      nextTurn: () => {
        const {
          teams,
          players,
          currentTeamIndex,
          currentReaderIndex,
          currentRoundNumber,
          settings,
        } = get();

        if (settings.mode === "teams") {
          const nextTeamIndex = (currentTeamIndex + 1) % teams.length;

          let nextRoundNumber = currentRoundNumber;
          if (nextTeamIndex === 0) {
            nextRoundNumber++;
          }

          if (settings.rounds > 0 && nextRoundNumber > settings.rounds) {
            set({ status: "game_over" });
            return;
          }

          set({
            status: "turn_ready",
            currentTeamIndex: nextTeamIndex,
            currentRoundNumber: nextRoundNumber,
            currentRoundScore: 0,
            currentCard: null,
          });
        } else {
          // Individual mode
          const nextReaderIndex = (currentReaderIndex + 1) % players.length;

          let nextRoundNumber = currentRoundNumber;
          if (nextReaderIndex === 0) {
            nextRoundNumber++;
          }

          // Check game over by score (use current state)
          const currentScores = get().playerScores;
          const winner = currentScores.find(
            (p) => p.score >= settings.scoreToWin,
          );
          if (winner) {
            set({ status: "game_over" });
            return;
          }

          set({
            status: "turn_ready",
            currentReaderIndex: nextReaderIndex,
            currentRoundNumber: nextRoundNumber,
            currentRoundScore: 0,
            currentCard: null,
            selectedWinnerId: null,
          });
        }
      },

      restartGame: (resetTeams: boolean = false) => {
        set((state) => {
          if (state.settings.mode === "teams") {
            return {
              status: "setup",
              currentRoundNumber: 0,
              usedCardIds: [],
              currentRoundScore: 0,
              roundResults: [],
              teams: resetTeams
                ? []
                : state.teams.map((t) => ({ ...t, score: 0 })),
            };
          } else {
            return {
              status: "setup",
              currentRoundNumber: 0,
              usedCardIds: [],
              currentRoundScore: 0,
              roundResults: [],
              playerScores: resetTeams
                ? []
                : state.playerScores.map((p) => ({ ...p, score: 0 })),
            };
          }
        });
      },

      // Individual mode specific actions
      declareWinner: (playerId: string) => {
        const { currentCard, players, playerScores, currentReaderIndex } =
          get();
        if (!currentCard) return;

        const result: RoundResult = {
          cardId: currentCard.id,
          status: "correct",
          timestamp: Date.now(),
        };

        const readerPlayer = players[currentReaderIndex];
        if (!readerPlayer) return;

        set((state: GameState) => {
          const newScores = [...playerScores];

          // +1 to reader
          const readerScoreIdx = newScores.findIndex(
            (p) => p.playerId === readerPlayer.id,
          );
          if (readerScoreIdx >= 0) {
            let readerStreak = 1;
            for (let i = state.roundResults.length - 1; i >= 0; i--) {
              if (state.roundResults[i].status === "correct") {
                readerStreak++;
              } else {
                break;
              }
            }

            const readerStats = newScores[readerScoreIdx].statistics;
            newScores[readerScoreIdx] = {
              ...newScores[readerScoreIdx],
              score: newScores[readerScoreIdx].score + 1,
              statistics: {
                totalCards: readerStats.totalCards + 1,
                correct: readerStats.correct + 1,
                taboos: readerStats.taboos,
                skipped: readerStats.skipped,
                longestStreak: Math.max(
                  readerStats.longestStreak,
                  readerStreak,
                ),
              },
            };
          }

          // +1 to winner
          const winnerScoreIdx = newScores.findIndex(
            (p) => p.playerId === playerId,
          );
          if (winnerScoreIdx >= 0) {
            newScores[winnerScoreIdx] = {
              ...newScores[winnerScoreIdx],
              score: newScores[winnerScoreIdx].score + 1,
            };
          }

          return {
            playerScores: newScores,
            roundResults: [...state.roundResults, result],
            usedCardIds: [...state.usedCardIds, currentCard.id],
            status: "round_summary",
            selectedWinnerId: playerId,
          };
        });
      },

      declareTaboo: () => {
        const { currentCard, settings, allPrendas } = get();
        if (!currentCard) return;

        const result: RoundResult = {
          cardId: currentCard.id,
          status: "smashed",
          timestamp: Date.now(),
        };

        const randomPrenda =
          settings.prendasEnabled && allPrendas.length > 0
            ? allPrendas[Math.floor(Math.random() * allPrendas.length)]
            : null;

        set((state: GameState) => {
          const newScores = [...state.playerScores];
          const readerIdx = newScores.findIndex(
            (p) => p.playerId === state.players[state.currentReaderIndex]?.id,
          );

          if (readerIdx >= 0) {
            const readerStats = newScores[readerIdx].statistics;
            newScores[readerIdx] = {
              ...newScores[readerIdx],
              statistics: {
                totalCards: readerStats.totalCards + 1,
                correct: readerStats.correct,
                taboos: readerStats.taboos + 1,
                skipped: readerStats.skipped,
                longestStreak: 0,
              },
            };
          }

          return {
            playerScores: newScores,
            roundResults: [...state.roundResults, result],
            usedCardIds: [...state.usedCardIds, currentCard.id],
            status: settings.prendasEnabled ? "prenda_alert" : "playing",
            currentPrenda: randomPrenda,
          };
        });

        if (!settings.prendasEnabled) {
          get().drawCard();
        }
      },

      skipRound: () => {
        const { currentCard } = get();
        if (!currentCard) return;

        set((state: GameState) => ({
          roundResults: [...state.roundResults],
          usedCardIds: [...state.usedCardIds, currentCard.id],
          status: "round_summary",
        }));
      },
    }),
    {
      name: "nao-pode-storage",
      partialize: (state) => ({
        settings: state.settings,
        teams: state.teams,
        players: state.players,
        playerScores: state.playerScores,
        status: state.status,
        currentTeamIndex: state.currentTeamIndex,
        currentPlayerIndex: state.currentPlayerIndex,
        currentReaderIndex: state.currentReaderIndex,
        selectedWinnerId: state.selectedWinnerId,
        currentCard: state.currentCard,
        currentPrenda: state.currentPrenda,
        roundTimeRemaining: state.roundTimeRemaining,
        currentRoundScore: state.currentRoundScore,
        roundResults: state.roundResults,
        deck: state.deck,
        usedCardIds: state.usedCardIds,
        currentRoundNumber: state.currentRoundNumber,
        allCards: state.allCards,
        allPrendas: state.allPrendas,
      }),
    },
  ),
);
