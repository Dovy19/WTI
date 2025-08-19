// services/timerService.ts - Timer Management Service
import { Server } from 'socket.io';
import { gameRooms, roomTimers } from './gameState';

// Start a timer for a room
export function startTimer(
  roomCode: string, 
  duration: number, 
  onComplete: () => void,
  io: Server
): void {
  // Clear existing timer
  clearTimer(roomCode);
  
  const room = gameRooms.get(roomCode);
  if (!room) return;

  // Set initial time
  room.phaseTimeLeft = duration;

  // Send initial timer update
  io.to(roomCode).emit('timerUpdate', { 
    timeLeft: duration, 
    phase: room.gamePhase 
  });

  // FIXED: Use only ONE timer that handles both countdown and completion
  const timer = setInterval(() => {
    const currentRoom = gameRooms.get(roomCode);
    if (!currentRoom) {
      clearInterval(timer);
      return;
    }

    // Decrement timer
    currentRoom.phaseTimeLeft--;
    
    // Send update
    io.to(roomCode).emit('timerUpdate', { 
      timeLeft: currentRoom.phaseTimeLeft, 
      phase: currentRoom.gamePhase 
    });
    
    // Check if time is up
    if (currentRoom.phaseTimeLeft <= 0) {
      clearInterval(timer);
      roomTimers.delete(roomCode);
      onComplete(); // Execute completion callback
    }
  }, 1000);
  
  roomTimers.set(roomCode, timer);
}

// 🆕 NEW: Enhanced timer start with GameStart buffer
export function startTimerWithBuffer(
  roomCode: string, 
  baseDuration: number, 
  phaseType: 'writing' | 'decision' | 'voting',
  isFirstRound: boolean = false,
  onComplete: () => void,
  io: Server
): void {
  
  // Add 16-second buffer ONLY for first writing phase (GameStart transitions)
  const needsBuffer = phaseType === 'writing' && isFirstRound;
  const duration = needsBuffer ? baseDuration + 16 : baseDuration;
  
  console.log(`🕒 Starting timer for ${phaseType} phase: ${duration}s (base: ${baseDuration}s, buffer: ${needsBuffer ? 16 : 0}s, round 1: ${isFirstRound})`);
  
  // Use existing startTimer function with buffered duration
  startTimer(roomCode, duration, onComplete, io);
}

// 🆕 NEW: Convenience function for standard game timers
export function startGamePhaseTimer(
  roomCode: string,
  phaseType: 'writing' | 'decision' | 'voting',
  isFirstRound: boolean = false,
  onComplete: () => void,
  io: Server
): void {
  
  // Standard durations for each phase
  const standardDurations = {
    writing: 60,    // Base 60s + 16s buffer ONLY for round 1
    decision: 120,  // 120s (no buffer needed)
    voting: 180     // 180s (no buffer needed)
  };
  
  const baseDuration = standardDurations[phaseType];
  startTimerWithBuffer(roomCode, baseDuration, phaseType, isFirstRound, onComplete, io);
}

// Clear timer for a room
export function clearTimer(roomCode: string): void {
  if (roomTimers.has(roomCode)) {
    clearTimeout(roomTimers.get(roomCode)!);
    roomTimers.delete(roomCode);
  }
}

// Check if room has active timer
export function hasActiveTimer(roomCode: string): boolean {
  return roomTimers.has(roomCode);
}

// 🆕 NEW: Get remaining time for a room
export function getRemainingTime(roomCode: string): number {
  const room = gameRooms.get(roomCode);
  return room?.phaseTimeLeft || 0;
}

// 🆕 NEW: Emergency stop timer (for debugging)
export function emergencyStopTimer(roomCode: string, io: Server): void {
  clearTimer(roomCode);
  const room = gameRooms.get(roomCode);
  if (room) {
    room.phaseTimeLeft = 0;
    io.to(roomCode).emit('timerUpdate', { 
      timeLeft: 0, 
      phase: room.gamePhase 
    });
  }
  console.log(`⚠️ Emergency timer stop for room ${roomCode}`);
}