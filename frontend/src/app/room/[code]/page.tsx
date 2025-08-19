// src/app/room/[code]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSocket } from '@/contexts/SocketContext';
import { useGameState } from '@/hooks/useGameState';

// Components
import GameHeader from '@/components/layout/GameHeader';
import PlayerList from '@/components/ui/PlayerList';
import GameLobby from '@/components/game/GameLobby';
import RoleDisplay from '@/components/game/RoleDisplay';
import ClueSubmission from '@/components/game/ClueSubmission';
import VotingInterface from '@/components/game/VotingInterface';
import ResultsScreen from '@/components/game/ResultsScreen';
import GameStartSequence from '@/components/game/GameStartSequence';
import GeneralTransitions from '@/components/game/GeneralTransitions';

export default function RoomPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  
  // GameStart transition state
  const [showGameStart, setShowGameStart] = useState(false);
  const [gameStartTriggered, setGameStartTriggered] = useState(false);
  
  // Vote transition state
  const [showVoteTransition, setShowVoteTransition] = useState(false);
  const [voteTransitionTriggered, setVoteTransitionTriggered] = useState<string | null>(null);
  
  // Socket actions
  const { 
    isConnected, 
    leaveRoom, 
    startGame, 
    submitClue, 
    currentRoom
  } = useSocket();

  // Game state
  const {
    playerRole,
    isHost,
    hasSubmittedClue,
    setHasSubmittedClue,
    gameResults,
    totalPlayers
  } = useGameState();

  // Trigger GameStart transitions when game begins
  useEffect(() => {
    if (currentRoom?.gameState === 'playing' && playerRole && !gameStartTriggered) {
      setShowGameStart(true);
      setGameStartTriggered(true);
    }
  }, [currentRoom?.gameState, playerRole, gameStartTriggered]);

  // Reset GameStart state when game ends or restarts
  useEffect(() => {
    if (currentRoom?.gameState === 'waiting' || currentRoom?.gameState === 'finished') {
      setShowGameStart(false);
      setGameStartTriggered(false);
      setShowVoteTransition(false);
      setVoteTransitionTriggered(null);
    }
  }, [currentRoom?.gameState]);

  // Detect "Ready to Vote" transition at room level
  useEffect(() => {
    if (!currentRoom) return;
    
    const transitionKey = `room-vote-${currentRoom.currentRound}`;
    
    // Trigger when we detect voting phase has started
    const shouldTrigger = currentRoom.gamePhase === 'voting' && 
                         currentRoom.gameState === 'voting' && 
                         voteTransitionTriggered !== transitionKey;
    
    if (shouldTrigger) {
      setShowVoteTransition(true);
      setVoteTransitionTriggered(transitionKey);
    }
  }, [currentRoom?.gamePhase, currentRoom?.gameState, currentRoom?.currentRound, voteTransitionTriggered]);

  // Handle vote transition completion
  const handleVoteTransitionComplete = () => {
    setShowVoteTransition(false);
  };

  // Event handlers
  const handleLeaveRoom = () => {
    leaveRoom();
    router.push('/');
  };

  const handleCopyCode = async () => {
    if (currentRoom) {
      await navigator.clipboard.writeText(currentRoom.code);
    }
  };

  const handleSubmitClue = (clue: string) => {
    submitClue(clue);
    setHasSubmittedClue(true);
  };

  // Handle GameStart completion
  const handleGameStartComplete = () => {
    setShowGameStart(false);
  };

  // Loading state
  if (!currentRoom) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-white/20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Connecting to room...
            </h2>
            <p className="text-white/60">
              Room code: {code}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show vote transition if active
  if (showVoteTransition) {
    return (
      <div className="max-w-6xl mx-auto">
        <GameHeader
          roomCode={currentRoom.code}
          isConnected={isConnected}
          onLeaveRoom={handleLeaveRoom}
          onCopyCode={handleCopyCode}
        />

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-1">
            <PlayerList players={currentRoom.players} />
          </div>

          <div className="lg:col-span-4">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20 h-full">
              <GeneralTransitions
                transitionType="ready-to-vote"
                currentRound={currentRoom.currentRound}
                nextRound={currentRoom.currentRound + 1}
                maxRounds={currentRoom.maxRounds}
                onComplete={handleVoteTransitionComplete}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render game content based on state
  const renderGameContent = () => {
    switch (currentRoom.gameState) {
      case 'waiting':
        return (
          <GameLobby
            roomCode={currentRoom.code}
            playerCount={currentRoom.players.length}
            isHost={isHost}
            onStartGame={startGame}
          />
        );

      case 'playing':
        // Show loading until GameStart system is ready
        if (!playerRole || !gameStartTriggered) {
          return (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Starting Game...
                </h2>
                <p className="text-white/60">
                  Assigning roles and preparing everything
                </p>
                <div className="mt-4 flex justify-center space-x-1">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"
                      style={{ animationDelay: `${i * 0.2}s` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        }

        // Show GameStart sequence
        if (showGameStart) {
          return (
            <GameStartSequence
              playerRole={playerRole}
              onComplete={handleGameStartComplete}
            />
          );
        }

        // Show normal game UI
        return (
          <div>
            <RoleDisplay
              isImpostor={playerRole.isImpostor}
              category={playerRole.category}
              word={playerRole.word}
            />
            <ClueSubmission
              currentRound={currentRoom.currentRound}
              maxRounds={currentRoom.maxRounds}
              isImpostor={playerRole.isImpostor}
              hasSubmittedClue={hasSubmittedClue}
              clues={(currentRoom.clues as any) || []}
              isHost={isHost}
              totalPlayers={totalPlayers}
              onSubmitClue={handleSubmitClue}
            />
          </div>
        );

      case 'voting':
        return <VotingInterface />;

      case 'finalGuess':
        if (gameResults?.gameEnded) {
          return <ResultsScreen gameState="finished" results={gameResults} />;
        }
        return <ResultsScreen gameState="finalGuess" results={gameResults} />;

      case 'finished':
        return <ResultsScreen gameState="finished" results={gameResults} />;

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-4">
              Game Starting Soon...
            </h2>
            <p className="text-white/60">
              Get ready to find the impostor!
            </p>
          </div>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <GameHeader
        roomCode={currentRoom.code}
        isConnected={isConnected}
        onLeaveRoom={handleLeaveRoom}
        onCopyCode={handleCopyCode}
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-1">
          <PlayerList players={currentRoom.players} />
        </div>

        <div className="lg:col-span-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-white/20 h-full">
            {renderGameContent()}
          </div>
        </div>
      </div>
    </div>
  );
}