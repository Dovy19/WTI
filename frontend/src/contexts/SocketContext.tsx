// src/contexts/SocketContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { 
  Player, 
  GameRoom, 
  RoleAssignment, 
  SocketContextType, 
  TimerUpdate, 
  RoundComplete,
  GameResults 
} from '../../../shared/types';

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [playerRole, setPlayerRole] = useState<RoleAssignment | null>(null);
  
  // NEW: Timer and game state
  const [currentTimer, setCurrentTimer] = useState<TimerUpdate | null>(null);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);

  useEffect(() => {
    // Connect to backend
    const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'https://wti-q8dr.onrender.com');
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
      setIsConnected(false);
      setCurrentRoom(null);
      setCurrentTimer(null);
    });

    // Listen for room updates
    newSocket.on('roomUpdate', (room: GameRoom) => {
      console.log('Room updated:', room);
      setCurrentRoom(room);
    });

    // Listen for role assignments
    newSocket.on('roleAssignment', (role: RoleAssignment) => {
      console.log('Role assigned:', role);
      setPlayerRole(role);
    });

    // NEW: Listen for timer updates
    newSocket.on('timerUpdate', (timerData: TimerUpdate) => {
      console.log('Timer update:', timerData);
      setCurrentTimer(timerData);
    });

    // NEW: Listen for round completion
    newSocket.on('roundComplete', (data: RoundComplete) => {
      console.log(`Round ${data.round} complete:`, data.clues);
      // You can add additional UI feedback here if needed
    });

    // Listen for voting phase
    newSocket.on('votingPhase', () => {
      console.log('Voting phase started!');
      setCurrentTimer(null); // Clear decision timer
    });

    // Listen for errors
    newSocket.on('error', (error: { message: string }) => {
      console.error('Game error:', error.message);
      // You can add toast notifications here
    });

    // Listen for voting results
    newSocket.on('votingResults', (results: any) => {
      console.log('Voting results:', results);
      setGameResults(results);
    });

    // Listen for final guess prompt
    newSocket.on('finalGuessPrompt', (data: { secretWord: string; timeLimit: number }) => {
      console.log('Final guess prompt:', data);
      // Timer will be handled by ResultsScreen component
    });

    // Listen for game results
    newSocket.on('gameResults', (results: GameResults) => {
      console.log('Game results:', results);
      setGameResults(results);
      setCurrentTimer(null); // Clear any active timers
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, []);

  const joinRoom = (playerName: string, roomCode: string) => {
    if (socket) {
      socket.emit('joinRoom', { playerName, roomCode });
    }
  };

  const createRoom = (playerName: string) => {
    // Generate a random room code
    const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    joinRoom(playerName, roomCode);
  };

  const startGame = () => {
    if (socket && currentRoom) {
      socket.emit('startGame', { roomCode: currentRoom.code });
    }
  };

  const submitClue = (clue: string) => {
    if (socket && currentRoom) {
      socket.emit('submitClue', { clue, roomCode: currentRoom.code });
    }
  };

  // LEGACY: Keep for backward compatibility
  const readyToVote = () => {
    console.log('Legacy readyToVote called - use voteReadyToVote instead');
    voteReadyToVote();
  };

  const nextRound = () => {
    console.log('Legacy nextRound called - use voteNextRound instead');
    voteNextRound();
  };

  // NEW: Democratic voting functions
  const voteNextRound = () => {
    if (socket && currentRoom) {
      console.log('Voting for next round');
      socket.emit('voteNextRound', { roomCode: currentRoom.code });
    }
  };

  const voteReadyToVote = () => {
    if (socket && currentRoom) {
      console.log('Voting to go to voting phase');
      socket.emit('voteReadyToVote', { roomCode: currentRoom.code });
    }
  };

  const submitVote = (suspectedImpostorId: string) => {
    if (socket && currentRoom) {
      socket.emit('submitVote', { suspectedImpostorId, roomCode: currentRoom.code });
    }
  };

  const submitFinalGuess = (guess: string) => {
    if (socket && currentRoom) {
      socket.emit('submitFinalGuess', { guess, roomCode: currentRoom.code });
    }
  };

  const playAgain = () => {
    if (socket && currentRoom) {
      socket.emit('playAgain', { roomCode: currentRoom.code });
      // Reset local state
      setPlayerRole(null);
      setGameResults(null);
      setCurrentTimer(null);
    }
  };

  const leaveRoom = () => {
    if (socket && currentRoom) {
      socket.disconnect();
      setCurrentRoom(null);
      setPlayerRole(null);
      setGameResults(null);
      setCurrentTimer(null);
      // Reconnect for future use
      socket.connect();
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        currentRoom,
        playerRole,
        currentTimer, // NEW: Expose timer data
        gameResults, // NEW: Expose game results
        joinRoom,
        createRoom,
        startGame,
        submitClue,
        readyToVote, // LEGACY
        nextRound, // LEGACY
        voteNextRound, // NEW
        voteReadyToVote, // NEW
        submitVote,
        submitFinalGuess,
        playAgain,
        leaveRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}