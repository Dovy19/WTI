// shared/types.ts
export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  isImpostor: boolean;
  points?: number; // NEW: For persistent points across games
}

export interface GameRoom {
  code: string;
  players: Player[];
  gameState: 'waiting' | 'playing' | 'voting' | 'finished' | 'finalGuess';
  gamePhase: 'waiting' | 'writing' | 'decision' | 'voting'; // NEW: Detailed phase tracking
  currentRound: number;
  maxRounds: number;
  phaseTimeLeft: number; // NEW: Timer countdown in seconds
  secretWord?: string;
  category?: string;
  clues?: { playerId: string; playerName: string; clue: string; round: number }[];
  votes?: { [playerId: string]: string };
  readyToVote?: string[]; // LEGACY: Keep for backward compatibility
  currentRoundClues?: { [playerId: string]: string };
  nextRoundVotes: string[]; // NEW: Players who voted for next round
  readyToVoteVotes: string[]; // NEW: Players who voted to go to voting
}

export interface JoinRoomData {
  playerName: string;
  roomCode: string;
}

export interface SubmitClueData {
  clue: string;
  roomCode: string;
}

export interface VoteData {
  suspectedImpostorId: string;
}

export interface RoleAssignment {
  isImpostor: boolean;
  category?: string;
  word?: string;
}

// NEW: Timer update event data
export interface TimerUpdate {
  timeLeft: number;
  phase: 'waiting' | 'writing' | 'decision' | 'voting';
}

// NEW: Round completion event data
export interface RoundComplete {
  round: number;
  clues: { playerId: string; playerName: string; clue: string; round: number }[];
}

// NEW: Game results interface (standardized)
export interface GameResults {
  voteCounts: { [playerId: string]: number }; // Required - always provided
  voterNames: { [playerId: string]: string[] }; // Required - always provided
  mostVotedPlayer?: {
    id?: string;
    name?: string;
    isImpostor?: boolean;
  };
  impostor?: {
    id?: string;
    name?: string;
  };
  impostorCaught: boolean; // Required - always boolean
  secretWord: string; // Required - always string
  category: string; // Required - always string
  impostorGuess?: string;
  correctGuess?: boolean;
  gameEnded: boolean;
  winners: 'impostor' | 'detectives' | 'tie';
  points: {
    impostorPoints: number;
    detectivePoints: number;
  };
}

// NEW: Democratic voting event data
export interface DemocraticVoteData {
  roomCode: string;
  voteType: 'nextRound' | 'readyToVote';
}

export interface SocketContextType {
  socket: any | null;
  isConnected: boolean;
  currentRoom: GameRoom | null;
  playerRole: RoleAssignment | null;
  currentTimer: TimerUpdate | null; // NEW: Current timer state
  gameResults: GameResults | null; // NEW: Game results
  joinRoom: (playerName: string, roomCode: string) => void;
  createRoom: (playerName: string) => void;
  startGame: () => void;
  submitClue: (clue: string) => void;
  readyToVote: () => void; // LEGACY: Keep for backward compatibility
  nextRound: () => void; // LEGACY: Keep for backward compatibility  
  voteNextRound: () => void; // NEW: Democratic voting for next round
  voteReadyToVote: () => void; // NEW: Democratic voting to go to voting
  submitVote: (suspectedImpostorId: string) => void;
  submitFinalGuess: (guess: string) => void;
  playAgain: () => void;
  leaveRoom: () => void;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'failed' | 'reconnecting';
  connectionError: string | null;
  retryConnection: () => void;
  cancelConnection: () => void;
}

// NEW: Timer configuration constants (can be imported by both frontend/backend)
export const TIMER_CONFIG = {
  WRITING_PHASE: 60, // 1 minute
  DECISION_PHASE: 120, // 2 minutes  
  VOTING_PHASE: 180, // 3 minutes
  FINAL_GUESS: 30 // 30 seconds
} as const;

// NEW: Phase display names for UI
export const PHASE_LABELS = {
  waiting: 'Waiting for Players',
  writing: 'Submit Your Clue',
  decision: 'Review & Decide',
  voting: 'Vote for Impostor'
} as const;