// services/phaseManager.ts - Game Phase Management
import { Server } from 'socket.io';
import { gameRooms, TIMER_CONFIG } from './gameState';
import { startGamePhaseTimer, clearTimer } from './timerService'; // 🔧 UPDATED: Use new timer function
import { processVotingResults } from './votingService';

// Start the decision phase after writing phase completes
export function startDecisionPhase(roomCode: string, io: Server): void {
  const room = gameRooms.get(roomCode);
  if (!room) return;

  // FIXED: Auto-submit empty clues for players who didn't submit
  room.currentRoundClues = room.currentRoundClues || {};
  room.players.forEach(player => {
    if (!room.currentRoundClues![player.id]) {
      room.currentRoundClues![player.id] = ""; // Empty clue for non-submitters
      console.log(`Auto-submitted empty clue for ${player.name}`);
    }
  });

  // Move completed clues to history
  if (room.currentRoundClues) {
    room.players.forEach(p => {
      if (room.currentRoundClues && room.currentRoundClues[p.id] !== undefined) {
        room.clues = room.clues || [];
        room.clues.push({
          playerId: p.id,
          playerName: p.name,
          clue: room.currentRoundClues[p.id] || "", // Handle empty clues
          round: room.currentRound
        });
      }
    });
  }

  // Clear current round clues and reset votes
  room.currentRoundClues = {};
  room.nextRoundVotes = [];
  room.readyToVoteVotes = [];

  // If this is round 5, skip decision phase and go straight to voting
  if (room.currentRound >= room.maxRounds) {
    startVotingPhase(roomCode, io);
    return;
  }

  // Start decision phase
  room.gamePhase = 'decision';
  
  console.log(`Starting decision phase for round ${room.currentRound} in room ${roomCode}`);
  
  // Broadcast round completion with clues
  io.to(roomCode).emit('roundComplete', {
    round: room.currentRound,
    clues: room.clues?.filter(c => c.round === room.currentRound)
  });

  // 🔧 UPDATED: Start decision phase timer (120s, no buffer needed)
  startGamePhaseTimer(roomCode, 'decision', false, () => {
    // Default action when decision timer expires: go to next round
    advanceToNextRound(roomCode, io);
  }, io);

  io.to(roomCode).emit('roomUpdate', room);
}

// Check democratic votes in decision phase
export function checkDecisionVotes(roomCode: string, io: Server): void {
  const room = gameRooms.get(roomCode);
  if (!room || room.gamePhase !== 'decision') return;

  const totalPlayers = room.players.length;
  const nextRoundVotes = room.nextRoundVotes.length;
  const readyToVoteVotes = room.readyToVoteVotes.length;
  const totalVotes = nextRoundVotes + readyToVoteVotes;

  console.log(`Decision votes in ${roomCode}: ${nextRoundVotes} next, ${readyToVoteVotes} vote, ${totalVotes}/${totalPlayers} total`);

  // FIXED: Check for majority immediately (>50% of total players)
  const majority = Math.ceil(totalPlayers / 2);
  
  if (nextRoundVotes >= majority) {
    // Majority wants next round - advance immediately
    console.log(`Majority (${nextRoundVotes}/${totalPlayers}) voted for next round - advancing immediately!`);
    clearTimer(roomCode);
    advanceToNextRound(roomCode, io);
    return;
  }
  
  if (readyToVoteVotes >= majority) {
    // Majority wants to vote - go to voting immediately
    console.log(`Majority (${readyToVoteVotes}/${totalPlayers}) voted to go to voting - starting vote immediately!`);
    clearTimer(roomCode);
    startVotingPhase(roomCode, io);
    return;
  }

  // Check if everyone has voted (fallback)
  if (totalVotes >= totalPlayers) {
    clearTimer(roomCode);
    
    if (readyToVoteVotes > nextRoundVotes) {
      console.log(`All voted: majority wants voting (${readyToVoteVotes} vs ${nextRoundVotes})`);
      startVotingPhase(roomCode, io);
    } else {
      console.log(`All voted: majority wants next round (${nextRoundVotes} vs ${readyToVoteVotes})`);
      advanceToNextRound(roomCode, io);
    }
  }
}

// Advance to next round
export function advanceToNextRound(roomCode: string, io: Server): void {
  const room = gameRooms.get(roomCode);
  if (!room) return;

  room.currentRound++;
  room.gamePhase = 'writing';
  room.nextRoundVotes = [];
  room.readyToVoteVotes = [];

  console.log(`Starting round ${room.currentRound} in room ${roomCode}`);

  // 🔧 UPDATED: Start next writing phase timer (60s, no buffer for rounds 2+)
  startGamePhaseTimer(roomCode, 'writing', false, () => {
    startDecisionPhase(roomCode, io);
  }, io);

  io.to(roomCode).emit('roomUpdate', room);
}

// Start voting phase
export function startVotingPhase(roomCode: string, io: Server): void {
  const room = gameRooms.get(roomCode);
  if (!room) return;

  room.gameState = 'voting';
  room.gamePhase = 'voting';
  room.votes = {};

  console.log(`Starting voting phase in room ${roomCode}`);

  // 🔧 UPDATED: Start voting timer (180s, no buffer needed)
  startGamePhaseTimer(roomCode, 'voting', false, () => {
    // Auto-process votes when timer expires
    processVotingResults(roomCode, io);
  }, io);

  io.to(roomCode).emit('votingPhase');
  io.to(roomCode).emit('roomUpdate', room);
}

// Check if all players have submitted clues
export function checkAllCluesSubmitted(roomCode: string, io: Server): boolean {
  const room = gameRooms.get(roomCode);
  if (!room) return false;

  const allSubmitted = room.players.every(p => 
    room.currentRoundClues && room.currentRoundClues[p.id]
  );

  if (allSubmitted) {
    console.log(`All clues submitted early in round ${room.currentRound} of room ${roomCode}`);
    clearTimer(roomCode);
    startDecisionPhase(roomCode, io);
    return true;
  }

  return false;
}