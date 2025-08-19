// handlers/roomHandlers.ts - Room Join/Leave/Management
import { Socket, Server } from 'socket.io';
import { JoinRoomData, Player } from '@shared/types';
import { gameRooms, createGameRoom, resetRoomForNewGame } from '../services/gameState';
import { clearTimer } from '../services/timerService';

export function setupRoomHandlers(socket: Socket, io: Server): void {
  
  // Handle joining a room
  socket.on('joinRoom', ({ playerName, roomCode }: JoinRoomData) => {
    console.log(`${playerName} joining room ${roomCode}`);
    
    // Join the socket room
    socket.join(roomCode);
    
    // Get or create room
    let room = gameRooms.get(roomCode);
    if (!room) {
      room = createGameRoom(roomCode);
    }
    
    // Add player if not already in room
    const existingPlayer = room.players.find((p: Player) => p.id === socket.id);
    if (!existingPlayer) {
      const newPlayer: Player = {
        id: socket.id,
        name: playerName,
        isHost: room.players.length === 0, // First player is host
        isImpostor: false,
        points: 0 // Initialize points
      };
      room.players.push(newPlayer);
      console.log(`${playerName} joined room ${roomCode} as ${newPlayer.isHost ? 'host' : 'player'}`);
    }
    
    // Send updated room state to all players in room
    io.to(roomCode).emit('roomUpdate', room);
  });

  // Handle play again
  socket.on('playAgain', ({ roomCode }: { roomCode: string }) => {
    const room = gameRooms.get(roomCode);
    if (!room) {
      socket.emit('error', { message: 'Room not found' });
      return;
    }

    const player = room.players.find((p: Player) => p.id === socket.id);
    if (!player?.isHost) {
      socket.emit('error', { message: 'Only the host can restart the game' });
      return;
    }

    // Clear all timers
    clearTimer(roomCode);

    // Reset game state but keep players and points
    resetRoomForNewGame(room);

    console.log(`Game reset in room ${roomCode} by ${player.name}`);
    
    // Update all players
    io.to(roomCode).emit('roomUpdate', room);
  });
}