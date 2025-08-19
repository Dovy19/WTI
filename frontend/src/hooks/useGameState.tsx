// src/hooks/useGameState.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';

export function useGameState() {
  const { currentRoom, socket, playerRole, currentTimer, gameResults } = useSocket();
  
  // Local UI state (what player has done this round)
  const [hasSubmittedClue, setHasSubmittedClue] = useState(false);

  // Reset local state when round changes or game resets
  useEffect(() => {
    setHasSubmittedClue(false);
  }, [currentRoom?.currentRound, currentRoom?.gameState]);

  // Reset when game starts fresh
  useEffect(() => {
    if (currentRoom?.gameState === 'waiting') {
      setHasSubmittedClue(false);
    }
  }, [currentRoom?.gameState]);

  // Get current player info
  const currentPlayer = currentRoom?.players.find(p => p.id === socket?.id);
  const isHost = currentPlayer?.isHost || false;

  // REMOVED: Old timer logic (now handled by backend + SocketContext)
  // REMOVED: readyToVote state management (now democratic voting)
  // REMOVED: gameResults management (now in SocketContext)

  // Helper: Check if player has submitted clue this round
  const playerSubmittedThisRound = currentRoom?.currentRoundClues?.[socket?.id || ''] !== undefined;
  
  // Update local state based on backend state
  useEffect(() => {
    if (playerSubmittedThisRound) {
      setHasSubmittedClue(true);
    }
  }, [playerSubmittedThisRound]);

  // Game state helpers
  const totalPlayers = currentRoom?.players.length || 0;
  const submittedCluesCount = Object.keys(currentRoom?.currentRoundClues || {}).length;
  const nextRoundVotes = currentRoom?.nextRoundVotes?.length || 0;
  const readyToVoteVotes = currentRoom?.readyToVoteVotes?.length || 0;

  // Phase information from timer
  const currentPhase = currentTimer?.phase || currentRoom?.gamePhase || 'waiting';
  const timeLeft = currentTimer?.timeLeft || 0;

  return {
    // Core game data (from SocketContext)
    currentRoom,
    playerRole,
    currentPlayer,
    isHost,
    
    // Timer data (from SocketContext)
    currentTimer,
    currentPhase,
    timeLeft,
    
    // Game results (from SocketContext) 
    gameResults,
    
    // Local UI state
    hasSubmittedClue,
    setHasSubmittedClue,
    
    // Calculated helpers
    totalPlayers,
    submittedCluesCount,
    nextRoundVotes,
    readyToVoteVotes,
    
    // Status helpers
    isInWritingPhase: currentPhase === 'writing',
    isInDecisionPhase: currentPhase === 'decision',
    isInVotingPhase: currentPhase === 'voting',
    allCluesSubmitted: submittedCluesCount >= totalPlayers,
    
    // Democratic voting status
    playerVotedNextRound: currentRoom?.nextRoundVotes?.includes(socket?.id || '') || false,
    playerVotedToVote: currentRoom?.readyToVoteVotes?.includes(socket?.id || '') || false,
  };
}