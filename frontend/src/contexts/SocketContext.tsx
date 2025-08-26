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

// Connection states
type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'failed' | 'reconnecting';

// Enhanced SocketContextType
interface EnhancedSocketContextType extends SocketContextType {
  connectionState: ConnectionState;
  connectionError: string | null;
  retryConnection: () => void;
  cancelConnection: () => void;
}

const SocketContext = createContext<EnhancedSocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryAttempts, setRetryAttempts] = useState(0);
  
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [playerRole, setPlayerRole] = useState<RoleAssignment | null>(null);
  const [currentTimer, setCurrentTimer] = useState<TimerUpdate | null>(null);
  const [gameResults, setGameResults] = useState<GameResults | null>(null);

  const createConnection = () => {
    if (socket) {
      socket.disconnect();
    }

    setConnectionState('connecting');
    setConnectionError(null);

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://wti-q8dr.onrender.com';
    const newSocket = io(socketUrl, {
      timeout: 15000, // 15 second connection timeout for free servers
      reconnection: false, // Handle reconnection manually
    });

    // Connection successful
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setConnectionState('connected');
      setIsConnected(true);
      setConnectionError(null);
      setRetryAttempts(0);
      setSocket(newSocket);
    });

    // Connection failed
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection failed:', error);
      setConnectionState('failed');
      setIsConnected(false);
      setConnectionError(getErrorMessage(error));
      newSocket.disconnect();
    });

    // Connection timeout
    setTimeout(() => {
      if (connectionState === 'connecting') {
        console.error('Socket connection timeout');
        setConnectionState('failed');
        setIsConnected(false);
        setConnectionError('Connection timeout - server may be starting up (this can take 30-60 seconds on free hosting)');
        newSocket.disconnect();
      }
    }, 15000);

    // Disconnected unexpectedly
    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnectionState('disconnected');
      setIsConnected(false);
      setCurrentRoom(null);
      setCurrentTimer(null);
      setSocket(null);
      
      // Auto-retry for unexpected disconnections (but not manual disconnects)
      if (reason === 'io server disconnect' || reason === 'transport close') {
        if (retryAttempts < 3) {
          setTimeout(() => {
            retryConnection();
          }, 2000 * (retryAttempts + 1)); // Exponential backoff
        }
      }
    });

    // Set up all your existing event listeners
    setupGameEventListeners(newSocket);

    return newSocket;
  };

  const setupGameEventListeners = (socket: Socket) => {
    // Listen for room updates
    socket.on('roomUpdate', (room: GameRoom) => {
      console.log('Room updated:', room);
      setCurrentRoom(room);
    });

    // Listen for role assignments
    socket.on('roleAssignment', (role: RoleAssignment) => {
      console.log('Role assigned:', role);
      setPlayerRole(role);
    });

    // Listen for timer updates
    socket.on('timerUpdate', (timerData: TimerUpdate) => {
      console.log('Timer update:', timerData);
      setCurrentTimer(timerData);
    });

    // Listen for round completion
    socket.on('roundComplete', (data: RoundComplete) => {
      console.log(`Round ${data.round} complete:`, data.clues);
    });

    // Listen for voting phase
    socket.on('votingPhase', () => {
      console.log('Voting phase started!');
      setCurrentTimer(null);
    });

    // Listen for errors
    socket.on('error', (error: { message: string }) => {
      console.error('Game error:', error.message);
    });

    // Listen for voting results
    socket.on('votingResults', (results: any) => {
      console.log('Voting results:', results);
      setGameResults(results);
    });

    // Listen for final guess prompt
    socket.on('finalGuessPrompt', (data: { secretWord: string; timeLimit: number }) => {
      console.log('Final guess prompt:', data);
    });

    // Listen for game results
    socket.on('gameResults', (results: GameResults) => {
      console.log('Game results:', results);
      setGameResults(results);
      setCurrentTimer(null);
    });
  };

  const retryConnection = () => {
    setRetryAttempts(prev => prev + 1);
    setConnectionState('reconnecting');
    setTimeout(() => {
      createConnection();
    }, 1000);
  };

  const cancelConnection = () => {
    if (socket) {
      socket.disconnect();
    }
    setConnectionState('disconnected');
    setIsConnected(false);
    setConnectionError(null);
    setRetryAttempts(0);
    setCurrentRoom(null);
    setPlayerRole(null);
    setCurrentTimer(null);
    setGameResults(null);
  };

  const getErrorMessage = (error: any): string => {
    if (error.message?.includes('timeout')) {
      return 'Server is taking too long to respond. It may be starting up (can take 30-60 seconds on free hosting).';
    }
    if (error.message?.includes('ECONNREFUSED')) {
      return 'Cannot connect to server. Please try again in a moment.';
    }
    if (error.code === 'TRANSPORT_ERROR') {
      return 'Network connection issue. Check your internet and try again.';
    }
    return 'Connection failed. The server may be starting up - please try again.';
  };

  // Initialize connection on mount
  useEffect(() => {
    createConnection();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // Game action functions
  const joinRoom = (playerName: string, roomCode: string) => {
    if (socket && connectionState === 'connected') {
      socket.emit('joinRoom', { playerName, roomCode });
    }
  };

  const createRoom = (playerName: string) => {
    const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    joinRoom(playerName, roomCode);
  };

  const startGame = () => {
    if (socket && currentRoom && connectionState === 'connected') {
      socket.emit('startGame', { roomCode: currentRoom.code });
    }
  };

  const submitClue = (clue: string) => {
    if (socket && currentRoom && connectionState === 'connected') {
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

  // Democratic voting functions
  const voteNextRound = () => {
    if (socket && currentRoom && connectionState === 'connected') {
      console.log('Voting for next round');
      socket.emit('voteNextRound', { roomCode: currentRoom.code });
    }
  };

  const voteReadyToVote = () => {
    if (socket && currentRoom && connectionState === 'connected') {
      console.log('Voting to go to voting phase');
      socket.emit('voteReadyToVote', { roomCode: currentRoom.code });
    }
  };

  const submitVote = (suspectedImpostorId: string) => {
    if (socket && currentRoom && connectionState === 'connected') {
      socket.emit('submitVote', { suspectedImpostorId, roomCode: currentRoom.code });
    }
  };

  const submitFinalGuess = (guess: string) => {
    if (socket && currentRoom && connectionState === 'connected') {
      socket.emit('submitFinalGuess', { guess, roomCode: currentRoom.code });
    }
  };

  const playAgain = () => {
    if (socket && currentRoom && connectionState === 'connected') {
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
        connectionState,
        connectionError,
        retryConnection,
        cancelConnection,
        currentRoom,
        playerRole,
        currentTimer,
        gameResults,
        joinRoom,
        createRoom,
        startGame,
        submitClue,
        readyToVote, // LEGACY
        nextRound, // LEGACY
        voteNextRound,
        voteReadyToVote,
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