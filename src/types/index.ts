export type Player = {
  id: string;
  name: string;
  teamId?: string; // Optional if playing individual mode
  avatar?: string;
};

export type Team = {
  id: string;
  name: string;
  score: number;
  color: string;
  players: string[]; // Player IDs
};

export type Card = {
  id: string;
  word: string; // The target word
  forbiddenWords: string[]; // List of 5 forbidden words
  category?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
};

export type Prenda = {
  id: string;
  description: string;
  type: 'individual' | 'group';
  intensity: 'fun' | 'hard';
};

export type GameMode = 'teams' | 'individual';

export type GameSettings = {
  mode: GameMode;
  rounds: number; // For time-based game, or max score
  scoreToWin: number; // 0 if playing by rounds
  timePerRound: number; // in seconds
  cardsPerRound: number | null; // null represents "Unlimited" (time based only)
  prendasEnabled: boolean;
  allowSkips: boolean;
};

export type GameStatus = 'setup' | 'turn_ready' | 'playing' | 'paused' | 'prenda_alert' | 'round_summary' | 'game_over';

export type RoundResult = {
  cardId: string;
  status: 'correct' | 'smashed' | 'skipped' | 'prenda'; // smashed = taboo word spoken
  timestamp: number;
};
