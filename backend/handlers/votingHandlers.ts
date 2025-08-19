// handlers/votingHandlers.ts - All Voting-Related Events
import { Socket, Server } from 'socket.io';
import { Player } from '@shared/types';
import { gameRooms } from '../services/gameState';
import { checkDecisionVotes } from '../services/phaseManager';
import { checkAllVotesSubmitted, processFinalGuess } from '../services/votingService';

export function setupVotingHandlers(socket: Socket, io: Server): void {
  
  // NEW: Handle democratic voting for next round
  socket.on('voteNextRound', ({ roomCode }: { roomCode: string }) => {
    const room = gameRooms.get(roomCode);
    if (!room || room.gamePhase !== 'decision') {
      socket.emit('error', { message: 'Cannot vote: not in decision phase' });
      return;
    }

    const player = room.players.find((p: Player) => p.id === socket.id);
    if (!player) {
      socket.emit('error', { message: 'Player not found in room' });
      return;
    }

    // Remove from ready to vote if they were there
    room.readyToVoteVotes = room.readyToVoteVotes.filter(id => id !== socket.id);
    
    // Add to next round votes if not already there
    if (!room.nextRoundVotes.includes(socket.id)) {
      room.nextRoundVotes.push(socket.id);
    }

    console.log(`${player.name} voted for next round (${room.nextRoundVotes.length}/${room.players.length})`);
    
    // Check if decision is complete
    checkDecisionVotes(roomCode, io);
    io.to(roomCode).emit('roomUpdate', room);
  });

  // NEW: Handle democratic voting for ready to vote
  socket.on('voteReadyToVote', ({ roomCode }: { roomCode: string }) => {
    const room = gameRooms.get(roomCode);
    if (!room || room.gamePhase !== 'decision') {
      socket.emit('error', { message: 'Cannot vote: not in decision phase' });
      return;
    }

    const player = room.players.find((p: Player) => p.id === socket.id);
    if (!player) {
      socket.emit('error', { message: 'Player not found in room' });
      return;
    }

    // Remove from next round if they were there
    room.nextRoundVotes = room.nextRoundVotes.filter(id => id !== socket.id);
    
    // Add to ready to vote if not already there
    if (!room.readyToVoteVotes.includes(socket.id)) {
      room.readyToVoteVotes.push(socket.id);
    }

    console.log(`${player.name} voted to go to voting (${room.readyToVoteVotes.length}/${room.players.length})`);
    
    // Check if decision is complete
    checkDecisionVotes(roomCode, io);
    io.to(roomCode).emit('roomUpdate', room);
  });

  // Handle final voting for impostor
  socket.on('submitVote', ({ suspectedImpostorId, roomCode }: { suspectedImpostorId: string; roomCode: string }) => {
    const room = gameRooms.get(roomCode);
    if (!room || room.gameState !== 'voting') {
      socket.emit('error', { message: 'Cannot vote: not in voting phase' });
      return;
    }

    const player = room.players.find((p: Player) => p.id === socket.id);
    if (!player) {
      socket.emit('error', { message: 'Player not found in room' });
      return;
    }

    // Record the vote
    room.votes = room.votes || {};
    room.votes[socket.id] = suspectedImpostorId;

    const votedPlayer = room.players.find(p => p.id === suspectedImpostorId);
    console.log(`${player.name} voted for ${votedPlayer?.name} (${Object.keys(room.votes).length}/${room.players.length})`);

    // Check if all players have voted (early completion)
    checkAllVotesSubmitted(roomCode, io);

    // Update room state
    io.to(roomCode).emit('roomUpdate', room);
  });

  // Handle final guess from impostor
  socket.on('submitFinalGuess', ({ guess, roomCode }: { guess: string; roomCode: string }) => {
    const room = gameRooms.get(roomCode);
    
    console.log(`🔍 Final guess attempt: room=${roomCode}, guess="${guess}"`);
    console.log(`🔍 Room found: ${!!room}`);
    if (room) {
      console.log(`🔍 Room gameState: ${room.gameState}`);
      console.log(`🔍 Room players:`, room.players.map(p => `${p.name}(impostor:${p.isImpostor})`));
    }
    
    if (!room || room.gameState !== 'finalGuess') {
      console.log(`❌ Final guess rejected: room=${!!room}, gameState=${room?.gameState}`);
      socket.emit('error', { message: 'Cannot submit guess: not in final guess phase' });
      return;
    }

    const player = room.players.find((p: Player) => p.id === socket.id);
    console.log(`🔍 Player found: ${player?.name}, isImpostor: ${player?.isImpostor}`);
    
    if (!player?.isImpostor) {
      console.log(`❌ Final guess rejected: not impostor`);
      socket.emit('error', { message: 'Only the impostor can submit a final guess' });
      return;
    }

    console.log(`✅ Final guess handler called: Processing final guess from ${player.name}: "${guess}"`);
    
    // Call the proper processFinalGuess function from votingService
    processFinalGuess(roomCode, guess, socket.id, io);
  });
}
