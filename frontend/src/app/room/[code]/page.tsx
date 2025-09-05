// src/app/room/[code]/page.tsx - Mobile-responsive version
'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSocket } from '@/contexts/SocketContext';
import { useGameState } from '@/hooks/useGameState';
import { ArrowLeft, Copy, ArrowRight, Vote, Users, Crown, Trophy } from 'lucide-react';

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
import ConnectionStatus from '@/components/ui/ConnectionStatus';

export default function RoomPage() {
  const params = useParams();
  const code = params.code as string;
  const router = useRouter();
  
  // ALL useState hooks must come first
  const [showGameStart, setShowGameStart] = useState(false);
  const [gameStartTriggered, setGameStartTriggered] = useState(false);
  const [showVoteTransition, setShowVoteTransition] = useState(false);
  const [voteTransitionTriggered, setVoteTransitionTriggered] = useState<string | null>(null);
  const [showEndGameTransitions, setShowEndGameTransitions] = useState(false);
  
  // ALL custom hooks must come next
  const { 
    isConnected,
    connectionState,
    leaveRoom, 
    startGame, 
    submitClue, 
    voteNextRound,
    voteReadyToVote,
    submitVote,
    submitFinalGuess,
    playAgain,
    currentRoom,
    currentTimer,
    socket
  } = useSocket();

  const {
    playerRole,
    isHost,
    hasSubmittedClue,
    setHasSubmittedClue,
    gameResults,
    totalPlayers,
    currentPhase,
    playerVotedNextRound,
    playerVotedToVote,
    nextRoundVotes,
    readyToVoteVotes
  } = useGameState();

  // ALL useEffect hooks must come before any conditional returns
  useEffect(() => {
    if (currentRoom?.gameState === 'playing' && playerRole && !gameStartTriggered) {
      console.log('Game started, triggering GameStart sequence');
      setShowGameStart(true);
      setGameStartTriggered(true);
    }
  }, [currentRoom?.gameState, playerRole, gameStartTriggered]);

  useEffect(() => {
    if (currentRoom?.gameState === 'finished' && gameResults && !showEndGameTransitions) {
      console.log('Game finished, starting EndGame transitions (delaying points)');
      setShowEndGameTransitions(true);
    }
  }, [currentRoom?.gameState, gameResults, showEndGameTransitions]);

  useEffect(() => {
    if (currentRoom?.gameState === 'waiting') {
      console.log('Game ended/reset, resetting all transition states');
      setShowGameStart(false);
      setGameStartTriggered(false);
      setShowVoteTransition(false);
      setVoteTransitionTriggered(null);
      setShowEndGameTransitions(false);
    }
  }, [currentRoom?.gameState]);

  useEffect(() => {
    if (!currentRoom) return;
    
    const majorityThreshold = Math.ceil(totalPlayers / 2);
    const transitionKey = `room-vote-${currentRoom.currentRound}`;
    
    const shouldTrigger = currentRoom.gamePhase === 'voting' && 
                         currentRoom.gameState === 'voting' && 
                         voteTransitionTriggered !== transitionKey;
    
    if (shouldTrigger) {
      console.log('Voting phase detected - showing transition');
      setShowVoteTransition(true);
      setVoteTransitionTriggered(transitionKey);
    }
  }, [currentRoom?.gamePhase, currentRoom?.gameState, currentRoom?.currentRound, voteTransitionTriggered, readyToVoteVotes, totalPlayers]);

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

  const handleGameStartComplete = () => {
    console.log('GameStart sequence completed');
    setShowGameStart(false);
  };

  const handleVoteTransitionComplete = () => {
    console.log('Vote transition completed at room level');
    setShowVoteTransition(false);
  };

  const handleEndGameTransitionsComplete = () => {
    console.log('EndGame transitions completed, showing final points');
    setShowEndGameTransitions(false);
  };

  // Animated Background Component
  const AnimatedBackground = () => (
    <div className="absolute inset-0 opacity-75">
      <svg className="w-full h-full" viewBox="0 0 1200 800" preserveAspectRatio="none">
        <defs>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#9333ea" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#c084fc" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#9333ea" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {[
          { id: 'wave1', d: 'M -100 200 Q 190 150 600 200 T 1200 200', opacity: 1 },
          { id: 'wave2', d: 'M -100 350 Q 200 300 900 350 T 1200 350', opacity: 0.5 },
          { id: 'wave3', d: 'M -100 500 Q 250 550 600 500 T 1200 500', opacity: 0.4 },
        ].map((wave, idx) => (
          <path
            key={idx}
            id={wave.id}
            d={wave.d}
            stroke="url(#lineGradient)"
            strokeWidth="1.5"
            fill="none"
            opacity={wave.opacity}
          />
        ))}

        {[
          { path: '#wave1', dur: '16s' },
          { path: '#wave2', dur: '20s' },
          { path: '#wave3', dur: '24s' },
        ].map((particle, idx) => (
          <polygon
            key={idx}
            points="0,-4 4,0 0,4 -4,0"
            fill="#a855f7"
            stroke="black"
            strokeWidth="0.5"
            opacity="0.8"
          >
            <animateMotion
              dur={particle.dur}
              repeatCount="indefinite"
              begin="1s"
              rotate="auto"
            >
              <mpath href={particle.path} />
            </animateMotion>
          </polygon>
        ))}
      </svg>
    </div>
  );

  // Mobile Timer Display Component
  const MobileTimerDisplay = () => {
    if (!currentTimer && currentRoom?.gameState !== 'playing') return null;

    return (
      <div className="bg-[#1a1a2e]/60 backdrop-blur-lg rounded-xl p-4 shadow-2xl border border-[#9333ea]/30 mb-4">
        <div className="flex items-center justify-between">
          {/* Timer */}
          <div className="flex items-center">
            <div className="w-2 h-2 bg-[#c084fc] rounded-full mr-2"></div>
            {currentTimer ? (
              <div className="text-center">
                <div className="text-2xl font-bold text-[#c084fc]">
                  {Math.floor(currentTimer.timeLeft / 60)}:{(currentTimer.timeLeft % 60).toString().padStart(2, '0')}
                </div>
                <div className="text-[#9ca3af] text-xs">
                  {currentTimer.phase === 'writing' ? 'Writing' : 
                   currentTimer.phase === 'decision' ? 'Decide' : 
                   currentTimer.phase === 'voting' ? 'Voting' : 
                   currentTimer.phase}
                </div>
              </div>
            ) : (
              <div className="text-lg font-bold text-[#c084fc]">Game Active</div>
            )}
          </div>

          {/* Round Info */}
          <div className="text-center">
            <div className="text-[#9ca3af] text-xs">Round</div>
            <div className="text-white font-bold">
              {currentRoom?.currentRound || 1}/{currentRoom?.maxRounds || 5}
            </div>
          </div>

          {/* Players Count */}
          <div className="flex items-center">
            <Users className="w-4 h-4 text-[#c084fc] mr-1" />
            <span className="text-[#c084fc] font-medium">
              {currentRoom?.players.length || 0}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // Mobile Players List Component (horizontal pills)
  const MobilePlayersList = () => {
    if (!currentRoom?.players) return null;

    const getSortedPlayers = (playerList: any[]) => {
      return [...playerList].sort((a, b) => {
        if (a.isHost && !b.isHost) return -1;
        if (!a.isHost && b.isHost) return 1;
        return a.name.localeCompare(b.name);
      });
    };

    const displayPlayers = getSortedPlayers(currentRoom.players);

    return (
      <div className="bg-[#1a1a2e]/60 backdrop-blur-lg rounded-xl p-4 shadow-2xl border border-[#9333ea]/30 mb-4">
        <div className="flex flex-wrap gap-2">
          {displayPlayers.map((player: any) => (
            <div
              key={player.id}
              className="flex items-center bg-[#1a1a2e]/60 rounded-lg px-3 py-2 border border-[#9333ea]/20"
            >
              <div className="w-6 h-6 bg-[#9333ea] rounded-full flex items-center justify-center text-white font-semibold text-xs mr-2">
                {player.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex items-center">
                <span className="text-white text-sm font-medium mr-1">
                  {player.name}
                </span>
                {player.isHost && (
                  <Crown className="w-3 h-3 text-yellow-400 mr-1" />
                )}
                <div className="flex items-center">
                  <Trophy className="w-3 h-3 text-[#c084fc] mr-1" />
                  <span className="text-[#c084fc] text-xs">
                    {player.points || 0}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Mobile Role Display Component (compact banner)
  const MobileRoleDisplay = () => {
    if (!playerRole || showGameStart) return null;

    return (
      <div className={`rounded-xl p-4 mb-4 border ${
        playerRole.isImpostor 
          ? 'bg-red-500/10 border-red-500/30' 
          : 'bg-blue-500/10 border-blue-500/30'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-lg mr-2">
              {playerRole.isImpostor ? '🎭' : '🕵️'}
            </span>
            <div>
              <div className={`font-bold text-sm ${
                playerRole.isImpostor ? 'text-red-300' : 'text-blue-300'
              }`}>
                {playerRole.isImpostor ? 'IMPOSTOR' : 'DETECTIVE'}
              </div>
              <div className="text-[#9ca3af] text-xs">
                {playerRole.isImpostor ? `Category: ${playerRole.category}` : `Word: ${playerRole.word}`}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Mobile Actions Component
  const MobileActions = () => {
    if (currentRoom?.gameState !== 'playing' || currentRoom?.gamePhase !== 'decision') {
      return null;
    }

    return (
      <div className="bg-[#1a1a2e]/60 backdrop-blur-lg rounded-xl p-4 shadow-2xl border border-[#9333ea]/30 mb-4">
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={voteNextRound}
            disabled={currentRoom?.readyToVoteVotes?.includes(socket?.id || '')}
            className={`px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
              currentRoom?.nextRoundVotes?.includes(socket?.id || '')
                ? 'bg-[#9333ea]/30 text-[#c084fc] border-2 border-[#9333ea]'
                : 'bg-[#9333ea] hover:bg-[#a855f7] text-white disabled:opacity-50'
            }`}
          >
            <div className="flex items-center justify-center">
              <ArrowRight className="w-4 h-4 mr-1" />
              Next Round
            </div>
            <div className="text-xs opacity-80 mt-1">
              Round {(currentRoom.currentRound || 1) + 1}
            </div>
          </button>

          <button 
            onClick={voteReadyToVote}
            disabled={currentRoom?.nextRoundVotes?.includes(socket?.id || '')}
            className={`px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
              currentRoom?.readyToVoteVotes?.includes(socket?.id || '')
                ? 'bg-red-500/30 text-red-300 border-2 border-red-400'
                : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 disabled:opacity-50'
            }`}
          >
            <div className="flex items-center justify-center">
              <Vote className="w-4 h-4 mr-1" />
              Vote Now
            </div>
            <div className="text-xs opacity-80 mt-1">
              Skip voting
            </div>
          </button>
        </div>
        
        {/* Voting Progress */}
        <div className="bg-[#1a1a2e]/60 backdrop-blur-sm rounded-lg p-3 border border-[#9333ea]/20 mt-3">
          <div className="grid grid-cols-2 gap-2 text-center">
            <div>
              <div className="text-[#c084fc] font-semibold text-sm">
                {currentRoom?.nextRoundVotes?.length || 0}
              </div>
              <div className="text-[#9ca3af] text-xs">Next Round</div>
            </div>
            <div>
              <div className="text-red-300 font-semibold text-sm">
                {currentRoom?.readyToVoteVotes?.length || 0}
              </div>
              <div className="text-[#9ca3af] text-xs">Vote Now</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Show connection status overlay when not connected
  if (connectionState !== 'connected') {
    return <ConnectionStatus />;
  }

  // Show loading state while room data loads
  if (!currentRoom) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden"
        style={{ backgroundColor: '#0f0f1a' }}
      >
        <AnimatedBackground />
        <div className="bg-[#1a1a2e]/60 backdrop-blur-lg rounded-xl p-8 shadow-2xl border border-[#9333ea]/30 relative z-10 max-w-sm w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#9333ea] mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Joining room...
            </h2>
            <p className="text-[#9ca3af]">
              Room code: {code}
            </p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-4 py-2 bg-red-500/80 hover:bg-red-500 text-white rounded-lg transition-colors w-full"
            >
              Cancel & Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show vote transition if active
  if (showVoteTransition) {
    return (
      <div 
        className="min-h-screen relative overflow-hidden"
        style={{ backgroundColor: '#0f0f1a' }}
      >
        <AnimatedBackground />
        <div className="max-w-4xl mx-auto p-4 relative z-10">
          {/* Mobile Header */}
          <div className="bg-[#1a1a2e]/60 backdrop-blur-lg rounded-xl p-4 shadow-2xl border border-[#9333ea]/30 mb-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleLeaveRoom}
                className="flex items-center text-[#9ca3af] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Leave
              </button>
              
              <h1 className="text-lg font-bold text-white">
                Room {currentRoom.code}
              </h1>

              <button
                onClick={handleCopyCode}
                className="flex items-center px-3 py-1.5 bg-[#9333ea]/20 hover:bg-[#9333ea]/30 text-[#c084fc] hover:text-white rounded-lg transition-colors border border-[#9333ea]/30 text-sm"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </button>
            </div>
          </div>

          <MobileTimerDisplay />
          <MobilePlayersList />
          {playerRole && <MobileRoleDisplay />}

          <div className="bg-[#1a1a2e]/60 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-[#9333ea]/30">
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
        if (!playerRole || !gameStartTriggered) {
          return (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#9333ea] border-t-transparent mx-auto mb-6"></div>
                <h2 className="text-xl font-bold text-white mb-2">
                  Starting Game...
                </h2>
                <p className="text-[#9ca3af] text-sm">
                  Assigning roles and preparing everything
                </p>
              </div>
            </div>
          );
        }

        if (showGameStart) {
          return (
            <GameStartSequence
              playerRole={playerRole}
              onComplete={handleGameStartComplete}
            />
          );
        }

        return (
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
        );

      case 'voting':
        return <VotingInterface />;

      case 'finalGuess':
        if (gameResults?.gameEnded) {
          return (
            <ResultsScreen 
              gameState="finished" 
              results={gameResults}
              onEndGameTransitionsComplete={handleEndGameTransitionsComplete}
            />
          );
        }
        return (
          <ResultsScreen 
            gameState="finalGuess" 
            results={gameResults}
            onEndGameTransitionsComplete={handleEndGameTransitionsComplete}
          />
        );

      case 'finished':
        return (
          <ResultsScreen 
            gameState="finished" 
            results={gameResults}
            onEndGameTransitionsComplete={handleEndGameTransitionsComplete}
          />
        );

      default:
        return (
          <div className="text-center py-12">
            <h2 className="text-xl font-bold text-white mb-4">
              Game Starting Soon...
            </h2>
            <p className="text-[#9ca3af]">
              Get ready to find the impostor!
            </p>
          </div>
        );
    }
  };

  return (
    <div 
      className="min-h-screen relative overflow-hidden"
      style={{ backgroundColor: '#0f0f1a' }}
    >
      <AnimatedBackground />
      
      {/* RESPONSIVE LAYOUT - Desktop: 3-column, Mobile: Stacked */}
      <div className="relative z-10">
        {/* DESKTOP LAYOUT - Hidden on mobile (md and below) */}
        <div className="hidden lg:flex h-screen">
          {/* Left Sidebar - Timer + Players */}
          <div className="w-1/4 p-4 flex flex-col">
            {/* Timer Section */}
            <div className="bg-[#1a1a2e]/60 backdrop-blur-lg rounded-xl p-6 shadow-2xl border border-[#9333ea]/30 mb-4">
              <div className="flex items-center mb-3">
                <div className="w-2 h-2 bg-[#c084fc] rounded-full mr-2"></div>
                <h3 className="text-[#c084fc] font-medium">Game Status</h3>
              </div>
              
              {currentTimer ? (
                <div className="text-center">
                  <div className="text-4xl font-bold text-[#c084fc] mb-2">
                    {Math.floor(currentTimer.timeLeft / 60)}:{(currentTimer.timeLeft % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-[#9ca3af] text-sm">
                    {currentTimer.phase === 'writing' ? 'Writing Phase' : 
                     currentTimer.phase === 'decision' ? 'Review & Decide' : 
                     currentTimer.phase === 'voting' ? 'Voting Phase' : 
                     currentTimer.phase}
                  </div>
                  <div className="text-[#9ca3af] text-xs mt-1">
                    Round {currentRoom.currentRound || 1}/{currentRoom.maxRounds || 5}
                  </div>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-2xl font-bold text-[#c084fc] mb-2">
                    Game Active
                  </div>
                  <div className="text-[#9ca3af] text-sm">
                    Round {currentRoom.currentRound || 1}/{currentRoom.maxRounds || 5}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Players List */}
            <div className="flex-1">
              <PlayerList 
                players={currentRoom.players} 
                delayPointsUpdate={showEndGameTransitions}
              />
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 p-4">
            <div className="bg-[#1a1a2e]/60 backdrop-blur-lg rounded-xl shadow-2xl border border-[#9333ea]/30 h-full flex flex-col">
              {/* Header */}
              <div className="p-4 border-b border-[#9333ea]/20">
                <div className="flex items-center justify-between">
                  <button
                    onClick={handleLeaveRoom}
                    className="flex items-center text-[#9ca3af] hover:text-white transition-colors"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Leave Room
                  </button>
                  
                  <h1 className="text-xl font-bold text-white">
                    Room {currentRoom.code}
                  </h1>

                  <button
                    onClick={handleCopyCode}
                    className="flex items-center px-3 py-1.5 bg-[#9333ea]/20 hover:bg-[#9333ea]/30 text-[#c084fc] hover:text-white rounded-lg transition-colors border border-[#9333ea]/30 text-sm"
                  >
                    <Copy className="w-3 h-3 mr-2" />
                    Copy
                  </button>
                </div>
              </div>

              {/* Main game content */}
              <div className="flex-1 p-6 overflow-auto">
                {renderGameContent()}
              </div>
            </div>
          </div>

          {/* Right Sidebar - Role + Actions */}
          <div className="w-1/4 p-4 flex flex-col">
            {/* Desktop Role Display */}
            {playerRole && !showGameStart && (
              <div className="mb-4">
                <div className="bg-[#1a1a2e]/60 backdrop-blur-lg rounded-xl p-4 shadow-2xl border border-[#9333ea]/30">
                  <div className="flex items-center mb-3">
                    <div className="w-6 h-6 bg-[#9333ea] rounded-full flex items-center justify-center mr-2">
                      <div className="w-3 h-3 bg-white rounded-full"></div>
                    </div>
                    <h3 className="text-white font-medium">Your Role</h3>
                  </div>
                  
                  <div className="text-center">
                    <div className={`px-4 py-2 rounded-lg font-bold text-sm ${
                      playerRole.isImpostor 
                        ? 'bg-red-500/20 text-red-300 border border-red-500/30' 
                        : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                    }`}>
                      {playerRole.isImpostor ? 'Impostor' : 'Detective'}
                    </div>
                    
                    {playerRole.isImpostor && playerRole.category && (
                      <div className="mt-2 text-xs text-[#9ca3af]">
                        Category: {playerRole.category}
                      </div>
                    )}
                    
                    {!playerRole.isImpostor && playerRole.word && (
                      <div className="mt-2 text-xs text-[#9ca3af]">
                        Word: {playerRole.word}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Desktop Actions Panel */}
            <div className="bg-[#1a1a2e]/60 backdrop-blur-lg rounded-xl p-4 shadow-2xl border border-[#9333ea]/30">
              <h3 className="text-white font-medium mb-4">Actions</h3>
              
              <div className="space-y-3">
                {currentRoom.gameState === 'playing' && currentRoom.gamePhase === 'decision' && (
                  <>
                    <button 
                      onClick={voteNextRound}
                      disabled={currentRoom?.readyToVoteVotes?.includes(socket?.id || '')}
                      className={`w-full px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
                        currentRoom?.nextRoundVotes?.includes(socket?.id || '')
                          ? 'bg-[#9333ea]/30 text-[#c084fc] border-2 border-[#9333ea]'
                          : 'bg-[#9333ea] hover:bg-[#a855f7] text-white disabled:opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <ArrowRight className="w-4 h-4 mr-2" />
                        Next Round
                      </div>
                      <div className="text-xs opacity-80 mt-1">
                        Continue to Round {(currentRoom.currentRound || 1) + 1}
                      </div>
                      {currentRoom?.nextRoundVotes?.includes(socket?.id || '') && (
                        <div className="text-xs text-[#c084fc] mt-1">You voted</div>
                      )}
                    </button>

                    <button 
                      onClick={voteReadyToVote}
                      disabled={currentRoom?.nextRoundVotes?.includes(socket?.id || '')}
                      className={`w-full px-4 py-3 rounded-lg transition-colors font-medium text-sm ${
                        currentRoom?.readyToVoteVotes?.includes(socket?.id || '')
                          ? 'bg-red-500/30 text-red-300 border-2 border-red-400'
                          : 'bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 border border-red-500/30 disabled:opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        <Vote className="w-4 h-4 mr-2" />
                        Vote Now
                      </div>
                      <div className="text-xs opacity-80 mt-1">
                        Skip to voting phase
                      </div>
                      {currentRoom?.readyToVoteVotes?.includes(socket?.id || '') && (
                        <div className="text-xs text-red-300 mt-1">You voted</div>
                      )}
                    </button>

                    {/* Desktop Voting Progress */}
                    <div className="bg-[#1a1a2e]/60 backdrop-blur-sm rounded-lg p-3 border border-[#9333ea]/20 mt-4">
                      <div className="text-center">
                        <div className="text-[#9ca3af] text-xs mb-2">Decision Progress:</div>
                        <div className="grid grid-cols-2 gap-2 text-center">
                          <div>
                            <div className="text-[#c084fc] font-semibold text-sm">
                              {currentRoom?.nextRoundVotes?.length || 0}
                            </div>
                            <div className="text-[#9ca3af] text-xs">Next Round</div>
                          </div>
                          <div>
                            <div className="text-red-300 font-semibold text-sm">
                              {currentRoom?.readyToVoteVotes?.length || 0}
                            </div>
                            <div className="text-[#9ca3af] text-xs">Vote Now</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {currentRoom.gameState === 'playing' && currentRoom.gamePhase !== 'decision' && (
                  <div className="bg-[#1a1a2e]/40 rounded-lg p-3 border border-[#9333ea]/20">
                    <p className="text-[#9ca3af] text-sm text-center">
                      Actions available during review phase
                    </p>
                  </div>
                )}

                <button
                  onClick={handleLeaveRoom}
                  className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-300 hover:text-red-200 rounded-lg transition-colors border border-red-500/30 font-medium"
                >
                  <div className="flex items-center justify-center">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Leave Room
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE LAYOUT - Visible on mobile/tablet (lg and below) */}
        <div className="lg:hidden min-h-screen p-4">
          {/* Mobile Header */}
          <div className="bg-[#1a1a2e]/60 backdrop-blur-lg rounded-xl p-4 shadow-2xl border border-[#9333ea]/30 mb-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleLeaveRoom}
                className="flex items-center text-[#9ca3af] hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Leave
              </button>
              
              <h1 className="text-lg font-bold text-white">
                Room {currentRoom.code}
              </h1>

              <button
                onClick={handleCopyCode}
                className="flex items-center px-3 py-1.5 bg-[#9333ea]/20 hover:bg-[#9333ea]/30 text-[#c084fc] hover:text-white rounded-lg transition-colors border border-[#9333ea]/30 text-sm"
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </button>
            </div>
          </div>

          {/* Mobile Stacked Layout */}
          <MobileTimerDisplay />
          <MobilePlayersList />
          <MobileRoleDisplay />
          <MobileActions />

          {/* Mobile Main Content */}
          <div className="bg-[#1a1a2e]/60 backdrop-blur-lg rounded-xl p-4 shadow-2xl border border-[#9333ea]/30">
            {renderGameContent()}
          </div>
        </div>
      </div>
    </div>
  );
}