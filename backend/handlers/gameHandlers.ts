// handlers/gameHandlers.ts - Game Start & Clue Submission
import { Socket, Server } from 'socket.io';
import { SubmitClueData, Player } from '@shared/types';
import { gameRooms, TIMER_CONFIG } from '../services/gameState';
import { startGamePhaseTimer } from '../services/timerService'; // 🔧 UPDATED: Use new timer function
import { startDecisionPhase, checkAllCluesSubmitted } from '../services/phaseManager';
import { getRandomWord } from '../wordBank';

export function setupGameHandlers(socket: Socket, io: Server): void {
  
  // Handle starting the game
  socket.on('startGame', ({ roomCode }: { roomCode: string }) => {
    const room = gameRooms.get(roomCode);
    if (!room || room.players.length < 3) {
      socket.emit('error', { message: 'Cannot start game: not enough players' });
      return;
    }

    // Check if the player starting is the host
    const player = room.players.find((p: Player) => p.id === socket.id);
    if (!player?.isHost) {
      socket.emit('error', { message: 'Only the host can start the game' });
      return;
    }

    // Randomly assign impostor
    const randomIndex = Math.floor(Math.random() * room.players.length);
    room.players.forEach((p: Player, index: number) => {
      p.isImpostor = index === randomIndex;
    });

    // Get random word and category
    const wordPair = getRandomWord(room.selectedCategories);
    room.secretWord = wordPair.word;
    room.category = wordPair.category;
    
    // Initialize game state with phases
    room.gameState = 'playing';
    room.gamePhase = 'writing'; // Start with writing phase
    room.currentRound = 1;
    room.clues = [];
    room.readyToVote = [];
    room.currentRoundClues = {};
    room.nextRoundVotes = [];
    room.readyToVoteVotes = [];

    console.log(`Game started in room ${roomCode}. Word: ${wordPair.word}, Impostor: ${room.players[randomIndex].name}`);

    // Send role assignments to each player
    room.players.forEach((player: Player) => {
      if (player.isImpostor) {
        io.to(player.id).emit('roleAssignment', {
          isImpostor: true,
          category: room.category,
          word: null
        });
      } else {
        io.to(player.id).emit('roleAssignment', {
          isImpostor: false,
          category: null,
          word: room.secretWord
        });
      }
    });

    // 🔧 UPDATED: Start writing phase timer with GameStart buffer ONLY for round 1
    startGamePhaseTimer(roomCode, 'writing', true, () => {
      // Auto-advance to decision phase when timer expires
      startDecisionPhase(roomCode, io);
    }, io);

    // Update all players with new room state
    io.to(roomCode).emit('roomUpdate', room);
  });

  // Handle clue submission
  socket.on('submitClue', ({ clue, roomCode }: SubmitClueData) => {
    const room = gameRooms.get(roomCode);
    if (!room || room.gameState !== 'playing' || room.gamePhase !== 'writing') {
      socket.emit('error', { message: 'Cannot submit clue: not in writing phase' });
      return;
    }

    const player = room.players.find((p: Player) => p.id === socket.id);
    if (!player) {
      socket.emit('error', { message: 'Player not found in room' });
      return;
    }

    // Add clue to current round
    room.currentRoundClues = room.currentRoundClues || {};
    room.currentRoundClues[socket.id] = clue;

    console.log(`${player.name} submitted clue: "${clue}" in round ${room.currentRound}`);

    // Check if all players have submitted clues (early advance)
    checkAllCluesSubmitted(roomCode, io);

    // Update room state
    io.to(roomCode).emit('roomUpdate', room);
  });

}