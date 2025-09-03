// src/contexts/SocketContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
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
  updateCategorySelection: (categoryIds: string[]) => void;
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

  // 🚀 PERFORMANCE: Memoize currentRoom to prevent unnecessary re-renders
  const memoizedRoom = useMemo(() => currentRoom, [
    currentRoom?.gameState,
    currentRoom?.gamePhase, 
    currentRoom?.players?.length,
    currentRoom?.selectedCategories,
    currentRoom?.currentRound,
    currentRoom?.phaseTimeLeft,
    JSON.stringify(currentRoom?.votes), // For voting changes
    JSON.stringify(currentRoom?.currentRoundClues), // For clue submissions
  ]);

  // 🚀 PERFORMANCE: Memoize timer to prevent frequent updates
  const memoizedTimer = useMemo(() => currentTimer, [
    currentTimer?.timeLeft,
    currentTimer?.phase
  ]);

  const createConnection = () => {
    if (socket) {
      socket.disconnect();
    }

    setConnectionState('connecting');
    setConnectionError(null);

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'https://wti-q8dr.onrender.com';
    const newSocket = io(socketUrl, {
      timeout: 15000,
      reconnection: false,
    });

    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
      setConnectionState('connected');
      setIsConnected(true);
      setConnectionError(null);
      setRetryAttempts(0);
      setSocket(newSocket);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection failed:', error);
      setConnectionState('failed');
      setIsConnected(false);
      setConnectionError(getErrorMessage(error));
      newSocket.disconnect();
    });

    setTimeout(() => {
      if (connectionState === 'connecting') {
        console.error('Socket connection timeout');
        setConnectionState('failed');
        setIsConnected(false);
        setConnectionError('Connection timeout - server may be starting up (this can take 30-60 seconds on free hosting)');
        newSocket.disconnect();
      }
    }, 15000);

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setConnectionState('disconnected');
      setIsConnected(false);
      setCurrentRoom(null);
      setCurrentTimer(null);
      setSocket(null);
      
      if (reason === 'io server disconnect' || reason === 'transport close') {
        if (retryAttempts < 3) {
          setTimeout(() => {
            retryConnection();
          }, 2000 * (retryAttempts + 1));
        }
      }
    });

    setupGameEventListeners(newSocket);
    return newSocket;
  };

  const setupGameEventListeners = (socket: Socket) => {
    socket.on('roomUpdate', (room: GameRoom) => {
      console.log('Room updated:', room);
      setCurrentRoom(room);
    });

    socket.on('roleAssignment', (role: RoleAssignment) => {
      console.log('Role assigned:', role);
      setPlayerRole(role);
    });

    socket.on('timerUpdate', (timerData: TimerUpdate) => {
      console.log('Timer update:', timerData);
      setCurrentTimer(timerData);
    });

    socket.on('roundComplete', (data: RoundComplete) => {
      console.log(`Round ${data.round} complete:`, data.clues);
    });

    socket.on('votingPhase', () => {
      console.log('Voting phase started!');
      setCurrentTimer(null);
    });

    socket.on('error', (error: { message: string }) => {
      console.error('Game error:', error.message);
    });

    socket.on('votingResults', (results: any) => {
      console.log('Voting results:', results);
      setGameResults(results);
    });

    socket.on('finalGuessPrompt', (data: { secretWord: string; timeLimit: number }) => {
      console.log('Final guess prompt:', data);
    });

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

  useEffect(() => {
    createConnection();
    
    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  // 🚀 PERFORMANCE: Memoize all socket functions to prevent re-creation
  const joinRoom = useCallback((playerName: string, roomCode: string) => {
    if (socket && connectionState === 'connected') {
      socket.emit('joinRoom', { playerName, roomCode });
    }
  }, [socket, connectionState]);

  const createRoom = useCallback((playerName: string) => {
    const roomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    joinRoom(playerName, roomCode);
  }, [joinRoom]);

  const startGame = useCallback(() => {
    if (socket && currentRoom && connectionState === 'connected') {
      socket.emit('startGame', { roomCode: currentRoom.code });
    }
  }, [socket, currentRoom, connectionState]);

  const submitClue = useCallback((clue: string) => {
    if (socket && currentRoom && connectionState === 'connected') {
      socket.emit('submitClue', { clue, roomCode: currentRoom.code });
    }
  }, [socket, currentRoom, connectionState]);

  const voteNextRound = useCallback(() => {
    if (socket && currentRoom && connectionState === 'connected') {
      console.log('Voting for next round');
      socket.emit('voteNextRound', { roomCode: currentRoom.code });
    }
  }, [socket, currentRoom, connectionState]);

  const voteReadyToVote = useCallback(() => {
    if (socket && currentRoom && connectionState === 'connected') {
      console.log('Voting to go to voting phase');
      socket.emit('voteReadyToVote', { roomCode: currentRoom.code });
    }
  }, [socket, currentRoom, connectionState]);

  const submitVote = useCallback((suspectedImpostorId: string) => {
    if (socket && currentRoom && connectionState === 'connected') {
      socket.emit('submitVote', { suspectedImpostorId, roomCode: currentRoom.code });
    }
  }, [socket, currentRoom, connectionState]);

  const submitFinalGuess = useCallback((guess: string) => {
    if (socket && currentRoom && connectionState === 'connected') {
      socket.emit('submitFinalGuess', { guess, roomCode: currentRoom.code });
    }
  }, [socket, currentRoom, connectionState]);

  const playAgain = useCallback(() => {
    if (socket && currentRoom && connectionState === 'connected') {
      socket.emit('playAgain', { roomCode: currentRoom.code });
      setPlayerRole(null);
      setGameResults(null);
      setCurrentTimer(null);
    }
  }, [socket, currentRoom, connectionState]);

  const leaveRoom = useCallback(() => {
    if (socket && currentRoom) {
      socket.disconnect();
      setCurrentRoom(null);
      setPlayerRole(null);
      setGameResults(null);
      setCurrentTimer(null);
      socket.connect();
    }
  }, [socket, currentRoom]);

  const updateCategorySelection = useCallback((categoryIds: string[]) => {
    if (socket && currentRoom && connectionState === 'connected') {
      console.log('Updating category selection:', categoryIds);
      socket.emit('updateCategorySelection', { roomCode: currentRoom.code, categoryIds });
    }
  }, [socket, currentRoom, connectionState]);

  // LEGACY functions
  const readyToVote = useCallback(() => {
    console.log('Legacy readyToVote called - use voteReadyToVote instead');
    voteReadyToVote();
  }, [voteReadyToVote]);

  const nextRound = useCallback(() => {
    console.log('Legacy nextRound called - use voteNextRound instead');
    voteNextRound();
  }, [voteNextRound]);

  // 🚀 PERFORMANCE: Memoize the context value to prevent provider re-renders
  const contextValue = useMemo(() => ({
    socket,
    isConnected,
    connectionState,
    connectionError,
    retryConnection,
    cancelConnection,
    currentRoom: memoizedRoom, // Use memoized room
    playerRole,
    currentTimer: memoizedTimer, // Use memoized timer
    gameResults,
    joinRoom,
    createRoom,
    startGame,
    submitClue,
    readyToVote,
    nextRound,
    voteNextRound,
    voteReadyToVote,
    submitVote,
    submitFinalGuess,
    playAgain,
    leaveRoom,
    updateCategorySelection,
  }), [
    socket,
    isConnected,
    connectionState,
    connectionError,
    retryConnection,
    cancelConnection,
    memoizedRoom, // Memoized dependencies
    playerRole,
    memoizedTimer,
    gameResults,
    joinRoom,
    createRoom,
    startGame,
    submitClue,
    readyToVote,
    nextRound,
    voteNextRound,
    voteReadyToVote,
    submitVote,
    submitFinalGuess,
    playAgain,
    leaveRoom,
    updateCategorySelection,
  ]);

  return (
    <SocketContext.Provider value={contextValue}>
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