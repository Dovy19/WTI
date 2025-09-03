// services/gameState.ts - Centralized Game State Management
import { GameRoom } from '@shared/types';
import { WORD_GROUPS } from '../wordBank'; // 🔧 NEW: Import word groups

// Store game rooms and timers in memory
export const gameRooms = new Map<string, GameRoom>();
export const roomTimers = new Map<string, NodeJS.Timeout>();

// Timer configuration
export const TIMER_CONFIG = {
  WRITING_PHASE: 60,    // 1 minute for clue submission
  DECISION_PHASE: 120,  // 2 minutes for review & decision
  VOTING_PHASE: 180,    // 3 minutes for final voting
  FINAL_GUESS: 30       // 30 seconds for impostor guess
} as const;

// Initialize a new game room
export function createGameRoom(roomCode: string): GameRoom {
  const room: GameRoom = {
    code: roomCode,
    players: [],
    gameState: 'waiting',
    gamePhase: 'waiting',
    currentRound: 0,
    maxRounds: 5,
    phaseTimeLeft: 0,
    nextRoundVotes: [],
    readyToVoteVotes: [],
    // 🔧 NEW: Initialize with default category (single selection)
    selectedCategories: ['tft-units'], // Default to TFT Units only
    availableGroups: WORD_GROUPS // All available category groups
  };
  
  gameRooms.set(roomCode, room);
  console.log(`Created room ${roomCode} with default categories: ${room.selectedCategories.join(', ')}`);
  return room;
}

// Get room by code
export function getRoom(roomCode: string): GameRoom | undefined {
  return gameRooms.get(roomCode);
}

// Delete room and cleanup
export function deleteRoom(roomCode: string): void {
  gameRooms.delete(roomCode);
  
  // Clear any associated timers
  if (roomTimers.has(roomCode)) {
    clearTimeout(roomTimers.get(roomCode)!);
    roomTimers.delete(roomCode);
  }
}

// Reset room for new game
export function resetRoomForNewGame(room: GameRoom): void {
  room.gameState = 'waiting';
  room.gamePhase = 'waiting';
  room.currentRound = 0;
  room.secretWord = undefined;
  room.category = undefined;
  room.clues = [];
  room.votes = {};
  room.readyToVote = [];
  room.currentRoundClues = {};
  room.nextRoundVotes = [];
  room.readyToVoteVotes = [];
  room.phaseTimeLeft = 0;
  
  // 🔧 NOTE: selectedCategories and availableGroups are preserved across games
  // This allows players to keep playing with their chosen categories
  
  // Reset player impostor status but KEEP points for persistence
  room.players.forEach(p => {
    p.isImpostor = false;
    // NOTE: p.points is preserved - this creates session-long competition!
  });
}