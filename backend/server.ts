// server.ts - Main Server Setup (Clean & Focused)
import { Server } from 'socket.io';
import { createServer } from 'http';
import { gameRooms, roomTimers } from './services/gameState';
import { setupGameHandlers } from './handlers/gameHandlers';
import { setupRoomHandlers } from './handlers/roomHandlers';
import { setupVotingHandlers } from './handlers/votingHandlers';

const PORT = process.env.PORT || 3001;

// Create HTTP server
const httpServer = createServer();

// Create Socket.IO server with CORS
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Socket connection handling
io.on('connection', (socket) => {
  console.log(`Player connected: ${socket.id}`);

  // Setup all event handlers
  setupRoomHandlers(socket, io);
  setupGameHandlers(socket, io);
  setupVotingHandlers(socket, io);

  // Handle disconnect
  socket.on('disconnect', () => {
    console.log(`Player disconnected: ${socket.id}`);
    handlePlayerDisconnect(socket.id, io);
  });
});

// Player disconnect cleanup
function handlePlayerDisconnect(socketId: string, io: Server) {
  const { clearTimer } = require('./services/timerService');
  
  for (const [roomCode, room] of gameRooms.entries()) {
    const playerIndex = room.players.findIndex(p => p.id === socketId);
    if (playerIndex !== -1) {
      room.players.splice(playerIndex, 1);
      
      if (room.players.length === 0) {
        clearTimer(roomCode);
        gameRooms.delete(roomCode);
      } else {
        // Reassign host if needed
        if (!room.players.some(p => p.isHost) && room.players.length > 0) {
          room.players[0].isHost = true;
        }
        io.to(roomCode).emit('roomUpdate', room);
      }
      break;
    }
  }
}

// Start server
httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log(`📡 Accepting connections from: ${process.env.FRONTEND_URL || "http://localhost:3000"}`);
});